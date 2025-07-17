import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, fallback } from 'viem';
import { polygon } from 'wagmi/chains';

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

// In-memory cache for top 5 ranks per roundId
const topRanksCache = new Map(); // key: roundId, value: { data, round, timestamp }
const MAX_CACHE_SIZE = 10; // Keep cache for last 10 rounds (prune old)

function pruneCache() {
  if (topRanksCache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries
    const keys = Array.from(topRanksCache.keys());
    for (let i = 0; i < keys.length - MAX_CACHE_SIZE; i++) {
      topRanksCache.delete(keys[i]);
    }
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
    if (topRanksCache.has(currentRound)) {
      const cached = topRanksCache.get(currentRound);
      return NextResponse.json({
        success: true,
        data: cached.data,
        round: cached.round,
        timestamp: cached.timestamp,
        cached: true
      });
    }

    console.log(`🔍 Fetching top 5 ranks for round ${currentRound}`);

    // Step 1: Find all tickets with ranks 1-5
    const maxTicketsToCheck = 100; // Check more tickets to ensure we find all ranks 1-5
    const ticketNumbers = Array.from({ length: maxTicketsToCheck }, (_, i) => i + 1);
    
    console.log(`📊 Checking ${maxTicketsToCheck} tickets for ranks...`);
    
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

    // Filter and sort tickets with ranks 1-5
    const rankedTickets = ticketRanks
      .filter(t => t.rank > 0 && t.rank <= 5)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5);

    console.log(`🏆 Found ${rankedTickets.length} tickets with ranks 1-5:`, rankedTickets);

    if (rankedTickets.length === 0) {
      // Cache empty result
      topRanksCache.set(currentRound, {
        data: [],
        round: currentRound,
        timestamp: Date.now()
      });
      pruneCache();
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
    topRanksCache.set(currentRound, {
      data: validDetailedTickets,
      round: currentRound,
      timestamp: Date.now()
    });
    pruneCache();

    return NextResponse.json({
      success: true,
      data: validDetailedTickets,
      round: currentRound,
      timestamp: Date.now(),
      totalChecked: maxTicketsToCheck,
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