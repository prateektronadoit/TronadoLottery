'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useWallet } from '../hooks/useWallet';
import { createPublicClient, http, formatEther } from 'viem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { polygon } from 'wagmi/chains';

// import { bscTestnet } from 'wagmi/chains';

// Import contract data from useWallet
const CONTRACT_ADDRESSES = {
  LOTTERY: '0xDaeD50C7eE02406b6017b4ABE5E413b08D819647',
  USDT: '0x8d60f559C2461F193913afd10c2d09a09FBa0Bf3'
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

// Create public client for reading contract data
// const publicClient = createPublicClient({
//   chain: bscTestnet,
//   transport: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
// });

// Contract ABIs - Updated with new ABI
const LOTTERY_ABI = [{"inputs":[{"internalType":"address","name":"_usdtToken","type":"address"},{"internalType":"address","name":"_creator","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"DrawExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"bool","name":"isPurchase","type":"bool"}],"name":"MLMEarning","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PrizeClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[10]","name":"newPercentages","type":"uint256[10]"},{"indexed":false,"internalType":"address","name":"updatedBy","type":"address"}],"name":"RankPrizesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalTickets","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ticketPrice","type":"uint256"}],"name":"RoundCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalTransferredToCreator","type":"uint256"}],"name":"RoundSettled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"reason","type":"string"}],"name":"SponsorIncomeReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256[]","name":"ticketNumbers","type":"uint256[]"}],"name":"TicketPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"sponsor","type":"address"}],"name":"UserRegistered","type":"event"},{"inputs":[],"name":"MaxTicketPerRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TotalPlayed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"calculateTicketPrize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"claimLevelPercentages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"claimPrize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"totalTickets","type":"uint256"},{"internalType":"uint256","name":"ticketPrice","type":"uint256"}],"name":"createRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"creator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRoundId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"defaultRankPrizes","outputs":[{"internalType":"uint256","name":"percentage","type":"uint256"},{"internalType":"bool","name":"isGroup","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"executeDraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"finalizeRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getContractStats","outputs":[{"internalType":"uint256","name":"totalRounds","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"},{"internalType":"uint256","name":"activeRound","type":"uint256"},{"internalType":"uint256","name":"totalRegisteredUsers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentRankPrizes","outputs":[{"internalType":"uint256[10]","name":"percentages","type":"uint256[10]"},{"internalType":"bool[10]","name":"isGroupFlags","type":"bool[10]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"getRoundInfo","outputs":[{"internalType":"uint256","name":"totalTickets","type":"uint256"},{"internalType":"uint256","name":"ticketPrice","type":"uint256"},{"internalType":"uint256","name":"ticketsSold","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"drawExecuted","type":"bool"},{"internalType":"bool","name":"allClaimed","type":"bool"},{"internalType":"bool","name":"isSettled","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"getTicketOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"getTicketRank","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalRegisteredUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserLevelCounts","outputs":[{"internalType":"uint256[10]","name":"","type":"uint256[10]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"user","type":"address"}],"name":"getUserTickets","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"user","type":"address"}],"name":"getUserTotalPrize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"isClaimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isUserInArray","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxTicketPurchase","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"purchaseLevelPercentages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"numberOfTickets","type":"uint256"}],"name":"purchaseTickets","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sponsor","type":"address"}],"name":"registerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"registeredUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"roundFinalizationProgress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"roundParticipants","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rounds","outputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"totalTickets","type":"uint256"},{"internalType":"uint256","name":"ticketPrice","type":"uint256"},{"internalType":"uint256","name":"ticketsSold","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"drawExecuted","type":"bool"},{"internalType":"bool","name":"allClaimed","type":"bool"},{"internalType":"bool","name":"isSettled","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_MaxTicketPerRound","type":"uint256"}],"name":"setMaxTicketPerRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxTicketPurchase","type":"uint256"}],"name":"setMaxTicketPurchase","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalOwnersClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalUniqueOwners","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[10]","name":"newPercentages","type":"uint256[10]"}],"name":"updateRankPrizes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdtToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"userLevelCounts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"uint256","name":"totalTicketsPurchased","type":"uint256"},{"internalType":"uint256","name":"totalEarnings","type":"uint256"},{"internalType":"uint256","name":"sponsorIncome","type":"uint256"},{"internalType":"uint256","name":"RewardSponsorIncome","type":"uint256"}],"stateMutability":"view","type":"function"}]

// Sidebar component
const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  activeSection, 
  setActiveSection,
  navigateToSection
}: { 
  isOpen: boolean; 
  toggleSidebar: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  navigateToSection: (section: string) => void;
}) => {
  const menuItems = [
    { id: 'how-to-play', icon: '📖', label: 'How To Play Lottery (Simplified Lottery)' },
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'registration', icon: '📝', label: 'Registration' },
    // { id: 'purchase', icon: '🎫', label: 'Purchase' },
    { id: 'claim', icon: '🏆', label: 'Claim Prizes' },
    { id: 'community', icon: '👥', label: 'My Community' }, // new section
     // new section
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 bg-gray-950 h-screen fixed left-0 top-0 text-orange-500 z-30 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/Logo.png" alt="Crypto Lottery Logo" width={150} height={40} priority />
          </Link>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="py-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="mb-2 px-2">
                <button
                  onClick={() => navigateToSection(item.id)}
                  className={`flex items-center p-3 w-full text-left rounded transition-all duration-200 ${
                    activeSection === item.id 
                      ? 'text-white bg-blue-900' 
                      : 'text-gray-400 hover:text-white hover:bg-blue-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

// Stat Card component
interface StatCardProps {
  icon: string;
  iconImage?: string;
  title: string;
  value: string | number;
  subtitle: string;
  bgClass?: string;
  iconSize?: number;
  isLoading?: boolean;
}

const StatCard = ({ icon, iconImage, title, value, subtitle, bgClass = "bg-opacity-0", iconSize = 80, isLoading = false }: StatCardProps) => {
  return (
    <div className={`relative rounded-xl p-4 md:p-6 border-2 border-blue-500 bg-blue-900/10 ${bgClass} group overflow-hidden transition-all duration-300 hover:border-blue-400 stat-card-fluid h-full min-h-[140px] md:min-h-[160px] flex flex-col justify-center`}>
      <div className="stat-card-background"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 via-blue-500/10 to-blue-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-blue-600/20 opacity-0 group-hover:opacity-100 group-hover:animate-fluid transition-opacity duration-500 ease-in-out"></div>
      <div className="flex items-center gap-3 md:gap-4 w-full">
        {iconImage ? (
          <Image src={`/${iconImage}`} alt={title} width={iconSize} height={iconSize} className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
        ) : (
          <span className="text-2xl md:text-3xl flex-shrink-0">{icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs md:text-sm lg:text-base text-gray-200 font-medium leading-tight">{title}</div>
          {isLoading ? (
            <div className="flex items-center gap-2 mb-1">
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 border-b-2 border-blue-400"></div>
              <span className="text-sm md:text-base lg:text-lg text-gray-400">Loading...</span>
            </div>
          ) : (
          <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-1 leading-tight">{value}</div>
          )}
          <div className="text-xs text-gray-300 leading-tight">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-lg text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">Processing...</p>
      <p className="text-gray-400 text-sm">Please confirm transaction in your wallet</p>
    </div>
  </div>
);

// Notification Component
const Notification = ({ notification, onClose }: { notification: any; onClose: () => void }) => {
  if (!notification) return null;

  const bgColor = notification.type === 'error' ? 'bg-red-500' : 
                  notification.type === 'warning' ? 'bg-yellow-500' : 
                  notification.type === 'info' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-in slide-in-from-right duration-300 transition-all`}>
      <span className="mr-2">
        {notification.type === 'error' ? '❌' : 
         notification.type === 'warning' ? '⚠️' : 
         notification.type === 'info' ? 'ℹ️' : '✅'}
      </span>
      {notification.message}
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 transition-colors">
        ✕
      </button>
    </div>
  );
};

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

// Comprehensive Prize Display Component
const ComprehensivePrizeDisplay = ({ 
  roundId, 
  getUserPrizeData, 
  getUserTotalPrize, 
  getUserSponsorInfo,
  setNotification,
  myTicketsCount,
  drawExecuted
}: { 
  roundId: number;
  getUserPrizeData: (roundId: number) => Promise<any>;
  getUserTotalPrize: (roundId: number) => Promise<string>;
  getUserSponsorInfo: (roundId: number) => Promise<any>;
  setNotification: (notification: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null) => void;
  myTicketsCount: number;
  drawExecuted: boolean;
}) => {
  const [prizeData, setPrizeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSponsorPopup, setShowSponsorPopup] = useState(false);
  const [showDistributionPopup, setShowDistributionPopup] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState<boolean | null>(null);
  const { claimPrize, getUserLevelCounts } = useWallet();
  const { address } = useAccount();
  const [userLevelCounts, setUserLevelCounts] = useState<any[]>([]);
  const [levelCountsLoading, setLevelCountsLoading] = useState(false);

  // Add ref to track if loading is in progress to prevent multiple simultaneous loads
  const loadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  // Fetch user level counts when popup opens (only once per open)
  useEffect(() => {
    if (showSponsorPopup && address && userLevelCounts.length === 0) {
      setLevelCountsLoading(true);
      getUserLevelCounts(address)
        .then((counts) => setUserLevelCounts(counts))
        .catch(() => setUserLevelCounts([]))
        .finally(() => setLevelCountsLoading(false));
    }
    // Do NOT include getUserLevelCounts in the dependency array to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSponsorPopup, address]);

  // Function to check claim status
  const checkClaimStatus = async () => {
    if (!address || !roundId) {
      setIsClaimed(null);
      return;
    }
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'isClaimed',
        args: [address as `0x${string}`, BigInt(roundId)],
      }) as boolean;
      setIsClaimed(result);
    } catch (err) {
      setIsClaimed(null);
    }
  };

  useEffect(() => {
    checkClaimStatus();
  }, [address, roundId]);

  // Claim handler for this component
  const handleClaimPrize = async () => {
    console.log('Clicked');
    if (!roundId) {
      setNotification({ type: 'error', message: 'Invalid round ID' });
      return;
    }
    setClaimLoading(true);
    setNotification({ type: 'info', message: 'Processing prize claim...' });
    try {
      await claimPrize(roundId);
      setNotification({ type: 'success', message: 'Prize claimed successfully! 🏆' });
      // Immediately re-check claim status after claiming
      await checkClaimStatus();
    } catch (error: any) {
      let errorMessage = 'Claim failed';
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('no prize')) {
        errorMessage = 'No prize available to claim';
      } else if (error.message?.includes('already claimed')) {
        errorMessage = 'Prize already claimed';
      } else {
        errorMessage = 'Claim failed: ' + error.message;
      }
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setClaimLoading(false);
    }
  };

  // Memoized loadPrizeData function to prevent recreation on every render
  const loadPrizeData = useCallback(async () => {
    if (!roundId || roundId === 0) return;
    
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('🔄 Load already in progress, skipping...');
      return;
    }

    // Debounce: prevent loading more than once every 2 seconds
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 2000) {
      console.log('🔄 Debouncing load request...');
      return;
    }

    loadingRef.current = true;
    lastLoadTimeRef.current = now;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading prize data for round:', roundId);
      const data = await getUserPrizeData(roundId);
      setPrizeData(data);
    } catch (err: any) {
      console.error('Error loading prize data:', err);
      setError(err.message || 'Failed to load prize data');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [roundId, getUserPrizeData]);

  // Use effect with proper dependencies and debouncing
  useEffect(() => {
    loadPrizeData();
  }, [loadPrizeData]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-400">Loading prize data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-600 rounded-lg p-4 text-center">
        <p className="text-sm text-red-300">Error: {error}</p>
      </div>
    );
  }

  if (!prizeData) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400">No prize data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Prize Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-900/80 via-green-800/60 to-green-900/80 rounded-xl p-4 md:p-5 text-center border-2 border-green-500/50 shadow-lg hover:shadow-green-500/20 transition-all duration-500 group before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-400/20 before:via-transparent before:to-green-400/20 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10">
          <div className="absolute top-2 right-2 text-green-300 animate-pulse text-sm">💰</div>
          <div className="text-xl md:text-2xl font-bold text-green-300 mb-1">
            {formatUSDT(prizeData.sponsorIncome || '0')}
          </div>
          <div className="text-xs md:text-sm text-green-200">Downline Income (Purchase Time)</div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/80 via-purple-800/60 to-purple-900/80 rounded-xl p-4 md:p-5 text-center border-2 border-purple-500/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-500 group before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/20 before:via-transparent before:to-purple-400/20 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10">
          <div className="absolute top-2 right-2 text-purple-300 animate-pulse text-sm">🎁</div>
          <div className="text-xl md:text-2xl font-bold text-purple-300 mb-1">
            {formatUSDT(prizeData.rewardSponsorIncome || '0')}
          </div>
          <div className="text-xs md:text-sm text-purple-200">Downline Income (Claim Time)</div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-blue-900/80 rounded-xl p-4 md:p-5 text-center border-2 border-blue-500/50 shadow-lg hover:shadow-blue-500/20 transition-all duration-500 group before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400/20 before:via-transparent before:to-blue-400/20 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10">
          <div className="absolute top-2 right-2 text-blue-300 animate-pulse text-sm">🏆</div>
          <div className="text-xl md:text-2xl font-bold text-blue-300 mb-1">
            {formatUSDT(prizeData.netPrize || '0')}
          </div>
          <div className="text-xs md:text-sm text-blue-200">Winning Prize</div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-900/80 via-yellow-800/60 to-yellow-900/80 rounded-xl p-4 md:p-5 text-center border-2 border-yellow-500/50 shadow-lg hover:shadow-yellow-500/20 transition-all duration-500 group before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-400/20 before:via-transparent before:to-yellow-400/20 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10">
          <div className="absolute top-2 right-2 text-yellow-300 animate-pulse text-sm">💎</div>
          <div className="text-xl md:text-2xl font-bold text-yellow-300 mb-1">
            {isClaimed === true ? formatUSDT('0') : formatUSDT(prizeData.totalReceived || '0')}
          </div>
          <div className="text-xs md:text-sm text-yellow-200">Total Claimable Amount (Current Round)</div>
        </div>
      </div>

      {/* Participation Status */}
      {myTicketsCount > 0 && (
        <div className="relative overflow-hidden rounded-xl p-4 md:p-5 text-center bg-gradient-to-br from-green-900/80 via-green-800/60 to-green-900/80 border-2 border-green-500/50 shadow-lg hover:shadow-green-500/20 transition-all duration-500 group before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-400/20 before:via-transparent before:to-green-400/20 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10">
          <div className="absolute top-2 right-2 text-green-300 animate-pulse text-sm">🎫</div>
          <div className="text-sm md:text-base font-bold text-green-300">
            ✅ Participated in Round
          </div>
        </div>
      )}
       
        <div className="space-y-2 text-xs md:text-sm">
      
          {/* Claim Prize Button - Only show if user has tickets and draw is executed */}
          {myTicketsCount > 0 && drawExecuted && (
            <div className="flex flex-col items-end mt-4 gap-2">
              <button
                onClick={handleClaimPrize}
                disabled={claimLoading || isClaimed === true}
                className={`relative overflow-hidden font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 ${
                  claimLoading || isClaimed === true
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white shadow-yellow-500/30 hover:shadow-yellow-500/50'
                } before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000`}
              >
                {claimLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    <span className="text-sm md:text-base">Claiming...</span>
                  </>
                ) : isClaimed === true ? (
                  <>
                    <span className="mr-2 text-lg">✅</span>
                    <span className="text-sm md:text-base">Claimed</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-lg">🏆</span>
                    <span className="text-sm md:text-base">Claim Prize</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      {/* Sponsor Income Network Level Popup */}
      {showSponsorPopup && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-30">
          <div className="bg-white rounded-xl p-5 mt-16 mr-8 border shadow-2xl max-w-xs w-full relative animate-slide-in-right">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowSponsorPopup(false)}
            >
              &times;
            </button>
            <h4 className="text-lg md:text-xl font-semibold mb-4 text-purple-700 text-center flex items-center justify-center gap-2">
              <span role='img' aria-label='chart'>📊</span>
              <span>Your Network Levels</span>
            </h4>
            {levelCountsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="ml-2 text-sm text-gray-500">Loading levels...</span>
              </div>
            ) : userLevelCounts.length > 0 ? (
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="py-2 px-2 text-left text-gray-700 font-semibold">Level</th>
                        <th className="py-2 px-2 text-left text-gray-700 font-semibold">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLevelCounts.map((level: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-purple-50">
                          <td className="py-2 px-2 text-gray-800 font-medium">
                            Level {level.level}
                          </td>
                          <td className="py-2 px-2 text-gray-800">
                            {level.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-lg md:text-xl font-bold text-blue-600">
                      {userLevelCounts.reduce((total, level) => total + level.count, 0)}
                    </div>
                    <div className="text-xs text-gray-500">Total Network</div>
                  </div>
                  {/* <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-lg md:text-xl font-bold text-green-600">
                      {userLevelCounts.filter(level => level.count > 0).length}
                    </div>
                    <div className="text-xs text-gray-500">Active Levels</div>
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                No level data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Confetti Celebration Component
interface ConfettiItem {
  id: string;
  left: string;
  delay: string;
  duration: string;
  color: string;
  fontSize?: string;
  rotation?: string;
  emoji: string;
  top?: string;
}

const ConfettiCelebration = ({ onClose, winningTicketInfo }: { onClose?: () => void; winningTicketInfo: { ticketNumber: number; rank: number; prize?: string } | null }) => {
  // Pre-calculate confetti data to avoid recalculating on every render
  const confettiData = useMemo(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF8C00', '#FF1493'];
    const emojis = ['🎉', '🎊', '✨', '💫', '🌟', '⭐', '🎈', '🎁', '🏆', '💎'];
    
    // Reduced number of confetti elements for better performance
    const fallingConfetti = Array.from({ length: 20 }, (_, i) => ({
      id: `falling-${i}`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      fontSize: `${12 + Math.random() * 6}px`,
      rotation: `${Math.random() * 360}deg`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));

    const floatingConfetti = Array.from({ length: 12 }, (_, i) => ({
      id: `floating-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * 6)],
      emoji: emojis[Math.floor(Math.random() * 6)]
    }));

    return { 
      fallingConfetti: fallingConfetti as ConfettiItem[], 
      floatingConfetti: floatingConfetti as ConfettiItem[] 
    };
  }, []); // Empty dependency array - calculate once

  return (
    <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 md:p-8 text-center shadow-xl border-4 border-yellow-300" style={{ 
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 165, 0, 0.4), 0 0 90px rgba(255, 69, 0, 0.2)'
    }}>
      {/* Optimized Falling Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiData.fallingConfetti.map((confetti) => (
          <div
            key={confetti.id}
            className="absolute animate-fall"
            style={{
              left: confetti.left,
              top: '-10%',
              animationDelay: confetti.delay,
              animationDuration: confetti.duration,
              color: confetti.color,
              fontSize: confetti.fontSize,
              transform: `rotate(${confetti.rotation})`
            }}
          >
            {confetti.emoji}
          </div>
        ))}
      </div>

      {/* Optimized Floating Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiData.floatingConfetti.map((confetti) => (
          <div
            key={confetti.id}
            className="absolute animate-bounce"
            style={{
              left: confetti.left,
              top: confetti.top,
              animationDelay: confetti.delay,
              animationDuration: confetti.duration,
              color: confetti.color
            }}
          >
            {confetti.emoji}
          </div>
        ))}
      </div>
      
      <div className="relative z-10">
        <div className="text-4xl md:text-5xl mb-3 animate-bounce" style={{ animationDuration: '2s' }}>🎉</div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3 drop-shadow-lg">
          CONGRATULATIONS!
        </h2>
        <p className="text-lg md:text-xl text-white mb-4 font-semibold drop-shadow-md">
          Your ticket has won prize {winningTicketInfo?.prize ? parseFloat(winningTicketInfo.prize).toFixed(5) : '0.00000'} TRDO! 🏆
        </p>
      </div>
    </div>
  );
};

// PowerPoint Viewer Component
const PowerPointViewer = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(22); // Default, will be updated
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const pptxUrl = '/pdf/TronadoLottery.pptx';

  // Actual slides data from the slides directory
  const actualSlides = [
    '/slides/1.png',
    '/slides/2.png',
    '/slides/3.png',
    '/slides/4.png',
    '/slides/5.png',
    '/slides/6.png',
    '/slides/7.png',
    '/slides/8.png',
    '/slides/9.png',
    '/slides/10.png',
    '/slides/11.png',
    '/slides/12.png',
    '/slides/13.png',
    '/slides/14.png',
    '/slides/15.png',
    '/slides/16.png',
    '/slides/17.png',
    '/slides/18.png',
    '/slides/19.png',
    '/slides/20.png',
    '/slides/21.png',
    '/slides/22.png'
  ];

  useEffect(() => {
    // Load actual slides
    setLoading(true);
    setTimeout(() => {
      setSlides(actualSlides);
      setTotalSlides(actualSlides.length);
      setLoading(false);
    }, 1000);
  }, []);

  const goToPreviousSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pptxUrl;
    link.download = 'TronadoLottery.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewOnline = () => {
    // Open in Microsoft Office Online or Google Slides
    const encodedUrl = encodeURIComponent(window.location.origin + pptxUrl);
    const googleSlidesUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
    window.open(googleSlidesUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-white flex items-center justify-center">
          <span className="mr-3">📊</span>
          How To Play Lottery (Simplified Lottery)
        </h2>
        
        {/* PowerPoint Slides Container */}
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Navigation Controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <button
              onClick={goToPreviousSlide}
              disabled={currentSlide <= 1}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium">
              Slide {currentSlide} of {totalSlides}
            </div>
            
            <button
              onClick={goToNextSlide}
              disabled={currentSlide >= totalSlides}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center shadow-lg"
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Slides Display */}
          <div className="w-full h-[600px] sm:h-[700px] md:h-[800px] relative bg-gradient-to-br from-blue-50 to-gray-100">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading presentation...</p>
                </div>
              </div>
            ) : slides.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Current Slide */}
                  <div className="max-w-full max-h-full bg-white rounded-lg shadow-xl overflow-hidden">
                    <img
                      src={slides[currentSlide - 1]}
                      alt={`Slide ${currentSlide}`}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIHNsaWRlIGltYWdlIGF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                      }}
                    />
                  </div>
                  
                  {/* Slide Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index + 1)}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                          currentSlide === index + 1 
                            ? 'bg-blue-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Presentation Not Available</h3>
                  <p className="text-gray-600 mb-4">Please use the download or online viewing options below</p>
                  
                  {/* Fallback Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleViewOnline}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Online
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PPTX
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions
        <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-200 mb-2">📋 Instructions:</h3>
          <ul className="text-sm text-blue-100 space-y-1">
            <li>• <strong>Left/Right Arrows:</strong> Navigate through slides using Previous/Next buttons</li>
            <li>• <strong>Slide Dots:</strong> Click on dots at bottom to jump to specific slides</li>
            <li>• <strong>Download PPTX:</strong> Download the original PowerPoint file</li>
            <li>• <strong>View Online:</strong> Open in Google Slides for full presentation mode</li>
          </ul>
        </div>

        {/* File Information */}
        {/* <div className="mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">📁 File Information:</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong>File Name:</strong> TronadoLottery.pptx</p>
            <p><strong>File Type:</strong> Microsoft PowerPoint Presentation</p>
            <p><strong>Total Slides:</strong> 22 slides</p>
            <p><strong>Content:</strong> Complete lottery guide with slides and instructions</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default function Dashboard() {
  // Timer state at the top to avoid ReferenceError
  const [showTimer, setShowTimer] = useState(false);
  const [roundCreatedAt, setRoundCreatedAt] = useState<number | null>(null);
  const [timeSince, setTimeSince] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sponsorAddress, setSponsorAddress] = useState('');
  const [numTickets, setNumTickets] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<{
    ticketNumber: number;
    owner: string;
    rank: number;
    prize: string;
    isMyTicket: boolean;
    isWinner: boolean;
    isAvailable: boolean;
    status: string;
  } | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [prizeData, setPrizeData] = useState<{
    foundPrizes: boolean;
    totalPendingClaims: string;
    prizes: Array<{
      roundId: number;
      userTickets: number;
      roundPrizes: Array<{
        ticketNumber: string;
        rank: number;
        prize: string;
      }>;
      totalRoundPrize: string;
      isAlreadyClaimed: boolean;
      bestRank: number;
    }>;
  }>({
    foundPrizes: false,
    totalPendingClaims: '0',
    prizes: []
  });

  // NEW STATE - Track if user has already purchased a ticket
  const [hasPurchasedTicket, setHasPurchasedTicket] = useState(false);

  // NEW STATE - Track user level counts
  const [userLevelCounts, setUserLevelCounts] = useState<any[]>([]);
  const [levelCountsLoading, setLevelCountsLoading] = useState(false);
  
  // NEW STATE - Track claim status for each round
  const [claimStatus, setClaimStatus] = useState<{[roundId: number]: boolean}>({});
  const [claimStatusLoading, setClaimStatusLoading] = useState(false);
  
  // NEW STATE - Track total prize amount
  const [totalPrizeAmount, setTotalPrizeAmount] = useState('0');
  const [prizeLoading, setPrizeLoading] = useState(false);
  
  // NEW STATE - Track claim status from contract
  const [isClaimedFromContract, setIsClaimedFromContract] = useState<boolean | null>(null);
  
  // NEW STATE - Track referral link
  const [referralLink, setReferralLink] = useState('');
  const [showReferralCopied, setShowReferralCopied] = useState(false);
  
  // NEW STATE - Track wallet switching
  const [isWalletSwitching, setIsWalletSwitching] = useState(false);

  // NEW STATE - Track if URL parameters have been processed
  const [urlProcessed, setUrlProcessed] = useState(false);

  // NEW STATE - Track confetti celebration
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [winningTicketInfo, setWinningTicketInfo] = useState<{ ticketNumber: number; rank: number; prize?: string } | null>(null);
  const [dataRefreshed, setDataRefreshed] = useState(false);
  const [confettiShownForRound, setConfettiShownForRound] = useState<number | null>(null);
  const [isDataInitializing, setIsDataInitializing] = useState(true);

  // NEW STATE - Cache for ticket prize data to avoid repeated contract calls
  const [ticketPrizeCache, setTicketPrizeCache] = useState<{[key: string]: string}>({});
  const [ticketRankCache, setTicketRankCache] = useState<{[key: string]: number}>({});

  // Unified loading state for all sections
  const [sectionLoading, setSectionLoading] = useState(false);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const {
    address,
    isConnected,
    dashboardData,
    loading,
    notification: walletNotification,
    registerUser,
    purchaseTickets,
    claimPrize,
    claimAllPrizes,
    getUserTotalPrize,
    getUserSponsorInfo,
    getUserPrizeData,
    getUserLevelCounts,
    showNotification,
    forceRefreshData,
    formatAddress,
    formatBalance,
    hasUserPurchasedTicket,
    checkIsClaimed,
    refreshDrawStatus,
    isTransactionPending,
    transactionType,
    isRefreshing
  } = useWallet();

  // Add console.log to track dashboardData changes
  useEffect(() => {
    console.log('🏠 Dashboard - dashboardData updated:', {
      isRegistered: dashboardData.isRegistered,
      userInfo: dashboardData.userInfo,
      currentRound: dashboardData.currentRound,
      totalTickets: dashboardData.totalTickets,
      ticketsSold: dashboardData.ticketsSold,
      totalPlayed: dashboardData.totalPlayed,
      address: address,
      isConnected: isConnected
    });

    // Mark data as initialized when we have valid round data
    if (dashboardData.currentRound !== undefined && dashboardData.currentRound !== null) {
      setIsDataInitializing(false);
    }
  }, [dashboardData, address, isConnected]);

  // Add debugging for wallet connection
  useEffect(() => {
    console.log('🔗 Wallet connection changed:', {
      isConnected,
      address,
      currentRound: dashboardData.currentRound
    });
  }, [isConnected, address, dashboardData.currentRound]);

  // Track wallet switching
  useEffect(() => {
    if (isConnected && address) {
      setIsWalletSwitching(true);
      setIsDataInitializing(true); // Reset initialization state when wallet changes
      const timer = setTimeout(() => {
        setIsWalletSwitching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsWalletSwitching(false);
      setIsDataInitializing(true); // Reset when wallet disconnects
    }
  }, [address]);

  // Handle URL parameters for direct navigation and referral
  useEffect(() => {
    if (typeof window !== 'undefined' && !urlProcessed) {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      const refId = urlParams.get('refId');
      
      // Set section from URL parameter if valid
      if (section && ['dashboard', 'registration', 'purchase', 'mytickets', 'claim', 'rankings', 'community', 'how to play lottery'].includes(section)) {
        setActiveSection(section);
      }
      
      // Handle referral parameter - only redirect to registration if:
      // 1. There's a refId parameter
      // 2. The refId is not the zero address
      // 3. There's no explicit section parameter OR the user is not registered
      if (refId && refId !== '0x0000000000000000000000000000000000000000') {
        setSponsorAddress(refId);
        
        // Only redirect to registration if no explicit section is set or user is not registered
        if (!section && (!dashboardData.isRegistered || !isConnected)) {
          setActiveSection('registration');
        }
      }
      
      setUrlProcessed(true);
    }
  }, [dashboardData.isRegistered, isConnected, urlProcessed]);

  // Reset URL processed flag when URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setUrlProcessed(false);
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to update URL with current section
  const updateURLWithSection = (section: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('section', section);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Function to navigate to a section and update URL
  const navigateToSection = (section: string) => {
    setActiveSection(section);
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (section === 'dashboard') {
        url.searchParams.delete('section');
      } else {
        url.searchParams.set('section', section);
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  // Update URL when activeSection changes
  useEffect(() => {
    if (activeSection && activeSection !== 'dashboard') {
      updateURLWithSection(activeSection);
    } else if (activeSection === 'dashboard') {
      // Remove section parameter for dashboard (default section)
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('section');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [activeSection]);

  // Function to generate referral link
  const generateReferralLink = () => {
    if (typeof window !== 'undefined' && address) {
      const baseUrl = window.location.origin;
      const referralUrl = `${baseUrl}/dashboard?section=registration&refId=${address}`;
      setReferralLink(referralUrl);
    }
  };

  // Function to copy referral link
  const copyReferralLink = async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        setShowReferralCopied(true);
        setTimeout(() => setShowReferralCopied(false), 2000);
        setNotification({ type: 'success', message: 'Referral link copied to clipboard! 📋' });
      } catch (err) {
        setNotification({ type: 'error', message: 'Failed to copy referral link' });
      }
    }
  };

  // Load prize data when component mounts or when relevant data changes
  useEffect(() => {
    if (isConnected && address && dashboardData.userInfo) {
      // Add a small delay for initial load to ensure all data is ready
      const timeoutId = setTimeout(() => {
        loadPrizeData();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, address, dashboardData.userInfo, dashboardData.drawExecuted, dashboardData.myTickets]);

  // Combined effect for user-specific data loading with debouncing
  useEffect(() => {
    const loadUserData = async () => {
      if (isConnected && address && dashboardData.currentRound !== undefined) {
        try {
          // Check if user has purchased tickets (only if round > 0)
          if (dashboardData.currentRound > 0) {
            const hasPurchased = await hasUserPurchasedTicket(dashboardData.currentRound);
            setHasPurchasedTicket(hasPurchased);
          } else {
            setHasPurchasedTicket(false);
          }
          
          // Load user level counts if registered
          if (dashboardData.isRegistered) {
            setLevelCountsLoading(true);
            const levelCounts = await getUserLevelCounts(address);
            setUserLevelCounts(levelCounts);
            setLevelCountsLoading(false);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setHasPurchasedTicket(false);
          setUserLevelCounts([]);
          setLevelCountsLoading(false);
        }
      } else {
        // Reset state when wallet is not connected or no current round
        setHasPurchasedTicket(false);
        setUserLevelCounts([]);
        setLevelCountsLoading(false);
      }
    };

    // Add debouncing to prevent rapid state changes
    const timeoutId = setTimeout(loadUserData, 100);
    return () => clearTimeout(timeoutId);
  }, [isConnected, address, dashboardData.currentRound, dashboardData.isRegistered]);

  // Reset local state when wallet changes
  useEffect(() => {
    // Immediately hide confetti when wallet changes to prevent showing previous wallet's data
    setShowConfetti(false);
    setHasShownConfetti(false);
    setWinningTicketInfo(null);
    setDataRefreshed(false);
    
    if (!isConnected || !address) {
      setHasPurchasedTicket(false);
      setUserLevelCounts([]);
      setClaimStatus({});
      setTotalPrizeAmount('0');
      setIsClaimedFromContract(null);
      setReferralLink('');
      setShowReferralCopied(false);
    }
  }, [isConnected, address]);

  // Reset confetti state when round changes
  useEffect(() => {
    // Only reset confetti if we're moving to a new round AND draw is not executed
    // This keeps confetti persistent for winners in the current round
    if (dashboardData.currentRound && !dashboardData.drawExecuted) {
      setShowConfetti(false);
      setWinningTicketInfo(null);
      setDataRefreshed(false);
    }
  }, [dashboardData.currentRound, dashboardData.drawExecuted]);

  // NEW EFFECT - Check for winning tickets and show confetti (Optimized)
  useEffect(() => {
    const checkForWinningTickets = async () => {
      if (!isConnected || !address || !dashboardData.currentRound || dashboardData.currentRound === 0 || !dashboardData.drawExecuted || !dashboardData.myTickets || dashboardData.myTickets.length === 0) {
    setShowConfetti(false);
    setWinningTicketInfo(null);
        return;
      }

      try {
        console.log('🎯 Checking for winning tickets in round', dashboardData.currentRound);
        let hasWinningTicket = false;
        let bestTicket: { ticketNumber: number; rank: number } | null = null;

        // Use optimized ticket rank fetching with caching
        const results = [];
        for (const ticketNumber of dashboardData.myTickets) {
          const rank = await getTicketRankOptimized(dashboardData.currentRound, ticketNumber);
          results.push({ ticketNumber, rank });
        }

        // Check for winning tickets - now show confetti for any rank >= 1
        for (const result of results) {
          if (result.rank >= 1) {
              hasWinningTicket = true;
            if (!bestTicket || result.rank < bestTicket.rank) {
              bestTicket = { ticketNumber: result.ticketNumber, rank: result.rank };
              }
          }
        }

        // Show confetti if user has any winning ticket (rank >= 1)
        if (hasWinningTicket && bestTicket) {
          console.log('🎉 User has winning ticket! Showing confetti for:', bestTicket);
          
          // Get the prize amount for the winning ticket using optimized function
          try {
            const prizeAmount = await getTicketPrizeOptimized(dashboardData.currentRound, bestTicket.ticketNumber);
            setWinningTicketInfo({ ...bestTicket, prize: prizeAmount });
          } catch (error) {
            console.error('Error getting ticket prize:', error);
          setWinningTicketInfo(bestTicket);
          }
          
          setShowConfetti(true);
        } else {
          setShowConfetti(false);
          setWinningTicketInfo(null);
        }
      } catch (error) {
        console.error('Error checking for winning tickets:', error);
        setShowConfetti(false);
        setWinningTicketInfo(null);
      }
    };

    // Add debouncing to prevent excessive calls
    const timeoutId = setTimeout(checkForWinningTickets, 200);
    return () => clearTimeout(timeoutId);
  }, [isConnected, address, dashboardData.currentRound, dashboardData.drawExecuted, dashboardData.myTickets]);

  // Reset data when wallet address changes
  useEffect(() => {
    setDataRefreshed(false);
  }, [address]);

  // Unified loading system - triggers on section change or wallet change
  useEffect(() => {
    if (isConnected && address) {
      setSectionLoading(true);
      // Reset loading after a shorter delay to ensure data is loaded properly
      const timer = setTimeout(() => {
        setSectionLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Immediately hide loading when wallet is not connected
      setSectionLoading(false);
    }
  }, [activeSection, address]);

  // Generate referral link when address changes
  useEffect(() => {
    if (address) {
      generateReferralLink();
    }
  }, [address]);

  // Helper function to get cached ticket rank or fetch from contract
  const getTicketRankOptimized = async (roundId: number, ticketNumber: number): Promise<number> => {
    const cacheKey = `${roundId}_${ticketNumber}_rank`;
    
    // Check cache first
    if (ticketRankCache[cacheKey] !== undefined) {
      return ticketRankCache[cacheKey];
    }
    
    try {
      const rank = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'getTicketRank',
        args: [BigInt(roundId), BigInt(ticketNumber)],
      }) as bigint;
      
      const rankNumber = Number(rank);
      
      // Cache the result
      setTicketRankCache(prev => ({
        ...prev,
        [cacheKey]: rankNumber
      }));
      
      return rankNumber;
    } catch (error) {
      console.error(`Error getting ticket rank for ${ticketNumber}:`, error);
      return 0;
    }
  };

  // Helper function to get cached ticket prize or fetch from contract
  const getTicketPrizeOptimized = async (roundId: number, ticketNumber: number): Promise<string> => {
    const cacheKey = `${roundId}_${ticketNumber}_prize`;
    
    // Check cache first
    if (ticketPrizeCache[cacheKey] !== undefined) {
      return ticketPrizeCache[cacheKey];
    }
    
    try {
      const ticketPrize = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
        abi: LOTTERY_ABI,
        functionName: 'calculateTicketPrize',
        args: [BigInt(roundId), BigInt(ticketNumber)],
      }) as bigint;
      
      const prizeAmount = formatEther(ticketPrize);
      
      // Cache the result
      setTicketPrizeCache(prev => ({
        ...prev,
        [cacheKey]: prizeAmount
      }));
      
      return prizeAmount;
    } catch (error) {
      console.error(`Error getting ticket prize for ${ticketNumber}:`, error);
      return '0';
    }
  };

  // Clear cache when round changes, wallet changes, or draw is executed
  useEffect(() => {
    setTicketPrizeCache({});
    setTicketRankCache({});
  }, [dashboardData.currentRound, address, dashboardData.drawExecuted]);

  // Load cache from localStorage on component mount
  useEffect(() => {
    if (dashboardData.currentRound && address) {
      try {
        const cacheKey = `ticketCache_${address}_${dashboardData.currentRound}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setTicketPrizeCache(parsed.prize || {});
          setTicketRankCache(parsed.rank || {});
          console.log('📦 Loaded ticket cache from localStorage');
        }
      } catch (error) {
        console.warn('Error loading ticket cache from localStorage:', error);
      }
    }
  }, [dashboardData.currentRound, address]);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    if (dashboardData.currentRound && address && (Object.keys(ticketPrizeCache).length > 0 || Object.keys(ticketRankCache).length > 0)) {
      try {
        const cacheKey = `ticketCache_${address}_${dashboardData.currentRound}`;
        const cacheData = {
          prize: ticketPrizeCache,
          rank: ticketRankCache,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        // Clean up old cache entries to prevent localStorage from getting too large
        const cleanupOldCache = () => {
          try {
            const keys = Object.keys(localStorage);
            const ticketCacheKeys = keys.filter(key => key.startsWith('ticketCache_'));
            
            // Keep only the last 5 rounds for each user
            const userCacheKeys = ticketCacheKeys.filter(key => key.includes(address || ''));
            if (userCacheKeys.length > 5) {
              const sortedKeys = userCacheKeys.sort((a, b) => {
                const roundA = parseInt(a.split('_').pop() || '0');
                const roundB = parseInt(b.split('_').pop() || '0');
                return roundB - roundA; // Sort by round number descending
              });
              
              // Remove oldest entries
              const keysToRemove = sortedKeys.slice(5);
              keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🧹 Cleaned up old ticket cache: ${key}`);
              });
            }
          } catch (error) {
            console.warn('Error cleaning up old ticket cache:', error);
          }
        };
        
        cleanupOldCache();
      } catch (error) {
        console.warn('Error saving ticket cache to localStorage:', error);
      }
    }
  }, [ticketPrizeCache, ticketRankCache, dashboardData.currentRound, address]);

  // Function to get total prize amount for current round
  const getTotalPrizeAmount = async () => {
    if (!isConnected || !address || !dashboardData.currentRound || dashboardData.currentRound === 0) {
      setTotalPrizeAmount('0');
      return;
    }

    setPrizeLoading(true);
    try {
      console.log(`🔍 Getting total prize for Round ${dashboardData.currentRound} and user ${address}`);
      const totalPrize = await getUserTotalPrize(dashboardData.currentRound, address);
      const prizeValue = parseFloat(formatEther(BigInt(totalPrize || '0')));
      
      console.log(`💰 Total prize found: ${prizeValue} USDT`);
      setTotalPrizeAmount(prizeValue.toFixed(4));
    } catch (error) {
      console.error('❌ Error getting total prize:', error);
      setTotalPrizeAmount('0');
    } finally {
      setPrizeLoading(false);
    }
  };

  // Load claim status for each round when prize data is available
  useEffect(() => {
    const loadClaimStatus = async () => {
      if (isConnected && address && prizeData.foundPrizes && prizeData.prizes.length > 0) {
        setClaimStatusLoading(true);
        try {
          console.log('🔍 Loading claim status for all rounds...');
          console.log('📊 Prize data:', prizeData.prizes);
          const newClaimStatus: {[roundId: number]: boolean} = {};
          
          // Check claim status for each round
          for (const prize of prizeData.prizes) {
            console.log(`🔍 Checking claim status for Round ${prize.roundId} with address ${address}`);
            const isClaimed = await checkIsClaimed(address, prize.roundId);
            newClaimStatus[prize.roundId] = isClaimed;
            console.log(`Round ${prize.roundId} claim status:`, isClaimed);
          }
          
          setClaimStatus(newClaimStatus);
          console.log('📊 Final claim status loaded:', newClaimStatus);
          
          // Debug: Check if any prizes should show claim buttons
          const hasUnclaimedPrizes = prizeData.prizes.some((prize: any) => !newClaimStatus[prize.roundId]);
          console.log('🎯 Has unclaimed prizes:', hasUnclaimedPrizes);
          
        } catch (error) {
          console.error('❌ Error loading claim status:', error);
        } finally {
          setClaimStatusLoading(false);
        }
      }
    };

    loadClaimStatus();
  }, [isConnected, address, prizeData.foundPrizes, prizeData.prizes]);

  // NEW EFFECT - Check claim status from contract for current round
  useEffect(() => {
    const checkContractClaimStatus = async () => {
      if (isConnected && address && dashboardData.currentRound && dashboardData.currentRound > 0) {
        try {
          console.log('🔍 Checking contract claim status for current round...');
          const isClaimed = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
            abi: LOTTERY_ABI,
            functionName: 'isClaimed',
            args: [address as `0x${string}`, BigInt(dashboardData.currentRound)],
          }) as boolean;
          
          setIsClaimedFromContract(isClaimed);
          console.log('📊 Contract claim status:', isClaimed);
        } catch (error) {
          console.error('❌ Error checking contract claim status:', error);
          setIsClaimedFromContract(null);
        }
      }
    };

    checkContractClaimStatus();
  }, [isConnected, address, dashboardData.currentRound]);

  // Function to handle ticket click and show details
  const handleTicketClick = async (ticketNumber: number) => {
    if (!dashboardData.currentRound || dashboardData.currentRound === 0) {
      alert('No active round available');
      return;
    }
    
    try {
      // Determine ticket status
      const isMyTicket = dashboardData.myTickets?.includes(ticketNumber) || false;
      const isSold = ticketNumber <= (dashboardData.ticketsSold || 0);
      const isAvailable = !isSold;
      
      let rank = 0;
      let prize = '0';
      let owner = isMyTicket ? (address || 'Your Address') : (isSold ? 'Sold to User' : 'Available');
      
      // Get actual rank and prize data from contract if draw is executed
      if (dashboardData.drawExecuted && isSold) {
        try {
          // Get ticket rank using optimized function
          rank = await getTicketRankOptimized(dashboardData.currentRound, ticketNumber);
          
          // Get ticket prize if it has a rank using optimized function
          if (rank > 0) {
            prize = formatUSDT(await getTicketPrizeOptimized(dashboardData.currentRound, ticketNumber));
          }
          
          // Get ticket owner
          const ticketOwner = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
            abi: LOTTERY_ABI,
            functionName: 'getTicketOwner',
            args: [BigInt(dashboardData.currentRound), BigInt(ticketNumber)],
          }) as string;
          
          owner = ticketOwner;
          
        } catch (contractError) {
          console.warn(`Could not get contract data for ticket ${ticketNumber}:`, contractError);
        }
      }
      
      // Create ticket details object with real data
      const ticketDetails = {
        ticketNumber,
        owner,
        rank,
        prize,
        isMyTicket,
        isWinner: dashboardData.winningNumber === ticketNumber && dashboardData.drawExecuted,
        isAvailable,
        status: isAvailable ? 'Available' : 'Sold'
      };
      
      console.log('🎫 Ticket details:', ticketDetails);
      setSelectedTicket(ticketDetails);
      setShowTicketModal(true);
      
    } catch (error) {
      console.error('Error showing ticket details:', error);
      alert('Error showing ticket details');
    }
  };

  // Function to get ticket status class
  const getTicketStatusClass = (ticketNumber: number) => {
    // Add null checks to prevent runtime errors
    const myTickets = dashboardData.myTickets || [];
    const ticketsSold = dashboardData.ticketsSold || 0;
    const winningNumber = dashboardData.winningNumber || 0;
    const drawExecuted = dashboardData.drawExecuted || false;
    
    if (myTickets.includes(ticketNumber)) {
      return "bg-blue-600 hover:bg-blue-700 text-white"; // Light blue for my tickets
    } else if (winningNumber === ticketNumber && drawExecuted) {
      return "bg-yellow-500 hover:bg-yellow-600 text-black"; // Yellow for winners
    } else if (ticketNumber <= ticketsSold) {
      return "bg-orange-500 hover:bg-orange-600 text-white"; // Orange for sold tickets
    } else {
      return "bg-gray-700 hover:bg-gray-600 text-gray-300"; // Gray for available tickets
    }
  };

  const handleRegister = async () => {
    await registerUser(sponsorAddress || '0x0000000000000000000000000000000000000000');
  };

  const handlePurchase = async () => {
    // Validate ticket count
    const ticketCount = parseInt(numTickets);
    if (!ticketCount || ticketCount < 1 || ticketCount > 50) {
      setNotification({ type: 'error', message: 'Please enter a valid number of tickets (1-50)' });
      return;
    }
    
    try {
      // Purchase the specified number of tickets
      await purchaseTickets(ticketCount);
      
      // Only mark as purchased after successful purchase
      setHasPurchasedTicket(true);
      setNotification({ type: 'success', message: `Successfully purchased ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}!` });
    } catch (error: any) {
      console.error('Purchase failed:', error);
      // Don't set hasPurchasedTicket to true if purchase fails
      setNotification({ type: 'error', message: error.message || 'Ticket purchase failed' });
    }
  };

  const handleClaim = async (roundId?: number) => {
    try {
      if (!isConnected) {
        setNotification({ type: 'error', message: 'Please connect your wallet first' });
        return;
      }

      if (!roundId) {
        setNotification({ type: 'error', message: 'Invalid round ID' });
        return;
      }

      setClaimLoading(true);
      setNotification({ type: 'info', message: 'Processing prize claim...' });
      
      await claimPrize(roundId);
      
      setNotification({ type: 'success', message: 'Prize claimed successfully! 🏆' });
      
      // Mark round as claimed in localStorage (exact same as register.js)
      try {
        const claimedRounds = JSON.parse(localStorage.getItem(`claimedRounds_${address}`) || '[]');
        if (!claimedRounds.includes(roundId)) {
          claimedRounds.push(roundId);
          localStorage.setItem(`claimedRounds_${address}`, JSON.stringify(claimedRounds));
          console.log(`Round ${roundId} marked as claimed in localStorage`);
        }
      } catch (error) {
        console.warn('Could not update localStorage for claimed round');
      }
      
      // Refresh data after successful claim (exact same as register.js)
      setTimeout(() => {
        loadPrizeData();
        // Clear cache after successful claim to ensure fresh data
        setTicketPrizeCache({});
        setTicketRankCache({});
      }, 3000);

    } catch (error: any) {
      console.error('❌ Claim error:', error);
      
      let errorMessage = 'Claim failed';
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('no prize')) {
        errorMessage = 'No prize available to claim';
      } else if (error.message?.includes('already claimed')) {
        errorMessage = 'Prize already claimed';
      } else {
        errorMessage = 'Claim failed: ' + error.message;
      }
      
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setClaimLoading(false);
    }
  };

  // Load Prize Data Function - Using exact logic from register.js but only current round
  // Add ref to track if loadPrizeData is already running
  const loadPrizeDataRef = useRef(false);
  const lastLoadPrizeDataTimeRef = useRef(0);

  const loadPrizeData = async () => {
    // Prevent multiple simultaneous loads
    if (loadPrizeDataRef.current) {
      console.log('🔄 loadPrizeData already in progress, skipping...');
      return;
    }

    // Debounce: prevent loading more than once every 500ms (reduced from 3 seconds)
    // But allow immediate load if this is the first time (lastLoadPrizeDataTimeRef.current is 0)
    const now = Date.now();
    if (lastLoadPrizeDataTimeRef.current > 0 && now - lastLoadPrizeDataTimeRef.current < 500) {
      console.log('🔄 Debouncing loadPrizeData request...');
      return;
    }

    try {
      if (!address || !dashboardData.userInfo) return;
      
      loadPrizeDataRef.current = true;
      lastLoadPrizeDataTimeRef.current = now;
      
      console.log('🏆 Loading current round pending claims...');
      
      let totalPendingClaims = 0;
      let prizes: any[] = [];
      let hasTop3Rank = false; // Track if user has tickets ranked 1-3
      
      // Only check current round
      const currentRound = dashboardData.currentRound || 1;
      
      // Check if draw is executed for current round
      if (!dashboardData.drawExecuted) {
        console.log('Draw not executed yet for current round');
        setPrizeData({
          foundPrizes: false,
          totalPendingClaims: '0',
          prizes: []
        });
        return;
      }
      
      // Additional check to ensure we have valid round data
      if (!dashboardData.ticketsSold || dashboardData.ticketsSold === 0) {
        console.log('No tickets sold in current round');
        setPrizeData({
          foundPrizes: false,
          totalPendingClaims: '0',
          prizes: []
        });
        return;
      }
      
      try {
        // Get user tickets for current round - handle the error gracefully
        let userTickets: bigint[] = [];
        try {
          userTickets = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
            abi: LOTTERY_ABI,
            functionName: 'getUserTickets',
            args: [BigInt(currentRound), address as `0x${string}`],
          }) as bigint[];
          
          console.log('🎫 User tickets for current round:', userTickets.length);
        } catch (userTicketsError) {
          console.warn('⚠️ Could not load user tickets:', userTicketsError);
          // If getUserTickets fails, try to get tickets from dashboardData.myTickets
          if (dashboardData.myTickets && dashboardData.myTickets.length > 0) {
            userTickets = dashboardData.myTickets.map((ticket: any) => BigInt(ticket));
            console.log('🎫 Using dashboardData.myTickets as fallback:', userTickets.length);
          } else {
          userTickets = [];
          }
        }
        
        if (userTickets.length === 0) {
          console.log('No tickets found for current round');
          setPrizeData({
            foundPrizes: false,
            totalPendingClaims: '0',
            prizes: []
          });
          return;
        }
        
        // Check each ticket for prizes in current round
        let roundPrizes = [];
        let totalRoundPrize = BigInt(0);
        
        for (const ticketNumber of userTickets) {
          // Stop searching if we already found a top 3 rank
          if (hasTop3Rank) {
            break;
          }
          
          // Only check tickets that are within the sold range
          if (parseInt(ticketNumber.toString()) > (dashboardData.ticketsSold || 0)) {
            console.log(`Skipping ticket ${ticketNumber} - not sold yet (only ${dashboardData.ticketsSold} sold)`);
            continue;
          }
          
          try {
            // First check if the ticket exists and is sold
            const ticketOwner = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
              abi: LOTTERY_ABI,
              functionName: 'getTicketOwner',
              args: [BigInt(currentRound), BigInt(ticketNumber)],
            }) as string;
            
            // Only check rank if ticket is owned by someone (not zero address)
            if (ticketOwner && ticketOwner !== '0x0000000000000000000000000000000000000000') {
              try {
                // Get ticket rank using optimized function
                const rank = await getTicketRankOptimized(currentRound, parseInt(ticketNumber.toString()));
                
                // Check if this is a top 3 rank (1-3) - if found, we can stop searching
                if (rank >= 1 && rank <= 3) {
                  hasTop3Rank = true;
                  console.log(`🎉 Found top 3 rank (${rank}) for ticket ${ticketNumber}! Stopping search.`);
                  // Store winning ticket info for confetti display
                  try {
                    const prizeAmount = await getTicketPrizeOptimized(currentRound, parseInt(ticketNumber.toString()));
                    setWinningTicketInfo({ ticketNumber: parseInt(ticketNumber.toString()), rank: rank, prize: prizeAmount });
                  } catch (error) {
                    console.error('Error getting ticket prize:', error);
                  setWinningTicketInfo({ ticketNumber: parseInt(ticketNumber.toString()), rank: rank });
                  }
                  // Continue processing this ticket for prize data, but we won't search more tickets
                }
                
                if (rank > 0) {
                  try {
                    // Calculate prize for this ticket using optimized function
                    const prizeAmount = await getTicketPrizeOptimized(currentRound, parseInt(ticketNumber.toString()));
                    const prizeInWei = parseFloat(prizeAmount) * Math.pow(10, 18);
                    
                    if (prizeInWei > 0) {
                      roundPrizes.push({
                        ticketNumber: ticketNumber.toString(),
                        rank: rank,
                        prize: prizeInWei.toString()
                      });
                      totalRoundPrize += BigInt(prizeInWei);
                    }
                  } catch (prizeError) {
                    console.warn(`Could not calculate prize for ticket ${ticketNumber} in round ${currentRound}:`, prizeError);
                  }
                }
              } catch (rankError) {
                // If getTicketRank fails, it might mean the ticket has no rank (not a winner)
                // or the function doesn't exist in this contract version
                console.log(`Ticket ${ticketNumber} has no rank in round ${currentRound} (not a winner or function not available)`);
                
                // Try alternative approach - check if this is the winning ticket
                try {
                  if (dashboardData.winningNumber === parseInt(ticketNumber.toString())) {
                    // This is the winning ticket, give it rank 1
                    hasTop3Rank = true; // Winning ticket is rank 1
                    console.log(`🎉 Found winning ticket ${ticketNumber}! Stopping search.`);
                    // Store winning ticket info for confetti display
                    try {
                      const prizeAmount = await getTicketPrizeOptimized(currentRound, parseInt(ticketNumber.toString()));
                      setWinningTicketInfo({ ticketNumber: parseInt(ticketNumber.toString()), rank: 1, prize: prizeAmount });
                    } catch (error) {
                      console.error('Error getting ticket prize:', error);
                    setWinningTicketInfo({ ticketNumber: parseInt(ticketNumber.toString()), rank: 1 });
                    }
                    
                    // Get ticket prize for prize data processing
                    try {
                      const prizeAmount = await getTicketPrizeOptimized(currentRound, parseInt(ticketNumber.toString()));
                      const prizeInWei = parseFloat(prizeAmount) * Math.pow(10, 18);
                      
                      if (prizeInWei > 0) {
                      roundPrizes.push({
                        ticketNumber: ticketNumber.toString(),
                        rank: 1, // Winning ticket gets rank 1
                          prize: prizeInWei.toString()
                      });
                        totalRoundPrize += BigInt(prizeInWei);
                      }
                    } catch (prizeError) {
                      console.warn(`Could not calculate prize for winning ticket ${ticketNumber} in round ${currentRound}:`, prizeError);
                    }
                  }
                } catch (altError) {
                  console.warn(`Alternative prize check failed for ticket ${ticketNumber}:`, altError);
                }
              }
            } else {
              console.log(`Ticket ${ticketNumber} is not owned by anyone in round ${currentRound}`);
            }
          } catch (error) {
            console.warn(`Could not check ticket ${ticketNumber} in round ${currentRound}:`, error);
          }
        }
        
        // Show confetti celebration if user has top 3 rank and draw is executed
        if (hasTop3Rank && dashboardData.drawExecuted && dataRefreshed && address && dashboardData.userInfo) {
          console.log('🎉 User has top 3 rank! Showing persistent confetti celebration!');
          setShowConfetti(true);
          setHasShownConfetti(true);
        }
        
        // If current round has prizes, check claim status
        if (roundPrizes.length > 0) {
          // Check if already claimed using the isClaimed function
          let isAlreadyClaimed = false;
          try {
            isAlreadyClaimed = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
              abi: LOTTERY_ABI,
              functionName: 'isClaimed',
              args: [BigInt(currentRound), address as `0x${string}`],
            }) as boolean;
            console.log(`🏆 User claim status for round ${currentRound}:`, isAlreadyClaimed);
          } catch (claimError) {
            console.warn('⚠️ Could not check claim status, using localStorage fallback:', claimError);
            // Fallback to localStorage
          const claimedRounds = JSON.parse(localStorage.getItem(`claimedRounds_${address}`) || '[]');
            isAlreadyClaimed = claimedRounds.includes(currentRound);
          }
          
          // Only add to pending claims if not claimed yet
          if (!isAlreadyClaimed) {
            totalPendingClaims = Number(totalRoundPrize);
          }
          
          const rankNames = {
            1: '1st Place', 2: '2nd Place', 3: '3rd Place',
            4: '4th Place', 5: '5th Place', 6: '6th Place',
            7: '7th Place', 8: '8th Place', 9: '9th Place', 10: '10th Place'
          };
          
          const bestRank = Math.min(...roundPrizes.map((p: any) => p.rank));
          
          prizes.push({
            roundId: currentRound,
            userTickets: userTickets.length,
            roundPrizes,
            totalRoundPrize: totalRoundPrize.toString(),
            isAlreadyClaimed,
            bestRank
          });
        }
        
      } catch (error) {
        console.warn(`Could not check current round ${currentRound} for prizes:`, error);
      }
      
      // Convert totalPendingClaims from wei to USDT
      const formattedPendingClaims = formatUSDT(formatEther(BigInt(totalPendingClaims)));
      
      setPrizeData({
        foundPrizes: prizes.length > 0,
        totalPendingClaims: formattedPendingClaims,
        prizes
      });
      
      // Mark data as refreshed for current wallet
      setDataRefreshed(true);
      
    } catch (error) {
      console.error('❌ Error loading current round prize data:', error);
      setPrizeData({
        foundPrizes: false,
        totalPendingClaims: '0',
        prizes: []
      });
      // Mark data as refreshed even on error to prevent infinite loading
      setDataRefreshed(true);
    } finally {
      // Reset the loading flag
      loadPrizeDataRef.current = false;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        if (sectionLoading) {
          return (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
              <p className="text-lg md:text-xl">Loading dashboard data...</p>
              <p className="text-sm md:text-base text-gray-500 mt-2">
                {isConnected && address 
                  ? "Please wait while we fetch your lottery information" 
                  : "Please connect your wallet to view dashboard data"
                }
              </p>
            </div>
          );
        }
        // Check if user is connected but no dashboard data is available yet
        if (isConnected && address && (dashboardData.currentRound === undefined || dashboardData.currentRound === null || !dashboardData.userInfo)) {
          return (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
              <p className="text-lg md:text-xl">Initializing dashboard...</p>
              <p className="text-sm md:text-base text-gray-500 mt-2">Please wait while we load your data</p>
            </div>
          );
        }

        return (
          <>
            {/* Timer, Promotional Card, and Purchase Section */}
            {roundCreatedAt && (
              <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4 mb-6">
                {/* Digital Timer Display */}
                <div className="bg-[#0f1f4a] border-2 border-[#1C3172] rounded-xl px-4 md:p-6 shadow-lg flex flex-col items-center justify-center w-full sm:w-1/3 min-h-[140px] md:min-h-[160px]">
                  <div className="text-sm md:text-base text-yellow-800 mb-2 font-medium">Time since round creation</div>
                  <div className="text-lg md:text-xl lg:text-2xl font-mono font-bold text-white tracking-widest bg-[#1C3172] px-3 py-1 rounded border border-[#2a4a8a]">
                    {timeSince}
                  </div>
                </div>

                {/* Buy TRDO Promotional Card */}
                <div className="w-full sm:w-1/3 min-h-[140px] md:min-h-[160px]">
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 md:p-6 text-center border border-gray-700 shadow-2xl group hover:shadow-blue-500/20 transition-all duration-500 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-yellow-400 before:via-orange-500 before:to-red-500 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10 before:blur-sm h-full flex flex-col justify-center">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-2 -right-2 w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '0.5s'}}></div>
                    
                    {/* Main content */}
                    <div className="relative z-10">
                      <div className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4">
                        Get TRDO tokens to purchase tickets
                      </div>
                      
                      <a
                        href="https://www.biconomy.com/exchange/TRDO_USDT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-gray-900 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 active:scale-95 w-full inline-block"
                      >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        <span className="relative z-10 flex items-center justify-center">
                          🛒 Buy TRDO
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Purchase Ticket Button or Ticket Card */}
                <div className="w-full sm:w-1/3 min-h-[140px] md:min-h-[160px]">
                  {!isConnected ? (
                    <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center h-full flex flex-col justify-center">
                      <div className="text-gray-400 text-sm mb-2">Connect wallet to purchase tickets</div>
              </div>
                  ) : !dashboardData.isRegistered ? (
                    <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center h-full flex flex-col justify-center">
                      <div className="text-gray-400 text-sm mb-2">Register first to purchase tickets</div>
                      <button
                        onClick={() => navigateToSection('registration')}
                        className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 active:scale-95"
                      >
                        Register Now
                      </button>
                    </div>
                  ) : hasPurchasedTicket ? (
                    // Enhanced lottery-themed ticket card
                    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl p-4 md:p-6 text-center shadow-2xl group hover:shadow-yellow-500/30 transition-all duration-500 transform hover:scale-105 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-yellow-300 before:via-orange-400 before:to-red-400 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10 before:blur-md h-full flex flex-col justify-center">
                      {/* Animated sparkles */}
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 text-yellow-200 animate-pulse text-sm md:text-base">✨</div>
                      <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 text-yellow-200 animate-pulse text-sm md:text-base" style={{animationDelay: '0.3s'}}>✨</div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative z-10">
                        <div className="text-sm md:text-base lg:text-xl font-mono font-bold text-blue-800 mb-1 md:mb-2 tracking-wide">
                          Ticket Number:{dashboardData.myTickets && dashboardData.myTickets.length > 0 ? dashboardData.myTickets[0] : 'N/A'}
                        </div>
                        {/* <div className="text-gray-700 text-xs md:text-sm font-semibold">Round #{dashboardData.currentRound}</div> */}
                      </div>
                    </div>
                  ) : (
                    // Enhanced lottery-themed purchase section
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 md:p-6 text-center border border-gray-700 shadow-2xl group hover:shadow-blue-500/20 transition-all duration-500 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-yellow-400 before:via-orange-500 before:to-red-500 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:-z-10 before:blur-sm h-full flex flex-col justify-center">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -top-2 -right-2 w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '0.5s'}}></div>
                      
                      {/* Main content */}
                      <div className="relative z-10">
                        
                        <div className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4">
                        Are you ready to win big!
                        </div>
                        
                        <button
                          onClick={async () => {
                            try {
                              await purchaseTickets(1);
                              setHasPurchasedTicket(true);
                              setNotification({ type: 'success', message: 'Successfully purchased 1 ticket! 🎫' });
                            } catch (error: any) {
                              console.error('Purchase failed:', error);
                              setNotification({ type: 'error', message: error.message || 'Ticket purchase failed' });
                            }
                          }}
                          disabled={!isConnected || loading || isWalletSwitching || hasPurchasedTicket || (dashboardData.totalTickets <= dashboardData.ticketsSold) || dashboardData.drawExecuted}
                          className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-gray-900 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 active:scale-95 w-full"
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          <span className="relative z-10 flex items-center justify-center">
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-gray-900 mr-2"></div>
                                <span className="text-xs md:text-sm">Processing...</span>
                              </>
                            ) : isWalletSwitching ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-gray-900 mr-2"></div>
                                <span className="text-xs md:text-sm">Switching Wallet...</span>
                              </>
                            ) : hasPurchasedTicket ? (
                              <span className="text-xs md:text-sm">Already Purchased</span>
                            ) : (dashboardData.totalTickets <= dashboardData.ticketsSold) ? (
                              <span className="text-xs md:text-sm">Sold Out</span>
                            ) : dashboardData.drawExecuted ? (
                              <span className="text-xs md:text-sm">Draw Completed</span>
                            ) : (
                              <>
                                <span className="text-xs md:text-sm">🎫 Purchase Ticket</span>
                              </>
                            )}
                          </span>
                        </button>
                        
                        
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Stats Grid - Mobile Vertical Layout */}
            <div className="flex flex-col space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              <StatCard 
                icon=""
                iconImage="18.png"
                title="Current Round" 
                value={dashboardData.currentRound || 0} 
                subtitle="Active lottery round" 
                isLoading={isDataInitializing || dashboardData.currentRound === 0}
              />
              <StatCard 
                icon=""
                iconImage="15.png"
                title="Total Tickets" 
                value={dashboardData.totalTickets || 0} 
                subtitle="Available in current round"
                iconSize={80} 
                isLoading={isDataInitializing || dashboardData.currentRound === 0}
              />
              <StatCard 
                icon=""
                iconImage="14.png"
                title="Tickets Sold" 
                value={dashboardData.ticketsSold || 0} 
                subtitle={`${(dashboardData.totalTickets || 0) - (dashboardData.ticketsSold || 0)} remaining`} 
                isLoading={isDataInitializing || dashboardData.currentRound === 0}
              />
              <StatCard 
                icon=""
                iconImage="11.png"
                title="Prize Pool" 
                value={formatUSDT(dashboardData.prizePool || '0')}
                subtitle="TRDO" 
                isLoading={isDataInitializing || dashboardData.currentRound === 0}
              />
            </div>
            
            <div className="flex flex-col space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              <StatCard 
                icon=""
                iconImage="19.png"
                title="Ticket Price" 
                value={formatUSDT(dashboardData.ticketPrice || '0')} 
                subtitle="TRDO per ticket" 
                isLoading={isDataInitializing || dashboardData.currentRound === 0}
              />
              <div className="relative">
              <StatCard 
                icon=""
                iconImage="13.png"
                title="Draw Status" 
                value={dashboardData.drawExecuted ? "Completed" : "Pending"} 
                subtitle="Current round status" 
                  isLoading={isDataInitializing || dashboardData.currentRound === 0}
                />
                {/* Manual refresh button for draw status */}
                {!dashboardData.drawExecuted && (
                  <button
                    onClick={async () => {
                      try {
                        setNotification({ type: 'info', message: 'Checking draw status...' });
                        await refreshDrawStatus();
                      } catch (error) {
                        console.error('Error refreshing draw status:', error);
                        setNotification({ type: 'error', message: 'Failed to refresh draw status' });
                      }
                    }}
                    disabled={loading}
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-1 rounded-full transition duration-300 text-xs"
                    title="Refresh draw status"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      '🔄'
                    )}
                  </button>
                )}
              </div>
              <StatCard 
                icon=""
                iconImage="16.png"
                title="Total Played TRDO" 
                value={formatUSDT(dashboardData.totalPlayed || '0')} 
                subtitle="Total TRDO played"
                isLoading={isDataInitializing || dashboardData.currentRound === 0}
              />
            </div>

            {/* Confetti Celebration - Show in dashboard section */}
            {showConfetti && (
              <div className="mb-6 md:mb-8">
          <style>{`
            @keyframes fall {
              0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }
            .animate-fall {
              animation: fall linear infinite;
            }
          `}</style>
          <ConfettiCelebration winningTicketInfo={winningTicketInfo} />
              </div>
            )}

            {/* Live Tickets Board */}
            {/* <div className="mt-6 md:mt-8 relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/dbg.png"
                  alt="Dashboard Background"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  quality={100}
                />
              </div> */}
              
              {/* <div className="relative z-10 p-3 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-white">🎫 Live Tickets Board</h2>
                
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 md:gap-2 mb-4 md:mb-6">
                  {Array.from({length: dashboardData.totalTickets || 0}, (_, i) => i + 1).map((ticketNumber) => (
                    <button 
                      key={ticketNumber}
                      className={`${getTicketStatusClass(ticketNumber)} aspect-square rounded flex items-center justify-center transition-all duration-200 text-xs md:text-sm font-mono`}
                      onClick={() => handleTicketClick(ticketNumber)}
                    >
                      {String(ticketNumber).padStart(3, '0')}
                    </button>
                  ))}
                </div>
              </div> 
            {/* </div> */}

            {dashboardData.drawExecuted && (
              <TopRankedTicketsSection currentRound={dashboardData.currentRound} />
            )}
          </>
        );

      case 'registration':
        if (sectionLoading) {
        return (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
              <p className="text-lg md:text-xl">Loading registration data...</p>
              <p className="text-sm md:text-base text-gray-500 mt-2">Please wait while we fetch your registration information</p>
            </div>
          );
        }
        return (
          <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Join the Lottery</h2>
              
              {dashboardData.isRegistered ? (
                <div className="text-center">
                  <div className="text-green-500 text-4xl md:text-6xl mb-3 md:mb-4">✅</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Already Registered!</h3>
                  {dashboardData.userInfo && (
                    <div className="space-y-2 text-xs md:text-sm text-gray-300 mb-4">
                      <p><strong>Sponsor:</strong> {formatAddress(dashboardData.userInfo.sponsor)}</p>
                      <p><strong>Total Tickets:</strong> {dashboardData.userInfo.totalTicketsPurchased || 0}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm md:text-base">Sponsor Address (Optional)</label>
                    <input
                      type="text"
                      placeholder="Sponsor address (optional)"
                      value={sponsorAddress}
                      onChange={(e) => setSponsorAddress(e.target.value)}
                      className="w-full p-2 md:p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                    />
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={!isConnected || loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 md:py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 disabled:opacity-50 text-sm md:text-base"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Referral Link Section - Only show if user is registered */}
            {dashboardData.isRegistered && (
              <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-center flex items-center justify-center">
                  <span className="mr-2">🔗</span>
                  Your Referral Link
                </h3>
                
                <div className="space-y-3 md:space-y-4">
                  <p className="text-sm md:text-base text-gray-300 text-center">
                    Share this link with friends to earn sponsor income when they register!
                  </p>
                  
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs md:text-sm text-gray-400">Your Address:</span>
                      <span className="text-xs md:text-sm font-mono text-blue-400">{formatAddress(address || '')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 p-2 md:p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-xs md:text-sm font-mono"
                        placeholder="Generating referral link..."
                      />
                      <button
                        onClick={copyReferralLink}
                        disabled={!referralLink}
                        className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition duration-300 text-xs md:text-sm flex items-center ${
                          !referralLink
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : showReferralCopied
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {showReferralCopied ? (
                          <>
                            <span className="mr-1">✅</span>
                            Copied!
                          </>
                        ) : (
                          <>
                            <span className="mr-1">📋</span>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-400 mb-2">
                      When someone uses your referral link:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div className="bg-green-900 border border-green-600 rounded-lg p-2">
                        <span className="text-green-400 font-semibold">✅</span>
                        <span className="text-gray-300">They get auto-filled sponsor</span>
                      </div>
                      <div className="bg-blue-900 border border-blue-600 rounded-lg p-2">
                        <span className="text-blue-400 font-semibold">💰</span>
                        <span className="text-gray-300">You earn sponsor income</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'purchase':
        if (sectionLoading) {
          return (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
              <p className="text-lg md:text-xl">Loading purchase data...</p>
              <p className="text-sm md:text-base text-gray-500 mt-2">Please wait while we fetch ticket information</p>
            </div>
          );
        }
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Purchase Tickets</h2>
              
              {!dashboardData.isRegistered ? (
                <div className="text-center text-gray-400">
                  <p className="text-4xl md:text-6xl mb-3 md:mb-4">📝</p>
                  <p className="text-sm md:text-base">Please register first before purchasing tickets</p>
                  <button
                    onClick={() => navigateToSection('registration')}
                    className="mt-3 md:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded text-sm md:text-base"
                  >
                    Register Now
                  </button>
                </div>
              ) : hasPurchasedTicket ? (
                // User has already purchased tickets
                <div className="text-center text-gray-400">
                  <p className="text-4xl md:text-6xl mb-3 md:mb-4">✅</p>
                  <p className="text-sm md:text-base font-semibold text-green-400 mb-2">Tickets Already Purchased!</p>
                  <p className="text-xs md:text-sm">You can only purchase tickets once per round. Your tickets are ready for the draw.</p>
                  <button
                    onClick={() => navigateToSection('mytickets')}
                    className="mt-3 md:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded text-sm md:text-base"
                  >
                    View My Tickets
                  </button>
                </div>
              ) : (
                // User can purchase a ticket
                <>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm md:text-base">Number of Tickets</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={numTickets}
                      onChange={(e) => setNumTickets(e.target.value)}
                      placeholder="Enter number of tickets (1-50)"
                      className="w-full p-2 md:p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum 50 tickets per user per round</p>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 mb-4">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Price per ticket:</span>
                      <span>{formatUSDT(dashboardData.ticketPrice || '0')} TRDO</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Number of tickets:</span>
                      <span>{numTickets || '0'}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sm md:text-base border-t border-gray-700 pt-2 mt-2">
                      <span>Total cost:</span>
                      <span>{formatUSDT((parseFloat(dashboardData.ticketPrice || '0') * (parseInt(numTickets) || 0)).toString())} TRDO</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={!isConnected || loading || isWalletSwitching || hasPurchasedTicket || !numTickets || parseInt(numTickets) < 1 || parseInt(numTickets) > 50}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 md:py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 disabled:opacity-50 text-sm md:text-base"
                  >
                    {loading ? 'Processing...' : isWalletSwitching ? 'Switching Wallet...' : hasPurchasedTicket ? 'Already Purchased' : `Purchase ${numTickets || '0'} Ticket${parseInt(numTickets) > 1 ? 's' : ''}`}
                  </button>
                </>
              )}
            </div>

            {/* Purchase History Section */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
                <h3 className="text-lg md:text-xl font-bold flex items-center">
                  <span className="mr-2">📊</span>
                  Purchase History
                </h3>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center text-sm md:text-base"
                  onClick={() => window.location.reload()}
                >
                  <span className="mr-2">🔄</span>
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Round</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Tickets</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Amount Paid</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.userPurchaseHistory && dashboardData.userPurchaseHistory.length > 0 ? (
                      dashboardData.userPurchaseHistory.map((purchase: any, index: number) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{purchase.roundId}</td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{purchase.ticketsCount}</td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{purchase.amountPaid}</td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{purchase.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 md:py-8 text-center text-gray-400">
                          <div className="text-3xl md:text-4xl mb-2">📊</div>
                          <div className="text-sm md:text-lg font-semibold mb-1">No purchase history</div>
                          <div className="text-xs md:text-sm">Your ticket purchases will appear here</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'claim':
        if (sectionLoading) {
          return (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
              <p className="text-lg md:text-xl">Loading claim data...</p>
              <p className="text-sm md:text-base text-gray-500 mt-2">Please wait while we fetch your prize information</p>
            </div>
          );
        }
        return (
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
              {/* Premium Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-600/50 shadow-2xl p-6 md:p-8">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">🏆</div>
                <div className="absolute bottom-4 left-4 text-orange-400 animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl md:text-4xl">🏆</div>
                      <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text">
                          Claim Prizes
                        </h2>
                        <p className="text-sm md:text-base text-gray-300 mt-1">Collect your lottery winnings</p>
                      </div>
                    </div>
                    
                  <button 
                      className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/30 active:scale-95 group"
                    onClick={() => {
                      refreshDrawStatus();
                    }}
                  >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative z-10 flex items-center">
                        <span className="mr-2 text-lg">🎲</span>
                    Check Draw Status
                      </span>
                  </button>
                  </div>
                </div>
              </div>
              
              {sectionLoading ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
                  <p className="text-lg md:text-xl">Loading claim data...</p>
                  <p className="text-sm md:text-base text-gray-500 mt-2">Please wait while we fetch your prize information</p>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* Premium Prize Statistics - Symmetrical Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    {/* Total Tickets Card */}
                    <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-900/90 backdrop-blur-sm border-2 border-blue-500/50 shadow-xl hover:shadow-blue-500/40 transition-all duration-500 transform hover:scale-105">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-cyan-600/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-3 right-3 text-blue-300 animate-pulse text-lg">🎫</div>
                      <div className="absolute bottom-3 left-3 text-cyan-300 animate-pulse text-lg" style={{animationDelay: '0.5s'}}>✨</div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 p-4 md:p-6 text-center">
                        <div className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text mb-2">
                          {dashboardData.userInfo?.totalTicketsPurchased || 0}
                    </div>
                        <div className="text-base md:text-lg font-bold text-blue-200 mb-1">Total Tickets</div>
                        <div className="text-xs md:text-sm text-blue-300/90">Purchased across all rounds</div>
                      </div>
                    </div>
  
                    {/* Total Winnings Card */}
                    <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-green-900/90 via-emerald-800/80 to-teal-900/90 backdrop-blur-sm border-2 border-green-500/50 shadow-xl hover:shadow-green-500/40 transition-all duration-500 transform hover:scale-105">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 via-emerald-600/30 to-teal-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-3 right-3 text-green-300 animate-pulse text-lg">💰</div>
                      <div className="absolute bottom-3 left-3 text-emerald-300 animate-pulse text-lg" style={{animationDelay: '0.5s'}}>🏆</div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 p-4 md:p-6 text-center">
                        <div className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text mb-2">
                        {formatUSDT(dashboardData.userInfo?.totalEarnings || '0')}
                      </div>
                        <div className="text-base md:text-lg font-bold text-green-200 mb-1">Total Winnings</div>
                        <div className="text-xs md:text-sm text-green-300/90">Earned in TRDO</div>
                        
                        {/* Animated coins */}
                        <div className="mt-3 flex justify-center space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i}
                              className="text-green-400 animate-bounce text-sm"
                              style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.5s' }}
                            >
                              💰
                    </div>
                          ))}
                      </div>
                    </div>
                      </div>
  
                    {/* Draw Status Card */}
                    <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-pink-900/90 backdrop-blur-sm border-2 border-purple-500/50 shadow-xl hover:shadow-purple-500/40 transition-all duration-500 transform hover:scale-105">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-3 right-3 text-purple-300 animate-pulse text-lg">🎯</div>
                      <div className="absolute bottom-3 left-3 text-pink-300 animate-pulse text-lg" style={{animationDelay: '0.5s'}}>⚡</div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 p-4 md:p-6 text-center">
                        <div className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text mb-2">
                          {dashboardData.drawExecuted ? "✅" : "⏳"}
                        </div>
                        <div className="text-base md:text-lg font-bold text-purple-200 mb-1">Draw Status</div>
                        
                        
                        {/* Status indicator */}
                        <div className="mt-3">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            dashboardData.drawExecuted 
                              ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
                              : 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              dashboardData.drawExecuted ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
                            }`}></div>
                            {dashboardData.drawExecuted ? "Completed" : "Pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Prize Breakdown Section */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-600/50 shadow-2xl p-6 md:p-8">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">💰</div>
                    <div className="absolute bottom-4 left-4 text-orange-400 animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="text-2xl md:text-3xl">💰</div>
                        <div>
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text">
                      Prize Breakdown & Sponsor Income
                    </h3>
                          <p className="text-sm md:text-base text-gray-300 mt-1">Detailed analysis of your earnings</p>
                        </div>
                      </div>
                    
                    {/* Current Round Prize Data */}
                      <div className="mb-6">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-sm md:text-base font-semibold mb-4">
                          <span className="mr-2">🎯</span>
                        Round #{dashboardData.currentRound} - Current Round
                        </div>
                      <ComprehensivePrizeDisplay 
                        roundId={dashboardData.currentRound}
                        getUserPrizeData={getUserPrizeData}
                        getUserTotalPrize={getUserTotalPrize}
                        getUserSponsorInfo={getUserSponsorInfo}
                        setNotification={setNotification}
                        myTicketsCount={dashboardData.myTicketsCount || 0}
                        drawExecuted={dashboardData.drawExecuted || false}
                      />
                    </div>
                        </div>
                      </div>
                </div>
              )}
          </div>
        );


      // case 'rankings':
      //   if (sectionLoading) {
      //     return (
      //       <div className="text-center text-gray-400 py-12">
      //         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
      //         <p className="text-lg md:text-xl">Loading rankings data...</p>
      //         <p className="text-sm md:text-base text-gray-500 mt-2">Please wait while we fetch ticket rankings</p>
      //       </div>
      //     );
      //   }
      //   return (
      //     <div className="space-y-4 md:space-y-6">
      //       <div className="flex justify-between items-center">
      //         <h2 className="text-2xl md:text-3xl font-bold text-white">🏅 Rankings & Winning Tickets</h2>
      //         <button 
      //           onClick={() => {
      //             loadPrizeData();
      //             setNotification({ type: 'info', message: 'Refreshing rankings data...' });
      //           }}
      //           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
      //         >
      //           <span className="mr-2">🔄</span>
      //           Refresh
      //         </button>
      //       </div>
      //       {/* Test getTicketRank Button */}
      //       <TestGetTicketRankButton />
            
      //       {sectionLoading ? (
      //         <div className="text-center text-gray-400">
      //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      //           <p className="text-sm md:text-base">Loading ticket rankings...</p>
      //         </div>
      //       ) : !dashboardData.drawExecuted ? (
      //         <div className="text-center text-gray-400">
      //           <p className="text-4xl md:text-6xl mb-3 md:mb-4">⏳</p>
      //           <p className="text-sm md:text-base">Draw not executed yet. Please wait for the round to complete.</p>
      //         </div>
      //       ) : (!dashboardData.myTickets || dashboardData.myTickets.length === 0) ? (
      //         <div className="text-center text-gray-400">
      //           <p className="text-4xl md:text-6xl mb-3 md:mb-4">🎫</p>
      //           <p className="text-sm md:text-base">No tickets to show rankings for</p>
      //         </div>
      //       ) : (
      //         <div className="space-y-4 md:space-y-6">
      //           {/* Rankings Summary */}
      //           <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      //             <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
      //               <span className="mr-2">📊</span>
      //               Rankings Summary
      //             </h3>
      //             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      //               <div className="text-center">
      //                 <div className="text-2xl md:text-3xl font-bold text-blue-400">{dashboardData.myTickets.length}</div>
      //                 <div className="text-sm text-gray-300">Total Tickets</div>
      //               </div>
      //               <div className="text-center">
      //                 <div className="text-2xl md:text-3xl font-bold text-green-400">
      //                   {prizeData.foundPrizes ? prizeData.prizes.reduce((total, prize) => total + prize.roundPrizes.length, 0) : 0}
      //                 </div>
      //                 <div className="text-sm text-gray-300">Winning Tickets</div>
      //               </div>
      //               <div className="text-center">
      //                 <div className="text-2xl md:text-3xl font-bold text-yellow-400">
      //                   {prizeData.foundPrizes && prizeData.prizes.length > 0 ? 
      //                     Math.min(...prizeData.prizes[0].roundPrizes.map((p: any) => p.rank)) : 'N/A'}
      //                 </div>
      //                 <div className="text-sm text-gray-300">Best Rank</div>
      //               </div>
      //             </div>
      //           </div>

      //           {/* Detailed Rankings */}
      //             {prizeData.foundPrizes ? (
      //             <div className="space-y-4">
      //               <h3 className="text-lg md:text-xl font-semibold">🏆 Your Winning Tickets & Rankings</h3>
                      
      //                 {prizeData.prizes.map((prize, index) => {
      //                   const rankNames = {
      //                     1: '1st Place', 2: '2nd Place', 3: '3rd Place',
      //                     4: '4th Place', 5: '5th Place', 6: '6th Place',
      //                     7: '7th Place', 8: '8th Place', 9: '9th Place', 10: '10th Place'
      //                   };
                        
      //                   const getColoredRankName = (rank: number) => {
      //                     const rankName = rankNames[rank as keyof typeof rankNames];
      //                     if (rank === 1) {
      //                       return <span className="text-yellow-400 font-bold">{rankName}</span>;
      //                     } else if (rank === 2) {
      //                       return <span className="text-gray-300 font-bold">{rankName}</span>;
      //                     } else if (rank === 3) {
      //                       return <span className="text-amber-600 font-bold">{rankName}</span>;
      //                     } else {
      //                       return <span className="text-gray-300 font-semibold">{rankName}</span>;
      //                     }
      //                   };
                        
      //                   return (
      //                   <div key={index} className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      //                     <div className="flex items-center justify-between mb-4">
      //                       <h4 className="text-lg font-semibold text-blue-400">Round #{prize.roundId}</h4>
      //                       <div className="text-sm text-gray-300">
      //                         {prize.roundPrizes.length} winning ticket{prize.roundPrizes.length > 1 ? 's' : ''}
      //                         </div>
      //                       </div>
                            
      //                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      //                           {prize.roundPrizes.map((ticketPrize, ticketIndex) => {
      //                             const getRankStyling = (rank: number) => {
      //                               switch (rank) {
      //                                 case 1:
      //                                   return {
      //                                     bgClass: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
      //                                     textClass: 'text-yellow-900',
      //                                     borderClass: 'border-yellow-300',
      //                                     shadowClass: 'shadow-lg shadow-yellow-500/30'
      //                                   };
      //                                 case 2:
      //                                   return {
      //                                     bgClass: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
      //                                     textClass: 'text-gray-800',
      //                                     borderClass: 'border-gray-200',
      //                                     shadowClass: 'shadow-lg shadow-gray-400/30'
      //                                   };
      //                                 case 3:
      //                                   return {
      //                                     bgClass: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800',
      //                                     textClass: 'text-amber-100',
      //                                     borderClass: 'border-amber-500',
      //                                     shadowClass: 'shadow-lg shadow-amber-600/30'
      //                                   };
      //                                 default:
      //                                   return {
      //                                     bgClass: 'bg-gray-700',
      //                                     textClass: 'text-gray-300',
      //                                     borderClass: 'border-gray-600',
      //                                     shadowClass: 'shadow-md'
      //                                   };
      //                               }
      //                             };

      //                             const styling = getRankStyling(ticketPrize.rank);
                                  
      //                             return (
      //                               <div 
      //                                 key={ticketIndex} 
      //                             className={`${styling.bgClass} ${styling.borderClass} ${styling.shadowClass} rounded-lg p-3 md:p-4 text-center border-2 transition-all duration-300 hover:scale-105 cursor-pointer`}
      //                             onClick={() => handleTicketClick(parseInt(ticketPrize.ticketNumber))}
      //                           >
      //                             <div className={`text-lg md:text-xl font-bold ${styling.textClass} mb-2`}>
      //                                 #{ticketPrize.ticketNumber}
      //                               </div>
      //                             <div className={`text-sm md:text-base font-semibold ${styling.textClass} mb-2`}>
      //                                     {getColoredRankName(ticketPrize.rank)}
      //                               </div>
      //                             <div className={`text-sm md:text-base font-bold ${styling.textClass} mb-2`}>
      //                                 {formatUSDT(formatEther(BigInt(ticketPrize.prize)))} TRDO
      //                               </div>
                                        
      //                                   {/* Rank indicator */}
      //                                   {ticketPrize.rank <= 3 && (
      //                               <div className="text-2xl md:text-3xl">
      //                                 {ticketPrize.rank === 1 && <span>🥇</span>}
      //                                 {ticketPrize.rank === 2 && <span>🥈</span>}
      //                                 {ticketPrize.rank === 3 && <span>🥉</span>}
      //                             </div>
      //                                   )}
      //                               </div>
      //                             );
      //                           })}
      //                       </div>
                            
      //                     <div className="mt-4 pt-4 border-t border-gray-700">
      //                       <div className="flex justify-between items-center">
      //                         <div>
      //                           <div className="text-lg md:text-xl font-bold text-green-400">
      //                               {formatUSDT(formatEther(BigInt(prize.totalRoundPrize)))} TRDO
      //                             </div>
      //                           <div className="text-sm text-gray-300">Total Prize Value</div>
      //                           </div>
      //                         <div className="flex items-center gap-3">
      //                                                         <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
      //                           claimStatus[prize.roundId] 
      //                             ? 'bg-green-900 text-green-300' 
      //                             : 'bg-blue-900 text-blue-300'
      //                         }`}>
      //                           {claimStatus[prize.roundId] ? '✅ Claimed' : '💰 Claimable'}
      //                         </div>
                                
      //                           {/* Claim Button */}
      //                           {/* {!claimStatus[prize.roundId] && (
      //                           <button
      //                               onClick={() => !claimLoading && handleClaim(prize.roundId)}
      //                               disabled={claimLoading}
      //                               className={`px-4 py-2 rounded-lg font-semibold transition duration-300 text-sm ${
      //                                 claimLoading
      //                                 ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
      //                                 : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
      //                             }`}
      //                           >
      //                               {claimLoading ? '⏳ Claiming...' : '🏆 Claim'}
      //                           </button>
      //                           )} */}
      //                         </div>
      //                         </div>
      //                       </div>
      //                     </div>
      //                   );
      //                 })}
      //               </div>
      //             ) : (
      //               <div className="text-center text-gray-400 py-8 md:py-12">
      //               <div className="text-4xl md:text-6xl mb-3 md:mb-4">🏅</div>
      //               <div className="text-lg md:text-xl font-semibold mb-2">No rankings found</div>
      //                 <div className="text-sm md:text-base">You haven't won any prizes in this round yet.</div>
      //               </div>
      //             )}
      //           </div>
      //         )}
      //     </div>
      //   );

      case 'community':
        return (
          <div className="space-y-3 md:space-y-4 lg:space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white">🌐 My Community Network</h2>
            </div>

            {levelCountsLoading ? (
              <div className="text-center text-gray-400 py-8 md:py-12">
                <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-500 mx-auto mb-4 md:mb-6"></div>
                <p className="text-base md:text-lg lg:text-xl">Loading network data...</p>
                <p className="text-xs md:text-sm lg:text-base text-gray-500 mt-2">Please wait while we fetch your community levels</p>
              </div>
            ) : userLevelCounts.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-xl p-3 md:p-4 lg:p-6 border border-blue-500/30 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
                      <div className="text-lg md:text-xl lg:text-2xl">👥</div>
                      <div className="text-blue-400 text-xs md:text-sm font-medium">Total Network</div>
                    </div>
                    <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 md:mb-2">
                      {userLevelCounts.reduce((total, level) => total + level.count, 0)}
                    </div>
                    <div className="text-blue-300 text-xs md:text-sm">Community Members</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm rounded-xl p-3 md:p-4 lg:p-6 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
                      <div className="text-lg md:text-xl lg:text-2xl">🏆</div>
                      <div className="text-purple-400 text-xs md:text-sm font-medium">Max Level</div>
                    </div>
                    <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 md:mb-2">
                      {Math.max(...userLevelCounts.map(level => level.level))}
                    </div>
                    <div className="text-purple-300 text-xs md:text-sm">Network Depth</div>
                  </div>
                </div>

                {/* Enhanced Table */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[280px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-700/50">
                          <th className="py-2 md:py-3 lg:py-4 px-2 md:px-3 lg:px-6 text-left text-gray-200 font-semibold text-xs md:text-sm lg:text-base">Level</th>
                          <th className="py-2 md:py-3 lg:py-4 px-2 md:px-3 lg:px-6 text-left text-gray-200 font-semibold text-xs md:text-sm lg:text-base">Members</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userLevelCounts.map((level: any, index: number) => {
                          const isActive = level.count > 0;
                          
                          return (
                            <tr 
                              key={index} 
                              className={`border-b border-gray-700/30 hover:bg-gray-800/50 transition-all duration-300 ${
                                isActive ? 'bg-gray-800/20' : 'bg-gray-900/20'
                              }`}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <td className="py-2 md:py-3 lg:py-4 px-2 md:px-3 lg:px-6">
                                <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
                                  <div className={`w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                                    isActive 
                                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                                      : 'bg-gray-600 text-gray-400'
                                  }`}>
                                    {level.level}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium text-xs md:text-sm lg:text-base">
                                      Level {level.level}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 md:py-3 lg:py-4 px-2 md:px-3 lg:px-6">
                                <div className="text-white font-semibold text-sm md:text-base lg:text-lg xl:text-xl">
                                  {level.count}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8 md:py-12">
                <div className="text-4xl md:text-6xl lg:text-8xl mb-3 md:mb-4">🌐</div>
                <p className="text-base md:text-lg lg:text-xl mb-2">No Network Data Available</p>
                <p className="text-xs md:text-sm lg:text-base text-gray-500">Your community network information will appear here</p>
              </div>
            )}
          </div>
        );

      case 'how-to-play':
        return <PowerPointViewer />;

      default:
        return null;
    }
  };

  // Fetch round creation time from contract (index 8)
  useEffect(() => {
    async function fetchRoundCreatedAt() {
      if (!dashboardData.currentRound) return;
      try {
        // Assuming you have a function to fetch round data from contract
        const roundData = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
          abi: LOTTERY_ABI,
          functionName: 'rounds',
          args: [BigInt(dashboardData.currentRound)],
        });
        setRoundCreatedAt(Number((roundData as any[])[8]));
      } catch (err) {
        setRoundCreatedAt(null);
      }
    }
    fetchRoundCreatedAt();
  }, [dashboardData.currentRound]);

  // Update timer every second
  useEffect(() => {
    if (!roundCreatedAt) return;
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - roundCreatedAt;
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeSince(`${hours} hr:${minutes.toString().padStart(2, '0')} min:${seconds.toString().padStart(2, '0')} sec`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [roundCreatedAt]);

  // NEW EFFECT - Clear cache when current round changes
  useEffect(() => {
    if (dashboardData.currentRound && dashboardData.currentRound > 0) {
      console.log(`🔄 Current round changed to ${dashboardData.currentRound}, clearing old caches...`);
      
      // Clear all localStorage caches for old rounds
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('topTickets_round_')) {
          const roundFromKey = parseInt(key.replace('topTickets_round_', ''));
          if (roundFromKey !== dashboardData.currentRound) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed cache for ${key}`);
      });
      
      // Clear claimed rounds cache for old rounds
      if (address) {
        try {
          const claimedRounds = JSON.parse(localStorage.getItem(`claimedRounds_${address}`) || '[]');
          const updatedClaimedRounds = claimedRounds.filter((round: number) => round === dashboardData.currentRound);
          localStorage.setItem(`claimedRounds_${address}`, JSON.stringify(updatedClaimedRounds));
        } catch (error) {
          console.warn('Error updating claimed rounds cache:', error);
        }
      }
    }
  }, [dashboardData.currentRound, address]);

  // Function to clear backend cache
  const clearBackendCache = async () => {
    try {
      console.log('🗑️ Clearing backend cache...');
      const response = await fetch('/api/top-ranks?clearCache=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Backend cache cleared successfully');
        setNotification({ type: 'success', message: 'Cache cleared successfully! 🔄' });
      } else {
        console.error('❌ Failed to clear backend cache');
        setNotification({ type: 'error', message: 'Failed to clear cache' });
      }
    } catch (error) {
      console.error('❌ Error clearing backend cache:', error);
      setNotification({ type: 'error', message: 'Error clearing cache' });
    }
  };

  // Enhanced force refresh function
  const handleForceRefresh = async () => {
    try {
      setNotification({ type: 'info', message: 'Refreshing data... 🔄' });
      
      // Clear backend cache first
      await clearBackendCache();
      
      // Force refresh contract data
      await forceRefreshData();
      
      // Clear frontend cache
      if (dashboardData.currentRound) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('topTickets_round_')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed cache for ${key}`);
        });
      }
      
      setNotification({ type: 'success', message: 'Data refreshed successfully! ✅' });
    } catch (error) {
      console.error('❌ Error during force refresh:', error);
      setNotification({ type: 'error', message: 'Failed to refresh data' });
    }
  };

  return (
    <div className="bg-black min-h-screen flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        navigateToSection={navigateToSection}
      />
      
      {/* Main Content */}
      <div className="md:ml-64 flex-1 bg-gradient-to-b from-blue-950 to-blue-900 text-white">
        {/* Transaction Pending Overlay */}
        {isTransactionPending && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">
                  {transactionType === 'register' && 'Processing Registration...'}
                  {transactionType === 'purchase' && 'Processing Ticket Purchase...'}
                  {transactionType === 'claim' && 'Processing Prize Claim...'}
                </h3>
                <p className="text-gray-400 mb-4">
                  Please wait while your transaction is being confirmed on the blockchain.
                </p>
                <div className="text-sm text-gray-500">
                  This may take a few moments...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refreshing Data Overlay */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-green-400">Refreshing Data...</h3>
                <p className="text-gray-400 mb-4">
                  Please wait while we update your data with the latest information.
                </p>
                <div className="text-sm text-gray-500">
                  This will only take a moment...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Switching Overlay */}
        {isWalletSwitching && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Switching Wallet...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we update your data</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="py-2 md:py-3 lg:py-4 px-2 md:px-4 lg:px-6 bg-gradient-to-r from-gray-900 to-blue-900 flex justify-between items-center shadow-lg">
          <div className="flex items-center min-w-0 flex-1">
            <button 
              className="mr-2 md:mr-3 lg:mr-4 text-gray-400 hover:text-white transition-colors duration-200 md:hidden flex-shrink-0"
              onClick={toggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white flex items-center truncate">
              <span className="mr-1 md:mr-2 text-sm md:text-base lg:text-lg xl:text-xl">🏆</span> 
              <span className="truncate">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
            </h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2 lg:gap-4 flex-shrink-0">
            {dashboardData.drawExecuted && (
              <button
                onClick={() => window.location.reload()}
                className="flex items-center px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 hover:border-gray-500 transition-colors duration-200 text-xs md:text-sm lg:text-base"
                title="Refresh Page"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19.364A9 9 0 104.582 9m0 0V4m0 5h5" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <div className="hidden sm:block">
            <LanguageSwitcher />
            </div>
            <ConnectButton />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-3 md:p-4 lg:p-6">
          {renderContent()}
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}

      {/* Notifications */}
      <Notification 
        notification={notification}
        onClose={() => setNotification(null)} 
      />

      {/* Ticket Details Modal */}
      {selectedTicket && showTicketModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
          }}
        >
          <div 
            className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700 text-white w-full max-w-sm md:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold">🎫 Ticket Details</h2>
              <button
                className="text-gray-400 hover:text-white text-xl md:text-2xl font-bold"
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTicket(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm md:text-base">Ticket Number:</span>
                <span className="font-mono text-sm md:text-base">#{selectedTicket.ticketNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm md:text-base">Owner:</span>
                <span className="font-mono text-sm md:text-base">{formatAddress(selectedTicket.owner)}</span>
              </div>

              {selectedTicket.isMyTicket && (
                <div className="text-green-400 text-center font-semibold text-sm md:text-base">
                  ✅ This is your ticket!
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm md:text-base">Status:</span>
                <span className={`font-semibold text-sm md:text-base ${
                  selectedTicket.status === 'Available' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
              
              {/* Show rank and prize if draw is executed and ticket has a rank */}
              {selectedTicket.rank > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm md:text-base">Rank:</span>
                    <span className="font-semibold text-sm md:text-base text-yellow-400">
                      {selectedTicket.rank === 1 ? '🥇 1st Place' :
                       selectedTicket.rank === 2 ? '🥈 2nd Place' :
                       selectedTicket.rank === 3 ? '🥉 3rd Place' :
                       `${selectedTicket.rank}${selectedTicket.rank === 1 ? 'st' : selectedTicket.rank === 2 ? 'nd' : selectedTicket.rank === 3 ? 'rd' : 'th'} Place`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm md:text-base">Prize:</span>
                    <span className="font-semibold text-sm md:text-base text-green-400">
                      {selectedTicket.prize} TRDO
                    </span>
                  </div>
                </>
              )}
              
              {/* Show if it's the winning ticket */}
              {selectedTicket.isWinner && (
                <div className="text-center bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-2 md:p-3">
                  <div className="text-yellow-400 font-bold text-sm md:text-base">
                    🎉 WINNING TICKET! 🎉
                  </div>
                  <div className="text-yellow-300 text-xs md:text-sm">
                    This ticket won the jackpot!
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-6 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg transition duration-300 text-sm md:text-base"
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTicket(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// Replace TestGetTicketOwnerButton with this component:
function TestGetTicketRankButton() {
  const { address } = useAccount();
  // const { dashboardData } = useWallet();
  // const [loading, setLoading] = useState(false);

   //Testing env
   const handleTest = async () => {
    // if (!dashboardData.currentRound || !dashboardData.totalTickets) {
    //   console.log('No current round or total tickets');
    //   return;
    // }
    // setLoading(true);
    // const roundId = dashboardData.currentRound;
    // const totalTickets = dashboardData.myTicketsCount;
    // console.log('Adiii:', totalTickets);
    // console.log('Adiii:', roundId);  

    // for (let ticketNumber = 1; ticketNumber <= 1; ticketNumber++) {
      try {
        console.log('claim tickets rank');
        const rank = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.LOTTERY as `0x${string}`,
          abi: LOTTERY_ABI,
          functionName: 'isClaimed',
          args: [address as `0x${string}`, 3]
        });
        // console.log('getTicketRank:', { roundId, ticketNumber, rank: rank?.toString() });
        console.log('getTicketRank:', rank);
      } catch (err) {
        console.error('Error calling getTicketRank:', err);
      }
    // }
  };


  return (
    <button
      onClick={handleTest}
      // disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center mt-2"
    >
      {'Testing getTicketRank...'}
    </button>
  );
}

function TopRankedTicketsSection({ currentRound }: { currentRound: number }) {
  const [topTickets, setTopTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchedRound, setLastFetchedRound] = useState<number | null>(null);
  const [cacheKey, setCacheKey] = useState<string>('');
  const fetchingRef = useRef(false); // Prevent multiple simultaneous fetches
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the first load

  // Create a cache key for this round
  const currentCacheKey = `topTickets_${currentRound}`;

  // Clean up old cache entries when round changes
  useEffect(() => {
    const cleanupOldCache = () => {
      try {
        // Get all localStorage keys
        const keys = Object.keys(localStorage);
        const topTicketsKeys = keys.filter(key => key.startsWith('topTickets_'));
        
        // Remove cache entries for rounds older than current round
        topTicketsKeys.forEach(key => {
          const roundFromKey = parseInt(key.replace('topTickets_', ''));
          if (roundFromKey < currentRound) {
            localStorage.removeItem(key);
            console.log(`🧹 Cleaned up old cache for round ${roundFromKey}`);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up old cache:', error);
      }
    };

    if (currentRound > 0) {
      cleanupOldCache();
    }
  }, [currentRound]);

  const handleRefresh = () => {
    // Force refresh by clearing cache and re-fetching
    setLastFetchedRound(null); // Force refresh
    setCacheKey(''); // Clear cache key
    
    // Clear localStorage cache for this round
    try {
      localStorage.removeItem(currentCacheKey);
      console.log('🔄 Manual refresh triggered for round', currentRound);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  };

  useEffect(() => {
    async function fetchTopTickets() {
      console.log(`🔄 useEffect triggered for round ${currentRound}`);
      
      // Prevent multiple simultaneous fetches
      if (fetchingRef.current) {
        console.log('⏳ Already fetching, skipping...');
        return;
      }
      
      // Don't fetch if no round
      if (!currentRound || currentRound <= 0) {
        console.log('❌ No valid round, skipping fetch');
        return;
      }

      // Check if we already fetched this round
      if (lastFetchedRound === currentRound && topTickets.length > 0) {
        console.log('✅ Already have data for this round, skipping fetch');
        return;
      }

      // Check localStorage cache first
      try {
        const cachedData = localStorage.getItem(currentCacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          const cacheRound = parsedData.round || 0;
          const isCacheValid = cacheRound === currentRound;
          
          if (isCacheValid) {
            console.log('✅ Using cached data for round', currentRound);
            setTopTickets(parsedData.data);
            setLastFetchedRound(currentRound);
            setLoading(false);
            setIsInitialLoad(false);
            return;
          } else {
            localStorage.removeItem(currentCacheKey);
          }
        }
      } catch (error) {
        console.warn('Error reading from cache:', error);
      }

      // Reset state for new round
      if (lastFetchedRound !== currentRound) {
        setTopTickets([]);
        setLastFetchedRound(null);
      }

      // Only set loading to true if this is the initial load and we don't have any data
      // This prevents showing loading when backend has cached data
      if (isInitialLoad && topTickets.length === 0) {
      setLoading(true);
      }
      
      fetchingRef.current = true;
      console.log(`🔄 Fetching top 3 ranks for round ${currentRound} via API...`);
      
      try {
        const response = await fetch(`/api/top-ranks?roundId=${currentRound}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'API returned error');
        }

        console.log(`✅ API returned ${result.data.length} tickets (cached: ${result.cached}):`, result.data);
        
        const transformedTickets = result.data.map((ticket: any) => ({
          ticketNumber: ticket.ticketNumber,
          rank: ticket.rank,
          owner: ticket.owner,
          prize: ticket.prize
        }));

        console.log(`🔄 Setting topTickets state with ${transformedTickets.length} tickets:`, transformedTickets);
        setTopTickets(transformedTickets);
        setLastFetchedRound(currentRound);
        setIsInitialLoad(false);
        
        // Save to localStorage cache
        try {
          localStorage.setItem(currentCacheKey, JSON.stringify({
            data: transformedTickets,
            round: currentRound,
            timestamp: Date.now(),
            backendCached: result.cached
          }));
        } catch (error) {
          console.warn('Error saving to cache:', error);
        }
      } catch (err) {
        console.error('Error fetching top tickets:', err);
        setTopTickets([]);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
        fetchingRef.current = false;
      }
    }
    
    fetchTopTickets();
  }, [currentRound]); // Only depend on currentRound

  // Only log once per render to avoid spam
  if (loading && topTickets.length === 0) {
    console.log(`🔍 TopRankedTicketsSection render - loading: ${loading}, topTickets.length: ${topTickets.length}, currentRound: ${currentRound}`);
  }
  
  // Show loading only on initial load with no data
  if (loading && isInitialLoad && topTickets.length === 0) {
    return <div className="text-center text-gray-400 py-4">Loading top tickets...</div>;
  }
  
  // Show no data message only if not loading and no data
  if (!loading && !isInitialLoad && topTickets.length === 0) {
    return <div className="text-center text-gray-400 py-4">No ranked tickets found.</div>;
  }

  // Ensure we only show exactly 3 tickets with ranks 1-3
  const validTopTickets = topTickets
    .filter(ticket => ticket.rank >= 1 && ticket.rank <= 3)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);
  
  if (!validTopTickets.length) {
    return <div className="text-center text-gray-400 py-4">No top 3 ranked tickets found.</div>;
  }
  
  const top3 = validTopTickets;

  const rankColors = [
    'from-amber-700 to-yellow-400',
    'from-amber-700 to-yellow-400',
    'from-amber-700 to-yellow-400'
  ];
  const rankTextColors = [
    'text-amber-900',
    'text-amber-900',
    'text-amber-900'
  ];
  const rankShadow = [
    'drop-shadow-[0_2px_8px_rgba(205,127,50,0.7)]',
    'drop-shadow-[0_2px_8px_rgba(205,127,50,0.7)]',
    'drop-shadow-[0_2px_8px_rgba(205,127,50,0.7)]'
  ];

  // Helper to shorten address
  const shorten = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <>
      {/* Card flip styles and animated border */}
      <style>{`
        .flip-card {
          perspective: 1200px;
        }
        .flip-card-outer {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
          background: linear-gradient(270deg, #ffe066, #a3a3a3, #ffb300, #1e3a8a, #0ea5e9, #ffe066);
          background-size: 1200% 1200%;
          animation: borderGradientMove 6s ease-in-out infinite;
          padding: 3px;
          box-shadow: 0 0 24px 0 rgba(255, 215, 0, 0.25), 0 2px 16px 0 rgba(30, 58, 138, 0.12);
        }
        @keyframes borderGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .flip-card-inner {
          transition: transform 0.7s cubic-bezier(.4,2,.6,1);
          transform-style: preserve-3d;
          will-change: transform;
          border-radius: 1.5rem;
          width: 100%;
          height: 100%;
          background: #18181b;
          position: relative;
        }
        .flip-card:hover .flip-card-inner, .flip-card:focus .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
        /* For small cards */
        .glassy-card-outer {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          background: linear-gradient(270deg, #0ea5e9, #818cf8, #0ea5e9);
          background-size: 600% 600%;
          animation: borderGradientMove 8s ease-in-out infinite;
          padding: 2px;
          box-shadow: 0 0 16px 0 rgba(14, 165, 233, 0.18), 0 2px 8px 0 rgba(30, 58, 138, 0.10);
        }
        .glassy-card-inner {
          transition: transform 0.7s cubic-bezier(.4,2,.6,1);
          transform-style: preserve-3d;
          will-change: transform;
          border-radius: 1rem;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.10);
          position: relative;
        }
        .glassy-card:hover .glassy-card-inner, .glassy-card:focus .glassy-card-inner {
          transform: rotateY(180deg);
        }
        .glassy-card-front, .glassy-card-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border-radius: 1rem;
          overflow: hidden;
        }
        .glassy-card-back {
          transform: rotateY(180deg);
        }
        
        /* Bounce animation for podium cards */
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
      <div className="mt-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-extrabold text-yellow-400 tracking-wide drop-shadow-lg flex items-center">
            Top 3 Ranked Tickets
            {loading && !isInitialLoad && (
              <span className="ml-2 text-sm text-yellow-300 animate-pulse">🔄</span>
            )}
          </h3>
          <button
            onClick={handleRefresh}
            disabled={loading && isInitialLoad}
            className={`${loading && !isInitialLoad ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-500 text-white px-2 py-1 rounded text-xs transition duration-300 flex items-center opacity-70 hover:opacity-100`}
            title="Refresh data (usually not needed - data updates automatically)"
          >
            {loading && isInitialLoad ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Loading...
              </>
            ) : loading && !isInitialLoad ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Refreshing...
              </>
            ) : (
              <>
                <span className="mr-1 text-xs">🔄</span>
                Refresh
              </>
            )}
          </button>
        </div>
        <div className="flex justify-center items-end gap-2 md:gap-4 lg:gap-6 mb-8 relative">
          {/* 2nd Place - Left */}
          {top3[1] && (
            <div
              className="flip-card flex-shrink-0 relative"
              tabIndex={0}
              style={{ 
                zIndex: 9,
                animation: 'bounce 2s ease-in-out infinite',
                animationDelay: '0.2s'
              }}
            >
              <div className="flip-card-outer">
                <div className="flip-card-inner" style={{ minHeight: 320, width: '260px' }}>
                  {/* Front */}
                  <div className={`flip-card-front bg-gradient-to-br ${rankColors[1]} flex flex-col items-center justify-center p-8 w-full h-full`}>
                    <div className={`text-5xl font-extrabold mb-3 ${rankTextColors[1]} ${rankShadow[1]}`}>🥈</div>
                    <div className="text-xl font-black text-white mb-2 tracking-wider drop-shadow-md">Ticket #{top3[1].ticketNumber}</div>
                    <div className={`text-base font-bold mb-1 uppercase tracking-wide ${rankTextColors[1]} ${rankShadow[1]}`}>Rank: {top3[1].rank}</div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-gradient-to-br from-black via-blue-900 to-blue-800 flex flex-col items-center justify-center p-8 w-full h-full">
                    <div className="text-xs font-semibold text-white/80 mb-1 uppercase tracking-widest">Owner</div>
                    <div className="text-base font-mono text-white bg-blue-900/60 rounded px-3 py-2 mb-3 break-all text-center shadow-inner">{shorten(top3[1].owner)}</div>
                    <div className="text-base font-bold text-white mb-2">Prize: {top3[1].prize} TRDO</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place - Center */}
          {top3[0] && (
            <div
              className="flip-card flex-shrink-0 relative"
                tabIndex={0}
              style={{ 
                zIndex: 10,
                animation: 'bounce 2s ease-in-out infinite',
                animationDelay: '0s'
              }}
            >
              <div className="flip-card-outer">
                <div className="flip-card-inner" style={{ minHeight: 320, width: '260px' }}>
                  {/* Front */}
                  <div className={`flip-card-front bg-gradient-to-br ${rankColors[0]} flex flex-col items-center justify-center p-8 w-full h-full`}>
                    <div className={`text-5xl font-extrabold mb-3 ${rankTextColors[0]} ${rankShadow[0]}`}>🥇</div>
                    <div className="text-xl font-black text-white mb-2 tracking-wider drop-shadow-md">Ticket #{top3[0].ticketNumber}</div>
                    <div className={`text-base font-bold mb-1 uppercase tracking-wide ${rankTextColors[0]} ${rankShadow[0]}`}>Rank: {top3[0].rank}</div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-gradient-to-br from-black via-blue-900 to-blue-800 flex flex-col items-center justify-center p-8 w-full h-full">
                    <div className="text-xs font-semibold text-white/80 mb-1 uppercase tracking-widest">Owner</div>
                    <div className="text-base font-mono text-white bg-blue-900/60 rounded px-3 py-2 mb-3 break-all text-center shadow-inner">{shorten(top3[0].owner)}</div>
                    <div className="text-base font-bold text-white mb-2">Prize: {top3[0].prize} TRDO</div>
                  </div>
                </div>
                </div>
              </div>
          )}

          {/* 3rd Place - Right */}
          {top3[2] && (
            <div
              className="flip-card flex-shrink-0 relative"
              tabIndex={0}
              style={{ 
                zIndex: 8,
                animation: 'bounce 2s ease-in-out infinite',
                animationDelay: '0.4s'
              }}
            >
              <div className="flip-card-outer">
                <div className="flip-card-inner" style={{ minHeight: 320, width: '260px' }}>
                  {/* Front */}
                  <div className={`flip-card-front bg-gradient-to-br ${rankColors[2]} flex flex-col items-center justify-center p-8 w-full h-full`}>
                    <div className={`text-5xl font-extrabold mb-3 ${rankTextColors[2]} ${rankShadow[2]}`}>🥉</div>
                    <div className="text-xl font-black text-white mb-2 tracking-wider drop-shadow-md">Ticket #{top3[2].ticketNumber}</div>
                    <div className={`text-base font-bold mb-1 uppercase tracking-wide ${rankTextColors[2]} ${rankShadow[2]}`}>Rank: {top3[2].rank}</div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-gradient-to-br from-black via-blue-900 to-blue-800 flex flex-col items-center justify-center p-8 w-full h-full">
                    <div className="text-xs font-semibold text-white/80 mb-1 uppercase tracking-widest">Owner</div>
                    <div className="text-base font-mono text-white bg-blue-900/60 rounded px-3 py-2 mb-3 break-all text-center shadow-inner">{shorten(top3[2].owner)}</div>
                    <div className="text-base font-bold text-white mb-2">Prize: {top3[2].prize} TRDO</div>
                  </div>
                </div>
              </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}