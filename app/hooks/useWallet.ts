'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useDisconnect, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther, createPublicClient, http } from 'viem';
import { polygon } from 'wagmi/chains';
// import { bscTestnet } from 'wagmi/chains';


// Contract addresses - Updated to match reference code
const CONTRACT_ADDRESSES = {
  LOTTERY: '0xDaeD50C7eE02406b6017b4ABE5E413b08D819647', // Reference contract address
  USDT: '0x8d60f559C2461F193913afd10c2d09a09FBa0Bf3'  // USDT token address
};

// Create public client for reading contract data with fallback RPC endpoints
const publicClient = createPublicClient({
  chain: polygon,
  transport: http('https://polygon-rpc.com', {
    batch: {
      batchSize: 10,
      wait: 50
    },
    retryCount: 3,
    retryDelay: 1000
  }),
});

// const publicClient = createPublicClient({
//   chain: bscTestnet,
//   transport: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
// });


// Contract ABIs - Updated with new ABI
const LOTTERY_ABI = [{"inputs":[{"internalType":"address","name":"_usdtToken","type":"address"},{"internalType":"address","name":"_creator","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"DrawExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"bool","name":"isPurchase","type":"bool"}],"name":"MLMEarning","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PrizeClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[10]","name":"newPercentages","type":"uint256[10]"},{"indexed":false,"internalType":"address","name":"updatedBy","type":"address"}],"name":"RankPrizesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalTickets","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ticketPrice","type":"uint256"}],"name":"RoundCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalTransferredToCreator","type":"uint256"}],"name":"RoundSettled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"reason","type":"string"}],"name":"SponsorIncomeReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256[]","name":"ticketNumbers","type":"uint256[]"}],"name":"TicketPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"sponsor","type":"address"}],"name":"UserRegistered","type":"event"},{"inputs":[],"name":"MaxTicketPerRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TotalPlayed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"calculateTicketPrize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"claimLevelPercentages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"claimPrize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"totalTickets","type":"uint256"},{"internalType":"uint256","name":"ticketPrice","type":"uint256"}],"name":"createRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"creator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRoundId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"defaultRankPrizes","outputs":[{"internalType":"uint256","name":"percentage","type":"uint256"},{"internalType":"bool","name":"isGroup","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"executeDraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"finalizeRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getContractStats","outputs":[{"internalType":"uint256","name":"totalRounds","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"},{"internalType":"uint256","name":"activeRound","type":"uint256"},{"internalType":"uint256","name":"totalRegisteredUsers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentRankPrizes","outputs":[{"internalType":"uint256[10]","name":"percentages","type":"uint256[10]"},{"internalType":"bool[10]","name":"isGroupFlags","type":"bool[10]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"getRoundInfo","outputs":[{"internalType":"uint256","name":"totalTickets","type":"uint256"},{"internalType":"uint256","name":"ticketPrice","type":"uint256"},{"internalType":"uint256","name":"ticketsSold","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"drawExecuted","type":"bool"},{"internalType":"bool","name":"allClaimed","type":"bool"},{"internalType":"bool","name":"isSettled","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"getTicketOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"getTicketRank","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalRegisteredUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserLevelCounts","outputs":[{"internalType":"uint256[10]","name":"","type":"uint256[10]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"user","type":"address"}],"name":"getUserTickets","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"user","type":"address"}],"name":"getUserTotalPrize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"isClaimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isUserInArray","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxTicketPurchase","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"purchaseLevelPercentages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"numberOfTickets","type":"uint256"}],"name":"purchaseTickets","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sponsor","type":"address"}],"name":"registerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"registeredUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"roundFinalizationProgress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"roundParticipants","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rounds","outputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"totalTickets","type":"uint256"},{"internalType":"uint256","name":"ticketPrice","type":"uint256"},{"internalType":"uint256","name":"ticketsSold","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"drawExecuted","type":"bool"},{"internalType":"bool","name":"allClaimed","type":"bool"},{"internalType":"bool","name":"isSettled","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_MaxTicketPerRound","type":"uint256"}],"name":"setMaxTicketPerRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxTicketPurchase","type":"uint256"}],"name":"setMaxTicketPurchase","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalOwnersClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalUniqueOwners","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[10]","name":"newPercentages","type":"uint256[10]"}],"name":"updateRankPrizes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdtToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"userLevelCounts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"uint256","name":"totalTicketsPurchased","type":"uint256"},{"internalType":"uint256","name":"totalEarnings","type":"uint256"},{"internalType":"uint256","name":"sponsorIncome","type":"uint256"},{"internalType":"uint256","name":"RewardSponsorIncome","type":"uint256"}],"stateMutability":"view","type":"function"}];
const USDT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
// Custom formatting function for USDT values
const formatUSDT = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  // If the number has no significant decimal places (like 10.0, 25.0), show only 2 decimal places
  if (num % 1 === 0) {
    return num.toFixed(2);
  }
  
  // If the number has significant decimal places, show up to 5 decimal places
  // Remove trailing zeros after the decimal point
  const formatted = num.toFixed(5);
  return formatted.replace(/\.?0+$/, ''); // Remove trailing zeros
};

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({
    currentRound: 0,
    totalTickets: 0,
    ticketsSold: 0,
    ticketPrice: '0',
    prizePool: '0',
    drawExecuted: false,
    winningNumber: 0,
    myTicketsCount: 0,
    myTickets: [],
    isRegistered: false,
    userInfo: null,
    userPurchaseHistory: [],
    totalPlayed: '0'
  });

  // Add state for transaction confirmation
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionType, setTransactionType] = useState<'register' | 'purchase' | 'claim' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get BNB balance
  const { data: bnbBalance } = useBalance({
    address: address,
  });

  // Get USDT balance
  const { data: usdtBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.USDT as `0x${string}`,
  });

  // Contract reads
  const { data: currentRoundId } = useReadContract({
    address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'currentRoundId',
  });

  const { data: roundData } = useReadContract({
    address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getRoundInfo',
    args: [currentRoundId || BigInt('0')],
    query: {
      enabled: !!currentRoundId || currentRoundId === BigInt(0),
    },
  });

  const { data: usdtAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [address, CONTRACT_ADDRESSES.LOTTERY],
    query: {
      enabled: !!address,
    },
  });

  const { data: userInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'users',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  const { data: userTickets, error: userTicketsError } = useReadContract({
    address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getUserTickets',
    args: [currentRoundId || BigInt('0'), address],
    query: {
      enabled: !!address && (!!currentRoundId || currentRoundId === BigInt(0)),
    },
  });

  const { data: totalPlayed } = useReadContract({
    address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'TotalPlayed',
  });



  // Write contract functions
  const { writeContract: writeContractLottery } = useWriteContract();
  const { writeContract: writeContractUsdt } = useWriteContract();

  // Function to handle transaction completion and refresh
  const handleTransactionComplete = (type: 'register' | 'purchase' | 'claim') => {
    console.log(`✅ Transaction completed: ${type}`);
    
    // Show success notification
    let successMessage = '';
    switch (type) {
      case 'register':
        successMessage = '✅ Registration successful! Refreshing data...';
        break;
      case 'purchase':
        successMessage = '✅ Ticket purchase successful! Refreshing data...';
        break;
      case 'claim':
        successMessage = '✅ Prize claim successful! Refreshing data...';
        break;
    }
    showNotification(successMessage, 'success');
    
    // Set refreshing state to show loading message
    setIsRefreshing(true);
    
    // Trigger data refresh after a short delay to allow blockchain to update
    setTimeout(() => {
      console.log('🔄 Refreshing data after transaction completion...');
      // Force a refresh by triggering a re-render
      window.location.reload();
    }, 2000);
    
    // Reset transaction state
    setIsTransactionPending(false);
    setTransactionType(null);
    setLoading(false);
  };

  // Effect to handle transaction confirmation and page refresh
  useEffect(() => {
    if (isTransactionPending && transactionType) {
      console.log(`⏳ Transaction pending: ${transactionType}`);
      // The transaction receipt handling is now handled by the new handleTransactionComplete
      // This effect will now only run if the transaction is still pending after the timeout
    }
  }, [isTransactionPending, transactionType]);

 

  // Fallback function to get user tickets using getTicketOwner
  const getFallbackUserTickets = async (roundId: bigint, userAddress: string, ticketsSold: number) => {
    const tickets: bigint[] = [];
    try {
      console.log(`🔍 Fallback: Searching through ${ticketsSold} sold tickets for user ${userAddress}...`);
      
      // Only check sold tickets to avoid unnecessary calls
      for (let i = 1; i <= Math.min(ticketsSold, 100); i++) { // Limit to 100 for performance
        try {
          const ticketOwner = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
            abi: LOTTERY_ABI,
            functionName: 'getTicketOwner',
            args: [roundId, BigInt(i)],
          }) as string;
          console.log(ticketOwner, "hehhe");
          if (ticketOwner.toLowerCase() === userAddress.toLowerCase()) {
            tickets.push(BigInt(i));
          }
        } catch (ticketError) {
          console.warn(`Could not check ticket ${i} owner:`, ticketError);
          continue;
        }
      }
      
      console.log('🎫 Found user tickets via fallback method:', tickets.length);
      return tickets;
    } catch (fallbackError) {
      console.warn('⚠️ Fallback method failed:', fallbackError);
      return [];
    }
  };

  // Update dashboard data when contract data changes
  useEffect(() => {
    console.log('🔄 Dashboard data effect triggered:', {
      currentRoundId,
      roundData,
      userTickets,
      userTicketsError
    });

    // Handle case when no rounds are created yet (currentRoundId === 0)
    if (currentRoundId === BigInt(0)) {
      console.log('📊 No rounds created yet, setting default dashboard data');
      setDashboardData((prevData: any) => ({
        ...prevData,
        currentRound: 0,
        totalTickets: 0,
        ticketPrice: '0',
        ticketsSold: 0,
        prizePool: '0',
        isActive: false,
        drawExecuted: false,
        allClaimed: false,
        isSettled: false,
        totalPlayed: totalPlayed ? formatUSDT(formatEther(totalPlayed as bigint)) : '0',
        winningNumber: 0,
        myTicketsCount: 0,
        myTickets: [],
        userPurchaseHistory: []
      }));
      return;
    }

    // Handle case when we have valid round data
    if ((currentRoundId !== undefined && currentRoundId !== null) && roundData) {
      let tickets: number[] = [];
      
      // Handle userTickets with error fallback
      if (userTicketsError) {
        console.warn('⚠️ getUserTickets failed, will use fallback method:', userTicketsError);
        // We'll handle the fallback in a separate effect or when needed
        tickets = [];
      } else if (userTickets) {
        tickets = (userTickets as bigint[]).map(t => Number(t));
      }
      
      const roundDataArray = roundData as any[];
      const ticketPrice = formatUSDT(formatEther(roundDataArray[1] || BigInt(0)));
      const totalTickets = Number(roundDataArray[0] || BigInt(0));
      const ticketsSold = Number(roundDataArray[2] || BigInt(0));
      
      // Calculate prize pool (75% of total revenue) - matching reference code
      const totalRevenue = (roundDataArray[1] || BigInt(0)) * BigInt(ticketsSold);
      const prizePool = (totalRevenue * BigInt(75)) / BigInt(100);
      
      console.log('📊 Setting dashboard data for round:', Number(currentRoundId));
      setDashboardData((prevData: any) => ({
        ...prevData,
        currentRound: Number(currentRoundId),
        totalTickets,
        ticketPrice,
        ticketsSold,
        prizePool: formatUSDT(formatEther(prizePool)),
        isActive: roundDataArray[3],
        drawExecuted: roundDataArray[4],
        allClaimed: roundDataArray[5],
        isSettled: roundDataArray[6],
        totalPlayed: totalPlayed ? formatUSDT(formatEther(totalPlayed as bigint)) : '0',
        winningNumber: Number(roundDataArray[7] || BigInt(0)),
        myTicketsCount: tickets.length,
        myTickets: tickets,
        userPurchaseHistory: tickets.length > 0 ? [{
          roundId: Number(currentRoundId),
          ticketsCount: tickets.length,
          amountPaid: formatUSDT(formatEther(BigInt(tickets.length) * (roundDataArray[1] || BigInt(0)))),
          status: roundDataArray[4] ? 'Draw Complete' : 'Active'
        }] : []
      }));
    } else {
      console.log('📊 Dashboard data not set - currentRoundId:', currentRoundId, 'roundData:', roundData);
    }
  }, [currentRoundId, roundData, userTickets, userTicketsError, totalPlayed]);

  // Memoize expensive calculations
  const memoizedDashboardData = useMemo(() => {
    if ((currentRoundId === undefined || currentRoundId === null) || !roundData) return null;
    
    const roundDataArray = roundData as any[];
    const ticketPrice = formatUSDT(formatEther(roundDataArray[1] || BigInt(0)));
    const totalTickets = Number(roundDataArray[0] || BigInt(0));
    const ticketsSold = Number(roundDataArray[2] || BigInt(0));
    
    // Calculate prize pool (75% of total revenue) - matching reference code
    const totalRevenue = (roundDataArray[1] || BigInt(0)) * BigInt(ticketsSold);
    const prizePool = (totalRevenue * BigInt(75)) / BigInt(100);
    
    return {
      currentRound: Number(currentRoundId),
      totalTickets,
      ticketPrice,
      ticketsSold,
      prizePool: formatUSDT(formatEther(prizePool)),
      isActive: roundDataArray[3],
      drawExecuted: roundDataArray[4],
      allClaimed: roundDataArray[5],
      isSettled: roundDataArray[6],
      winningNumber: Number(roundDataArray[7] || BigInt(0)),
    };
  }, [currentRoundId, roundData]);

  // Separate effect to handle user registration data independently of round data
  useEffect(() => {
    if (userInfo) {
      console.log('📊 Raw userInfo from contract:', userInfo);
      setDashboardData((prevData: any) => ({
        ...prevData,
        isRegistered: (userInfo as any[])[0],
        userInfo: {
          sponsor: (userInfo as any[])[1],
          totalTicketsPurchased: Number((userInfo as any[])[2]),
          totalEarnings: formatUSDT(formatEther((userInfo as any[])[3] || BigInt(0))),
          sponsorIncome: formatUSDT(formatEther((userInfo as any[])[4] || BigInt(0))),
          rewardSponsorIncome: formatUSDT(formatEther((userInfo as any[])[5] || BigInt(0)))
        }
      }));
    } else if (address) {
      // Reset user data when address changes but no userInfo
      setDashboardData((prevData: any) => ({
        ...prevData,
        isRegistered: false,
        userInfo: null
      }));
    }
  }, [userInfo, address]);

  // Reset dashboard data when wallet disconnects
  useEffect(() => {
    if (!isConnected || !address) {
      setDashboardData({
        currentRound: 0,
        totalTickets: 0,
        ticketsSold: 0,
        ticketPrice: '0',
        prizePool: '0',
        drawExecuted: false,
        winningNumber: 0,
        myTicketsCount: 0,
        myTickets: [],
        isRegistered: false,
        userInfo: null,
        userPurchaseHistory: [],
        totalPlayed: '0'
      });
      setLoading(false);
      setNotification(null);
    }
  }, [isConnected, address]);

  // Polling mechanism to check for draw execution status
  // Optimized polling with rate limiting and error handling
  useEffect(() => {
    // Don't poll if not connected, no address, no current round, or draw already executed
    if (!isConnected || !address || !currentRoundId || currentRoundId === BigInt(0) || dashboardData.drawExecuted) {
      return;
    }

    let isPolling = false;
    let intervalId: NodeJS.Timeout | null = null;

    const pollDrawStatus = async () => {
      // Prevent multiple simultaneous calls
      if (isPolling) {
        return;
      }

      isPolling = true;
      
      try {
        const roundInfo = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
          abi: LOTTERY_ABI,
          functionName: 'getRoundInfo',
          args: [currentRoundId],
        }) as any[];

        const newDrawExecuted = roundInfo[4]; // drawExecuted is at index 4
        
        // If draw status changed from false to true, update the dashboard data
        if (newDrawExecuted && !dashboardData.drawExecuted) {
          console.log('🎉 Draw executed detected! Updating dashboard data...');
          
          // Update only the draw-related data
          setDashboardData((prevData: any) => ({
            ...prevData,
            drawExecuted: newDrawExecuted,
            winningNumber: Number(roundInfo[7] || BigInt(0)), // winningNumber is at index 7
            allClaimed: roundInfo[5], // allClaimed is at index 5
            isSettled: roundInfo[6], // isSettled is at index 6
          }));
          
          // Show notification to user
          showNotification('🎉 Draw has been executed! You can now claim your prizes!', 'success');
          
          // Stop polling once draw is executed
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (error) {
        // Handle rate limiting gracefully
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            console.warn('Rate limit hit, increasing polling interval...');
            // Increase interval to 60 seconds on rate limit
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = setInterval(pollDrawStatus, 60000); // 60 seconds
            }
          } else {
        console.error('Error polling draw status:', error);
      }
        } else {
          console.error('Error polling draw status:', error);
        }
      } finally {
        isPolling = false;
      }
    };

    // Start with a longer interval (30 seconds) to reduce API calls
    intervalId = setInterval(pollDrawStatus, 30000);
    
    // Poll immediately once
    pollDrawStatus();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, address, currentRoundId]); // Removed dashboardData.drawExecuted from dependencies

  // Function to get user total prize for a specific round
  const getUserTotalPrize = async (roundId: number, userAddress?: string) => {
    if (!userAddress && !address) {
      throw new Error('No user address provided');
    }
    
    const targetAddress = userAddress || address;
    
    try {
      const totalPrize = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getUserTotalPrize',
        args: [BigInt(roundId), targetAddress as `0x${string}`],
      }) as bigint;
      
      console.log(`🏆 User total prize for round ${roundId}:`, formatUSDT(formatEther(totalPrize)));
      return formatUSDT(formatEther(totalPrize));
    } catch (error) {
      console.error('Error getting user total prize:', error);
      return '0.00';
    }
  };

  // Function to get user sponsor info for a specific round
  const getUserSponsorInfo = async (roundId: number, userAddress?: string) => {
    if (!userAddress && !address) {
      throw new Error('No user address provided');
    }
    
    const targetAddress = userAddress || address;
    
    try {
      // Get user data from the users mapping
      const userData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'users',
        args: [targetAddress as `0x${string}`],
      }) as any[];
      
      console.log(`💰 User sponsor info from users mapping for ${targetAddress}:`, {
        sponsorIncome: formatUSDT(formatEther(userData[4] || BigInt(0))),
        rewardSponsorIncome: formatUSDT(formatEther(userData[5] || BigInt(0)))
      });
      
      return {
        sponsorIncome: formatUSDT(formatEther(userData[4] || BigInt(0))),
        rewardSponsorIncome: formatUSDT(formatEther(userData[5] || BigInt(0))),
        participatedInRound: true // We'll need to determine this from other data
      };
    } catch (error) {
      console.error('Error getting user sponsor info from users mapping:', error);
      return {
        sponsorIncome: '0.00',
        rewardSponsorIncome: '0.00',
        participatedInRound: false
      };
    }
  };

  // Function to get comprehensive user prize data for a round
  const getUserPrizeData = async (roundId: number, userAddress?: string) => {
    if (!userAddress && !address) {
      throw new Error('No user address provided');
    }
    
    const targetAddress = userAddress || address;
    
    try {
      // Get total prize
      const totalPrize = await getUserTotalPrize(roundId, targetAddress);
      
      // Get user data from the users mapping (includes sponsor info)
      const userData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'users',
        args: [targetAddress as `0x${string}`],
      }) as any[];
      
      // Extract sponsor income from users mapping
      const sponsorIncome = formatUSDT(formatEther(userData[4] || BigInt(0)));
      const rewardSponsorIncome = formatUSDT(formatEther(userData[5] || BigInt(0)));
      console.log('sponsorIncome:', sponsorIncome);
      console.log('rewardSponsorIncome:', rewardSponsorIncome);
      // Calculate distribution (15% of total prize)
      const totalPrizeNum = parseFloat(totalPrize);
      const distribution = (totalPrizeNum * 0.15).toFixed(4);
      
      // Calculate net prize (total prize - distribution)
      const netPrize = (totalPrizeNum - parseFloat(distribution)).toFixed(4);
      const totalReceived = parseFloat(netPrize)+parseFloat(sponsorIncome)+parseFloat(rewardSponsorIncome);
      
      const prizeData = {
        totalReceived,
        roundId,
        totalPrize,
        sponsorIncome,
        rewardSponsorIncome,
        distribution,
        netPrize,
        participatedInRound: true, // Assuming user participated if they have prize data
        userAddress: targetAddress
      };
      
      console.log(`🎯 Comprehensive prize data for round ${roundId}:`, prizeData);
      return prizeData;
    } catch (error) {
      console.error('Error getting comprehensive prize data:', error);
      return {
        roundId,
        totalPrize: '0.00',
        sponsorIncome: '0.00',
        rewardSponsorIncome: '0.00',
        distribution: '0.00',
        netPrize: '0.00',
        participatedInRound: false,
        userAddress: targetAddress
      };
    }
  };

  // Function to get user level counts
  const getUserLevelCounts = async (userAddress?: string) => {
    if (!userAddress && !address) {
      throw new Error('No user address provided');
    }
    
    const targetAddress = userAddress || address;
    
    try {
      const levelCounts = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getUserLevelCounts',
        args: [targetAddress as `0x${string}`],
      }) as bigint[];
      
      console.log(`👥 User level counts for ${targetAddress}:`, levelCounts);
      
      // Convert bigint array to number array and create level mapping
      const levelData = levelCounts.map((count, index) => ({
        level: index + 1,
        count: Number(count),
        levelName: getLevelName(index + 1)
      }));
      
      return levelData;
    } catch (error) {
      console.error('Error getting user level counts:', error);
      return [];
    }
  };

  // Helper function to get level names
  const getLevelName = (level: number): string => {
    const levelNames: { [key: number]: string } = {
      1: 'Level 1',
      2: 'Level 2', 
      3: 'Level 3',
      4: 'Level 4',
      5: 'Level 5',
      6: 'Level 6',
      7: 'Level 7',
      8: 'Level 8',
      9: 'Level 9',
      10: 'Level 10'
    };
    return levelNames[level] || `Level ${level}`;
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const registerUser = async (sponsor: string) => {
    if (!address) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    try {
      setLoading(true);
      setIsTransactionPending(true);
      setTransactionType('register');
      
      await writeContractLottery({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'registerUser',
        args: [sponsor as `0x${string}`],
      });
      
      console.log('📝 Registration transaction submitted');
      showNotification('Registration submitted! Please confirm the transaction in your wallet.', 'success');
      
      // Set up a timer to refresh after transaction completion
      setTimeout(() => {
        handleTransactionComplete('register');
      }, 5000); // Wait 5 seconds for transaction to be confirmed
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      showNotification(error.message || 'Registration failed', 'error');
      setIsTransactionPending(false);
      setTransactionType(null);
      setLoading(false);
    }
  };

  // OLD CODE - COMMENTED OUT
  // const purchaseTickets = async (numTickets: number) => {
  //   if (!address) {
  //     showNotification('Please connect your wallet first', 'error');
  //     return;
  //   }

  //   if (!currentRoundId) {
  //     showNotification('No active round found', 'error');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
      
  //     // First, check if we need to approve USDT spending
  //     const requiredAmount = parseEther((Number(dashboardData.ticketPrice) * numTickets).toString());
  //     // if (!usdtAllowance || usdtAllowance < requiredAmount) {
  //     if (!usdtAllowance || (typeof usdtAllowance === 'bigint' && usdtAllowance < requiredAmount)) {
  //       // Approve USDT spending
  //       await writeContractUsdt({
  //         address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
  //         abi: USDT_ABI,
  //         functionName: 'approve',
  //         args: [CONTRACT_ADDRESSES.LOTTERY as `0x${string}`, requiredAmount],
  //       });
        
  //       showNotification('USDT approval submitted! Please confirm in your wallet.', 'success');
  //       // Wait a bit for approval to be processed
  //       await new Promise(resolve => setTimeout(resolve, 2000));
  //     }

  //     // Purchase tickets
  //     await writeContractLottery({
  //       address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
  //       abi: LOTTERY_ABI,
  //       functionName: 'purchaseTickets',
  //       args: [currentRoundId, BigInt(numTickets)],
  //     });

  //     showNotification('Ticket purchase submitted! Please confirm the transaction in your wallet.', 'success');
  //   } catch (error: any) {
  //     console.error('Ticket purchase failed:', error);
  //     showNotification(error.message || 'Ticket purchase failed', 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // NEW CODE - LIMITED TO 1 TICKET PER USER
  const purchaseTickets = async (numTickets: number) => {
    if (!address) {
      const error = new Error('Please connect your wallet first');
      showNotification(error.message, 'error');
      throw error;
    }

    if (!currentRoundId) {
      const error = new Error('No active round found');
      showNotification(error.message, 'error');
      throw error;
    }

    // Validate ticket count
    if (!numTickets || numTickets < 1 || numTickets > 50) {
      const error = new Error('Please enter a valid number of tickets (1-50)');
      showNotification(error.message, 'error');
      throw error;
    }

    // Check if user already has tickets in current round
    try {
      const userTickets = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getUserTickets',
        args: [currentRoundId, address as `0x${string}`],
      }) as bigint[];

      if (userTickets.length > 0) {
        const error = new Error('Tickets already purchased! You can only purchase tickets once per round.');
        showNotification(error.message, 'error');
        throw error;
      }
    } catch (error) {
      console.error('Error checking user tickets:', error);
    }

    try {
      setLoading(true);
      setIsTransactionPending(true);
      setTransactionType('purchase');
      
      // First, check if we need to approve USDT spending
      const requiredAmount = parseEther((Number(dashboardData.ticketPrice) * numTickets).toString());
      if (!usdtAllowance || (typeof usdtAllowance === 'bigint' && usdtAllowance < requiredAmount)) {
        // Approve USDT spending
        await writeContractUsdt({
          address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.LOTTERY as `0x${string}`, requiredAmount],
        });
        
        console.log('🔐 USDT approval transaction submitted');
        showNotification('TRDO approval submitted! Please confirm in your wallet.', 'success');
        
        // Wait for approval to be processed, then proceed with purchase
        setTimeout(async () => {
          try {
            // Purchase the specified number of tickets
            await writeContractLottery({
              address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
              abi: LOTTERY_ABI,
              functionName: 'purchaseTickets',
              args: [currentRoundId, BigInt(numTickets)],
            });

            console.log('🎫 Ticket purchase transaction submitted');
            showNotification(`Ticket purchase submitted! Please confirm the transaction in your wallet.`, 'success');
            
            // Set up a timer to refresh after transaction completion
            setTimeout(() => {
              handleTransactionComplete('purchase');
            }, 5000); // Wait 5 seconds for transaction to be confirmed
            
          } catch (error: any) {
            console.error('Ticket purchase failed:', error);
            showNotification(error.message || 'Ticket purchase failed', 'error');
            setIsTransactionPending(false);
            setTransactionType(null);
            setLoading(false);
          }
        }, 3000); // Wait 3 seconds for approval to be processed
        
        return; // Exit early, will handle purchase after approval
      }

      // Purchase the specified number of tickets (no approval needed)
      await writeContractLottery({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'purchaseTickets',
        args: [currentRoundId, BigInt(numTickets)],
      });

      console.log('🎫 Ticket purchase transaction submitted');
      showNotification(`Ticket purchase submitted! Please confirm the transaction in your wallet.`, 'success');
      
      // Set up a timer to refresh after transaction completion
      setTimeout(() => {
        handleTransactionComplete('purchase');
      }, 5000); // Wait 5 seconds for transaction to be confirmed
      
    } catch (error: any) {
      console.error('Ticket purchase failed:', error);
      showNotification(error.message || 'Ticket purchase failed', 'error');
      setIsTransactionPending(false);
      setTransactionType(null);
      setLoading(false);
      throw error; // Re-throw the error so calling functions can handle it
    }
  };

  const claimPrize = async (roundId: number) => {
    if (!address) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    try {
      setLoading(true);
      setIsTransactionPending(true);
      setTransactionType('claim');
      
      await writeContractLottery({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'claimPrize',
        args: [BigInt(roundId)],
      });

      console.log('🏆 Prize claim transaction submitted');
      showNotification('Prize claim submitted! Please confirm the transaction in your wallet.', 'success');
      
      // Set up a timer to refresh after transaction completion
      setTimeout(() => {
        handleTransactionComplete('claim');
      }, 5000); // Wait 5 seconds for transaction to be confirmed
      
    } catch (error: any) {
      console.error('Prize claim failed:', error);
      showNotification(error.message || 'Prize claim failed', 'error');
      setIsTransactionPending(false);
      setTransactionType(null);
      setLoading(false);
    }
  };

  const claimAllPrizes = async () => {
    if (!address) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    if (!currentRoundId) {
      showNotification('No active round found', 'error');
      return;
    }

    try {
      setLoading(true);
      setIsTransactionPending(true);
      setTransactionType('claim');
      
      await writeContractLottery({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'claimAllPrizes',
        args: [currentRoundId],
      });

      console.log('🏆 All prizes claim transaction submitted');
      showNotification('All prizes claim submitted! Please confirm the transaction in your wallet.', 'success');
      
      // Set up a timer to refresh after transaction completion
      setTimeout(() => {
        handleTransactionComplete('claim');
      }, 5000); // Wait 5 seconds for transaction to be confirmed
      
    } catch (error: any) {
      console.error('All prizes claim failed:', error);
      showNotification(error.message || 'All prizes claim failed', 'error');
      setIsTransactionPending(false);
      setTransactionType(null);
      setLoading(false);
    }
  };

  const formatBalance = (balance: bigint | undefined, decimals = 18) => {
    if (!balance) return '0';
    return formatEther(balance);
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getPurchaseHistory = () => {
    return dashboardData.userPurchaseHistory;
  };

  const getPrizeData = async () => {
    // This would fetch prize data for the current round
    return {
      roundId: dashboardData.currentRound,
      prizePool: dashboardData.prizePool,
      drawExecuted: dashboardData.drawExecuted
    };
  };

  const getTicketOwner = async (roundId: number, ticketNumber: number) => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getTicketOwner',
        args: [BigInt(roundId), BigInt(ticketNumber)],
      });
      return result as string;
    } catch (error) {
      console.error('Error getting ticket owner:', error);
      return null;
    }
  };

  const getTicketRank = async (roundId: number, ticketNumber: number) => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getTicketRank',
        args: [BigInt(roundId), BigInt(ticketNumber)],
      });
      return result as bigint;
    } catch (error) {
      console.error('Error getting ticket rank:', error);
      return null;
    }
  };

  const calculateTicketPrize = async (roundId: number, ticketNumber: number) => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'calculateTicketPrize',
        args: [BigInt(roundId), BigInt(ticketNumber)],
      });
      return result as bigint;
    } catch (error) {
      console.error('Error calculating ticket prize:', error);
      return null;
    }
  };

  const getTicketDetails = async (roundId: number, ticketNumber: number) => {
    try {
      const [owner, rank, prize] = await Promise.all([
        getTicketOwner(roundId, ticketNumber),
        getTicketRank(roundId, ticketNumber),
        calculateTicketPrize(roundId, ticketNumber)
      ]);
      
      return {
        owner: owner as string | null,
        rank: rank ? Number(rank) : 0,
        prize: prize ? formatEther(prize as bigint) : '0'
      };
    } catch (error) {
      console.error('Error getting ticket details:', error);
      return null;
    }
  };

  // NEW FUNCTION - Check if user has already purchased a ticket in current round
  const hasUserPurchasedTicket = async (roundId: number) => {
    if (!address) return false;
    
    try {
      const userTickets = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getUserTickets',
        args: [BigInt(roundId), address as `0x${string}`],
      }) as bigint[];
      
      return userTickets.length > 0;
    } catch (error) {
      console.error('Error checking if user has purchased ticket:', error);
      return false;
    }
  };

  // Function to check if user has claimed prizes for a specific round using isClaimed ABI
  const checkIsClaimed = async (userAddress: string, roundId: number) => {
    try {
      const isClaimed = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'isClaimed',
        args: [userAddress as `0x${string}`, BigInt(roundId)],
      }) as boolean;
      
      console.log(`🔍 isClaimed check for user ${userAddress} in round ${roundId}:`, isClaimed);
      return isClaimed;
    } catch (error) {
      console.error('Error checking isClaimed status:', error);
      return false;
    }
  };

  // Manual refresh function to check draw status immediately
  const refreshDrawStatus = async () => {
    if (!isConnected || !address || !currentRoundId) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    try {
      setLoading(true);
      const roundInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getRoundInfo',
        args: [currentRoundId],
      }) as any[];

      const newDrawExecuted = roundInfo[4];
      
      if (newDrawExecuted && !dashboardData.drawExecuted) {
        console.log('🎉 Draw executed detected! Updating dashboard data...');
        
        setDashboardData((prevData: any) => ({
          ...prevData,
          drawExecuted: newDrawExecuted,
          winningNumber: Number(roundInfo[7] || BigInt(0)),
          allClaimed: roundInfo[5],
          isSettled: roundInfo[6],
        }));
        
        showNotification('🎉 Draw has been executed! You can now claim your prizes!', 'success');
      } else if (newDrawExecuted && dashboardData.drawExecuted) {
        showNotification('Draw has already been executed', 'info');
      } else {
        showNotification('Draw has not been executed yet', 'info');
      }
    } catch (error) {
      console.error('Error refreshing draw status:', error);
      showNotification('Failed to refresh draw status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Removed redundant polling function to prevent excessive API calls

  return {
    // State
    address,
    isConnected,
    loading,
    notification,
    dashboardData,
    isTransactionPending,
    transactionType,
    isRefreshing,
    
    // Balances
    bnbBalance: formatBalance(bnbBalance?.value),
    usdtBalance: formatBalance(usdtBalance?.value),
    usdtAllowance: formatBalance(usdtAllowance as bigint | undefined),
    
    // Actions
    disconnect,
    registerUser,
    purchaseTickets,
    claimPrize,
    claimAllPrizes,
    
    // Utilities
    formatBalance,
    formatAddress,
    getPurchaseHistory,
    getPrizeData,
    getTicketDetails,
    hasUserPurchasedTicket,
    showNotification,
    getFallbackUserTickets,
    
    // Prize and Sponsor Functions
    getUserTotalPrize,
    getUserSponsorInfo,
    getUserPrizeData,
    getUserLevelCounts,
    checkIsClaimed,
    refreshDrawStatus,

    
    // Contract addresses for reference
    contractAddresses: CONTRACT_ADDRESSES
  };
};
