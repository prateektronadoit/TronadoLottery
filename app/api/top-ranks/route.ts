import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, fallback } from 'viem';
import { polygon } from 'wagmi/chains';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Contract configuration
const CONTRACT_ADDRESSES = {
  LOTTERY: '0xDaeD50C7eE02406b6017b4ABE5E413b08D819647',
};

// Contract ABI - only the functions we need
const LOTTERY_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      { internalType: "uint256", name: "ticketNumber", type: "uint256" }
    ],
    name: "getTicketRank",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      { internalType: "uint256", name: "ticketNumber", type: "uint256" }
    ],
    name: "getTicketOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      { internalType: "uint256", name: "ticketNumber", type: "uint256" }
    ],
    name: "calculateTicketPrize",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

// Create public client with multiple RPC endpoints and fallback
const publicClient = createPublicClient({
  chain: polygon,
  transport: fallback([
    http('https://polygon-rpc.com', {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 3,
      retryDelay: 1000
    }),
    http('https://rpc-mainnet.maticvigil.com', {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 3,
      retryDelay: 1000
    }),
    http('https://rpc-mainnet.matic.network', {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 3,
      retryDelay: 1000
    }),
    http('https://polygon.llamarpc.com', {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 3,
      retryDelay: 1000
    })
  ])
});

// Persistent file-based cache for top 3 ranks per roundId
const CACHE_DIR = join(process.cwd(), '.cache');
const CACHE_FILE = join(CACHE_DIR, 'top-ranks-cache.json');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

// Load cache from file
function loadCache(): Map<string, any> {
  try {
    if (existsSync(CACHE_FILE)) {
      const cacheData = readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(cacheData);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.warn('Error loading cache from file:', error);
  }
  return new Map();
}

// Save cache to file
function saveCache(cache: Map<string, any>) {
  try {
    const cacheObject = Object.fromEntries(cache);
    writeFileSync(CACHE_FILE, JSON.stringify(cacheObject, null, 2));
  } catch (error) {
    console.warn('Error saving cache to file:', error);
  }
}

// Initialize cache
const topRanksCache = loadCache();
console.log(`📁 Loaded ${topRanksCache.size} cached rounds from disk`);

// Function to get current round from contract
async function getCurrentRoundFromContract(): Promise<number> {
  try {
    const currentRoundId = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
      abi: [
        {
          inputs: [],
          name: "currentRoundId",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: 'currentRoundId',
    });
    return Number(currentRoundId);
  } catch (error) {
    console.warn('Could not get current round from contract:', error);
    return 0;
  }
}

function pruneCache() {
  if (topRanksCache.size > 30) {
    // Remove oldest entries (keep last 30 rounds)
    const entries = Array.from(topRanksCache.entries());
    const sortedEntries = entries.sort((a, b) => {
      // Sort by round number first, then by timestamp
      const roundA = parseInt(a[0]);
      const roundB = parseInt(b[0]);
      if (roundA !== roundB) {
        return roundB - roundA; // Keep newer rounds
      }
      return b[1].timestamp - a[1].timestamp;
    });
    const toKeep = sortedEntries.slice(0, 30);
    
    const removedCount = topRanksCache.size - toKeep.length;
    if (removedCount > 0) {
      console.log(`🧹 Pruned ${removedCount} old cache entries, keeping ${toKeep.length} most recent rounds`);
    }
    
    topRanksCache.clear();
    toKeep.forEach(([key, value]) => topRanksCache.set(key, value));
    
    // Save pruned cache
    saveCache(topRanksCache);
  }
}

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimitError = (error: any): boolean => {
  if (!error) return false;
  const errorMessage = typeof error === 'string' ? error : 
    (error.message || error.toString() || '');
  return errorMessage.includes('429') || 
         errorMessage.includes('Too Many Requests') ||
         errorMessage.includes('rate limit');
};

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      if (isRateLimitError(error)) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(`Rate limit hit, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await delay(backoffDelay);
      } else {
        await delay(500);
      }
    }
  }
  throw new Error('Max retries exceeded');
};

const batchWithRateLimit = async <T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
  delayBetweenBatches: number = 500
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      const batchResults = await Promise.all(
        batch.map(item => retryWithBackoff(() => processor(item)))
      );
      results.push(...batchResults);
    } catch (error) {
      console.warn(`Batch failed, continuing with next batch:`, error);
    }
    
    if (i + batchSize < items.length) {
      await delay(delayBetweenBatches);
    }
  }
  
  return results;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('roundId');
    
    if (!roundId) {
      return NextResponse.json(
        { error: 'roundId parameter is required' },
        { status: 400 }
      );
    }

    const currentRound = parseInt(roundId);
    if (isNaN(currentRound) || currentRound <= 0) {
      return NextResponse.json(
        { error: 'Invalid roundId' },
        { status: 400 }
      );
    }

    // Check cache first
    if (topRanksCache.has(currentRound.toString())) {
      const cached = topRanksCache.get(currentRound.toString());
      console.log(`✅ Returning cached data for round ${currentRound} (${cached.data.length} tickets)`);
      return NextResponse.json({
        success: true,
        data: cached.data,
        round: cached.round,
        timestamp: cached.timestamp,
        cached: true
      });
    }
    
    // Clean up old cache entries when accessing a new round
    // This ensures we don't keep too many old rounds in memory
    pruneCache();
    
    // If this is a significantly new round, clean up very old rounds
    const existingRounds = Array.from(topRanksCache.keys()).map(Number).sort((a, b) => a - b);
    if (existingRounds.length > 0) {
      const oldestRound = existingRounds[0];
      const roundDifference = currentRound - oldestRound;
      
      // If we're accessing a round that's 10+ rounds ahead of the oldest cached round,
      // clean up rounds that are more than 5 rounds behind the current round
      if (roundDifference > 10) {
        const roundsToRemove = existingRounds.filter(round => round < currentRound - 5);
        roundsToRemove.forEach(round => {
          topRanksCache.delete(round.toString());
          console.log(`🗑️ Removed very old cache for round ${round} (current: ${currentRound})`);
        });
        
        if (roundsToRemove.length > 0) {
          saveCache(topRanksCache);
        }
      }
    }
    
    // Log cache status for monitoring
    console.log(`📊 Cache status: ${topRanksCache.size} rounds cached, accessing round ${currentRound}`);
    if (existingRounds.length > 0) {
      console.log(`📊 Cached rounds: ${Math.min(...existingRounds)} to ${Math.max(...existingRounds)}`);
    }
    
    console.log(`❌ No cache found for round ${currentRound}, fetching from blockchain...`);

    console.log(`🔍 Fetching top 3 ranks for round ${currentRound}`);

    // Step 1: Find all tickets with ranks 1-3
    // First, let's check how many tickets were sold in this round
    let totalTicketsSold = 0;
    try {
      const roundInfo = await retryWithBackoff(() =>
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
          abi: [
            {
              inputs: [{ internalType: "uint256", name: "roundId", type: "uint256" }],
              name: "getRoundInfo",
              outputs: [{ internalType: "tuple", name: "", type: "tuple" }],
              stateMutability: "view",
              type: "function"
            }
          ],
          functionName: 'getRoundInfo',
          args: [BigInt(currentRound)]
        })
      );
      totalTicketsSold = Number((roundInfo as any[])[2]); // ticketsSold is at index 2
      console.log(`📊 Total tickets sold in round ${currentRound}: ${totalTicketsSold}`);
    } catch (error) {
      console.warn('Could not get total tickets sold, using default 100:', error);
      totalTicketsSold = 100;
    }

    // Check ALL sold tickets to find ranks 1-3
    // No limits - search through every single ticket sold in the round
    const ticketNumbers = Array.from({ length: totalTicketsSold }, (_, i) => i + 1);
    
    console.log(`📊 Checking ALL ${totalTicketsSold} tickets for ranks 1-3...`);
    
    console.log(`📊 Checking ${totalTicketsSold} tickets for ranks 1-3...`);
    
    const ticketRanks = await batchWithRateLimit(
      ticketNumbers,
      5, // Small batch size for better rate limiting
      async (ticketNumber) => {
        try {
          const rank = await retryWithBackoff(() =>
            publicClient.readContract({
              address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
              abi: LOTTERY_ABI,
              functionName: 'getTicketRank',
              args: [BigInt(currentRound), BigInt(ticketNumber)]
            })
          );
          return { ticketNumber, rank: Number(rank) };
        } catch (error) {
          console.warn(`Failed to get rank for ticket ${ticketNumber}:`, error);
          return { ticketNumber, rank: 0 };
        }
      },
      800 // Longer delay between batches
    );

    // Filter and sort tickets with ranks 1-3
    const rankedTickets = ticketRanks
      .filter(t => t.rank > 0 && t.rank <= 3)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3);

    // Debug: Show all ranks found
    const allRanksFound = ticketRanks.filter(t => t.rank > 0).sort((a, b) => a.rank - b.rank);
    console.log(`🔍 All ranks found in ${totalTicketsSold} tickets:`, allRanksFound);
    console.log(`🔍 All tickets with ranks 1-3 found:`, ticketRanks.filter(t => t.rank > 0 && t.rank <= 3));

    console.log(`🏆 Found ${rankedTickets.length} tickets with ranks 1-3:`, rankedTickets);
``
    // We've already checked all tickets, so if we don't have 3 ranks, that's all there are
    if (rankedTickets.length < 3) {
      console.log(`⚠️ Only found ${rankedTickets.length} ranks out of ${totalTicketsSold} tickets checked`);
    }

    if (rankedTickets.length === 0) {
      // Cache empty result
      topRanksCache.set(currentRound.toString(), {
        data: [],
        round: currentRound,
        timestamp: Date.now()
      });
      saveCache(topRanksCache);
      return NextResponse.json({
        success: true,
        data: [],
        round: currentRound,
        timestamp: Date.now(),
        message: 'No ranked tickets found for this round',
        cached: false
      });
    }

    // Step 2: Fetch details for the ranked tickets
    console.log(`📋 Fetching details for ${rankedTickets.length} tickets...`);
    
    const detailedTickets = await batchWithRateLimit(
      rankedTickets,
      1, // Process one ticket at a time for better reliability
      async (ticket) => {
        try {
          // Fetch owner and prize sequentially to avoid rate limiting
          const owner = await retryWithBackoff(() =>
            publicClient.readContract({
              address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
              abi: LOTTERY_ABI,
              functionName: 'getTicketOwner',
              args: [BigInt(currentRound), BigInt(ticket.ticketNumber)]
            })
          );

          const rawPrize = await retryWithBackoff(() =>
            publicClient.readContract({
              address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
              abi: LOTTERY_ABI,
              functionName: 'calculateTicketPrize',
              args: [BigInt(currentRound), BigInt(ticket.ticketNumber)]
            })
          );

          // Convert prize to ether
          const prizeInWei = BigInt(rawPrize as string | number | bigint);
          const prizeInEther = Number(prizeInWei) / Math.pow(10, 18);

          return {
            ticketNumber: ticket.ticketNumber,
            rank: ticket.rank,
            owner: owner as string,
            prize: prizeInEther.toFixed(6)
          };
        } catch (error) {
          console.warn(`Error fetching details for ticket ${ticket.ticketNumber}:`, error);
          return null;
        }
      },
      500 // Delay between tickets
    );

    // Filter out null results
    const validDetailedTickets = detailedTickets.filter(ticket => ticket !== null);

    console.log(`✅ Successfully fetched ${validDetailedTickets.length} ticket details`);

    // Cache the result
    topRanksCache.set(currentRound.toString(), {
      data: validDetailedTickets,
      round: currentRound,
      timestamp: Date.now()
    });
    saveCache(topRanksCache);

    return NextResponse.json({
      success: true,
      data: validDetailedTickets,
      round: currentRound,
      timestamp: Date.now(),
      totalChecked: totalTicketsSold,
      foundRanks: rankedTickets.length,
      cached: false
    });

  } catch (error) {
    console.error('❌ Error in top-ranks API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch top ranks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 