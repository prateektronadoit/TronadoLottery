'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { useWallet } from '../hooks/useWallet';

// Sidebar component
const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  activeSection, 
  setActiveSection 
}: { 
  isOpen: boolean; 
  toggleSidebar: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}) => {
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'registration', icon: '📝', label: 'Registration' },
    { id: 'purchase', icon: '🎫', label: 'Purchase' },
    { id: 'mytickets', icon: '🎟️', label: 'My Tickets' },
    { id: 'claim', icon: '🏆', label: 'Claim Prizes' }
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
                  onClick={() => setActiveSection(item.id)}
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
}

const StatCard = ({ icon, iconImage, title, value, subtitle, bgClass = "bg-opacity-0", iconSize = 80 }: StatCardProps) => {
  return (
    <div className={`relative rounded-xl p-6 border-2 border-blue-500 bg-blue-900/10 ${bgClass} group overflow-hidden transition-all duration-300 hover:border-blue-400 stat-card-fluid`}>
      <div className="stat-card-background"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 via-blue-500/10 to-blue-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-blue-600/20 opacity-0 group-hover:opacity-100 group-hover:animate-fluid transition-opacity duration-500 ease-in-out"></div>
      <div className="flex items-center mb-4 gap-4">
        {iconImage ? (
          <Image src={`/${iconImage}`} alt={title} width={iconSize} height={iconSize} className="flex-shrink-0" />
        ) : (
          <span className="text-3xl flex-shrink-0">{icon}</span>
        )}
        <div>
          <div className="text-lg text-gray-200 font-medium">{title}</div>
          <div className="text-5xl font-bold text-white mb-1">{value}</div>
          <div className="text-sm text-gray-300">{subtitle}</div>
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
                  notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}>
      <span className="mr-2">
        {notification.type === 'error' ? '❌' : 
         notification.type === 'warning' ? '⚠️' : '✅'}
      </span>
      {notification.message}
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  );
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sponsorAddress, setSponsorAddress] = useState('');
  const [numTickets, setNumTickets] = useState(1);
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

  const { isConnected } = useAccount();
  const {
    address,
    dashboardData,
    loading,
    notification: walletNotification,
    registerUser,
    purchaseTickets,
    claimPrize,
    claimAllPrizes,
    formatAddress,
    getTicketDetails,
  } = useWallet();

  // Handle URL parameters for direct navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (section && ['dashboard', 'registration', 'purchase', 'mytickets', 'claim'].includes(section)) {
        setActiveSection(section);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Load prize data when component mounts or when relevant data changes
  useEffect(() => {
    if (isConnected && address && dashboardData.userInfo) {
      loadPrizeData();
    }
  }, [isConnected, address, dashboardData.userInfo, dashboardData.drawExecuted, dashboardData.myTickets]);

  // Function to handle ticket click and show details
  const handleTicketClick = async (ticketNumber: number) => {
    if (!dashboardData.currentRound) {
      alert('No active round available');
      return;
    }
    
    try {
      // Determine ticket status without calling contract functions
      const isMyTicket = dashboardData.myTickets?.includes(ticketNumber) || false;
      const isSold = ticketNumber <= (dashboardData.ticketsSold || 0);
      const isAvailable = !isSold;
      
      // Create ticket details object without contract calls
      const ticketDetails = {
        ticketNumber,
        owner: isMyTicket ? (address || 'Your Address') : (isSold ? 'Sold to User' : 'Available'),
        rank: 0, // Not calling contract for rank
        prize: '0', // Not calling contract for prize
        isMyTicket,
        isWinner: dashboardData.winningNumber === ticketNumber && dashboardData.drawExecuted,
        isAvailable,
        status: isAvailable ? 'Available' : 'Sold'
      };
      
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
    await purchaseTickets(numTickets);
  };

  const handleClaim = async (roundId?: number) => {
    try {
      if (!isConnected) {
        setNotification({ type: 'error', message: 'Please connect your wallet first' });
        return;
      }

      if (roundId) {
        // Claim specific round prize
        setNotification({ type: 'info', message: 'Processing prize claim...' });
        await claimPrize(roundId);
        setNotification({ type: 'success', message: 'Prize claimed successfully! 🏆' });
        
        // Mark round as claimed in localStorage (like register.js)
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
      } else {
        // Claim all available prizes
        setNotification({ type: 'info', message: 'Processing all prize claims...' });
        await claimAllPrizes();
        setNotification({ type: 'success', message: 'All prizes claimed successfully! 🏆' });
        
        // Mark all unclaimed rounds as claimed in localStorage
        try {
          const claimedRounds = JSON.parse(localStorage.getItem(`claimedRounds_${address}`) || '[]');
          prizeData.prizes.forEach(prize => {
            if (!prize.isAlreadyClaimed && !claimedRounds.includes(prize.roundId)) {
              claimedRounds.push(prize.roundId);
            }
          });
          localStorage.setItem(`claimedRounds_${address}`, JSON.stringify(claimedRounds));
        } catch (error) {
          console.warn('Could not update localStorage for claimed rounds');
        }
      }
      
      // Refresh data after successful claim
      setTimeout(() => {
        loadPrizeData();
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
    }
  };

  // Load Prize Data Function
  const loadPrizeData = async () => {
    try {
      if (!address || !dashboardData.userInfo) return;
      
      console.log('🏆 Loading prize data...');
      
      let foundPrizes = false;
      let totalPendingClaims = 0;
      let prizes: any[] = [];
      
      // Check multiple rounds for prizes (check up to 5 recent rounds)
      const currentRound = dashboardData.currentRound || 1;
      const startRound = Math.max(1, currentRound - 4);
      
      for (let roundId = startRound; roundId <= currentRound; roundId++) {
        try {
          // For demo purposes, check if this is the current round and draw is executed
          if (roundId === currentRound && dashboardData.drawExecuted && dashboardData.myTickets && dashboardData.myTickets.length > 0) {
            // Check if user has winning tickets in current round
            const winningTickets = dashboardData.myTickets.filter((ticketNumber: number) => 
              ticketNumber === dashboardData.winningNumber
            );
            
            if (winningTickets.length > 0) {
              foundPrizes = true;
              
              // Calculate prize for winning tickets (50% of prize pool for 1st place)
              const prizePerTicket = parseFloat(dashboardData.prizePool || '0') * 0.5;
              const roundPrizes = winningTickets.map((ticketNumber: number) => ({
                ticketNumber: ticketNumber.toString(),
                rank: 1, // 1st place for winning number
                prize: prizePerTicket.toString()
              }));
              
              const totalRoundPrize = roundPrizes.reduce((sum: number, prize: any) => 
                sum + parseFloat(prize.prize), 0
              );
              
              // Check if already claimed (using localStorage like register.js)
              let isAlreadyClaimed = false;
              try {
                const claimedRounds = JSON.parse(localStorage.getItem(`claimedRounds_${address}`) || '[]');
                if (claimedRounds.includes(roundId)) {
                  isAlreadyClaimed = true;
                  console.log(`Round ${roundId} marked as claimed in local storage`);
                }
              } catch (error) {
                console.warn('Could not check claim status from localStorage');
              }
              
              // Only add to pending claims if not claimed yet
              if (!isAlreadyClaimed) {
                totalPendingClaims += totalRoundPrize;
              }
              
              prizes.push({
                roundId,
                userTickets: dashboardData.myTickets.length,
                roundPrizes,
                totalRoundPrize: totalRoundPrize.toString(),
                isAlreadyClaimed,
                bestRank: 1
              });
            }
          }
          
          // For demo purposes, add some sample historical prizes
          if (roundId < currentRound && roundId % 2 === 0) {
            // Simulate some historical prizes
            const samplePrizes = [
              {
                ticketNumber: '123',
                rank: 2,
                prize: '25.00000'
              },
              {
                ticketNumber: '456',
                rank: 3,
                prize: '15.00000'
              }
            ];
            
            const totalSamplePrize = samplePrizes.reduce((sum, prize) => sum + parseFloat(prize.prize), 0);
            
            // Mark older rounds as claimed
            const isAlreadyClaimed = roundId < currentRound - 1;
            
            if (!isAlreadyClaimed) {
              totalPendingClaims += totalSamplePrize;
            }
            
            prizes.push({
              roundId,
              userTickets: 5,
              roundPrizes: samplePrizes,
              totalRoundPrize: totalSamplePrize.toString(),
              isAlreadyClaimed,
              bestRank: 2
            });
            
            foundPrizes = true;
          }
          
        } catch (error) {
          console.warn(`Could not check round ${roundId} for prizes:`, error);
        }
      }
      
      setPrizeData({
        foundPrizes,
        totalPendingClaims: totalPendingClaims.toString(),
        prizes
      });
      
    } catch (error) {
      console.error('❌ Error loading prize data:', error);
      setPrizeData({
        foundPrizes: false,
        totalPendingClaims: '0',
        prizes: []
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6">
              <StatCard 
                icon=""
                iconImage="18.png"
                title="Current Round" 
                value={dashboardData.currentRound || 0} 
                subtitle="Active lottery round" 
              />
              <StatCard 
                icon=""
                iconImage="15.png"
                title="Total Tickets" 
                value={dashboardData.totalTickets || 0} 
                subtitle="Available in current round"
                iconSize={80} 
              />
              <StatCard 
                icon=""
                iconImage="14.png"
                title="Tickets Sold" 
                value={dashboardData.ticketsSold || 0} 
                subtitle={`${(dashboardData.totalTickets || 0) - (dashboardData.ticketsSold || 0)} remaining`} 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6">
              <StatCard 
                icon=""
                iconImage="11.png"
                title="Prize Pool" 
                value={dashboardData.prizePool || '0'}
                subtitle="USDT total prizes" 
              />
              <StatCard 
                icon=""
                iconImage="19.png"
                title="Ticket Price" 
                value={dashboardData.ticketPrice || '0'} 
                subtitle="USDT per ticket" 
              />
              <StatCard 
                icon=""
                iconImage="16.png"
                title="My Tickets" 
                value={dashboardData.myTicketsCount || 0} 
                subtitle="In current round"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              <StatCard 
                icon=""
                iconImage="13.png"
                title="Draw Status" 
                value={dashboardData.drawExecuted ? "Completed" : "Pending"} 
                subtitle="Current round status" 
              />
              <StatCard 
                icon=""
                iconImage="17.png"
                title="Total Tickets Count" 
                value={dashboardData.totalTickets || 0} 
                subtitle="Overall statistics" 
              />
            </div>

            {/* Live Tickets Board */}
            <div className="mt-6 md:mt-8 relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/dbg.png"
                  alt="Dashboard Background"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  quality={100}
                />
              </div>
              
              <div className="relative z-10 p-3 md:p-6">
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
                
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm text-white">
                  <div className="flex items-center">
                    <span className="block w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded mr-1 md:mr-2"></span>
                    <span>My Tickets</span>
                  </div>
                  <div className="flex items-center">
                    <span className="block w-3 h-3 md:w-4 md:h-4 bg-orange-500 rounded mr-1 md:mr-2"></span>
                    <span>Sold</span>
                  </div>
                  <div className="flex items-center">
                    <span className="block w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded mr-1 md:mr-2"></span>
                    <span>Winners</span>
                  </div>
                  <div className="flex items-center">
                    <span className="block w-3 h-3 md:w-4 md:h-4 bg-gray-700 rounded mr-1 md:mr-2"></span>
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveSection('purchase')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg md:text-xl transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🎫</span>
                Buy Tickets Now
              </button>
              {!dashboardData.isRegistered && (
                <button
                  onClick={() => setActiveSection('registration')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg md:text-xl transition duration-300 flex items-center justify-center"
                >
                  <span className="mr-2">📝</span>
                  Register First
                </button>
              )}
            </div>
          </>
        );

      case 'registration':
        return (
          <div className="max-w-md mx-auto">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Join the Lottery</h2>
              
              {dashboardData.isRegistered ? (
                <div className="text-center">
                  <div className="text-green-500 text-4xl md:text-6xl mb-3 md:mb-4">✅</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Already Registered!</h3>
                  {dashboardData.userInfo && (
                    <div className="space-y-2 text-xs md:text-sm text-gray-300">
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
          </div>
        );

      case 'purchase':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Purchase Tickets</h2>
              
              {!dashboardData.isRegistered ? (
                <div className="text-center text-gray-400">
                  <p className="text-4xl md:text-6xl mb-3 md:mb-4">📝</p>
                  <p className="text-sm md:text-base">Please register first before purchasing tickets</p>
                  <button
                    onClick={() => setActiveSection('registration')}
                    className="mt-3 md:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded text-sm md:text-base"
                  >
                    Register Now
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm md:text-base">Number of Tickets</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numTickets}
                      onChange={(e) => setNumTickets(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2 md:p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                    />
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 mb-4">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Price per ticket:</span>
                      <span>{dashboardData.ticketPrice || '0'} USDT</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sm md:text-base">
                      <span>Total cost:</span>
                      <span>{(parseFloat(dashboardData.ticketPrice || '0') * numTickets).toFixed(4)} USDT</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={!isConnected || loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 md:py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 disabled:opacity-50 text-sm md:text-base"
                  >
                    Purchase Tickets
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

      case 'mytickets':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">My Tickets</h2>
            
            {(!dashboardData.myTickets || dashboardData.myTickets.length === 0) ? (
              <div className="text-center text-gray-400">
                <p className="text-4xl md:text-6xl mb-3 md:mb-4">🎫</p>
                <p className="text-sm md:text-base">No tickets purchased yet</p>
                <button
                  onClick={() => setActiveSection('purchase')}
                  className="mt-3 md:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded text-sm md:text-base"
                >
                  Buy Tickets
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
                  {dashboardData.myTickets.map((ticketNumber: number) => (
                    <div
                      key={ticketNumber}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm md:text-xl font-bold ${
                        dashboardData.drawExecuted && dashboardData.winningNumber === ticketNumber
                          ? 'bg-yellow-500 text-black animate-pulse'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {String(ticketNumber).padStart(3, '0')}
                    </div>
                  ))}
                </div>
                
                {dashboardData.drawExecuted && (
                  <div className="text-center">
                    {/* <button
                      onClick={() => handleClaim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Claim All Prizes
                    </button> */}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'claim':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700 mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
                <h2 className="text-xl md:text-2xl font-bold">🏆 Claim Prizes</h2>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center text-sm md:text-base"
                  onClick={() => {
                    loadPrizeData();
                    setNotification({ type: 'info', message: 'Refreshing prize data...' });
                  }}
                >
                  <span className="mr-2">🔄</span>
                  Refresh
                </button>
              </div>
              
              {!dashboardData.drawExecuted ? (
                <div className="text-center text-gray-400">
                  <p className="text-4xl md:text-6xl mb-3 md:mb-4">⏳</p>
                  <p className="text-sm md:text-base">Draw not executed yet. Please wait for the round to complete.</p>
                </div>
              ) : (!dashboardData.myTickets || dashboardData.myTickets.length === 0) ? (
                <div className="text-center text-gray-400">
                  <p className="text-4xl md:text-6xl mb-3 md:mb-4">🎫</p>
                  <p className="text-sm md:text-base">No tickets to claim prizes for</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {/* Prize Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold text-blue-400">{dashboardData.userInfo?.totalTicketsPurchased || 0}</div>
                      <div className="text-xs md:text-sm text-gray-300">Total Tickets</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold text-green-400">
                        {parseFloat(dashboardData.userInfo?.totalEarnings || '0').toFixed(5)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-300">Total Winnings</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold text-yellow-400">
                        {parseFloat(prizeData.totalPendingClaims || '0').toFixed(5)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-300">Pending Claims</div>
                    </div>
                  </div>

                  {/* Prize Cards Section */}
                  {prizeData.foundPrizes ? (
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-lg md:text-xl font-semibold">Your Prize Cards</h3>
                      
                      {prizeData.prizes.map((prize, index) => {
                        const rankNames = {
                          1: '1st Place', 2: '2nd Place', 3: '3rd Place',
                          4: '4th Place', 5: '5th Place', 6: '6th Place',
                          7: '7th Place', 8: '8th Place', 9: '9th Place', 10: '10th Place'
                        };
                        
                        return (
                          <div key={index} className={`bg-gray-800 rounded-lg p-4 md:p-6 border-2 ${
                            prize.isAlreadyClaimed ? 'border-green-500' : 'border-blue-500'
                          }`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 md:mb-4 gap-2">
                              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <div className="bg-blue-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                                  Round #{prize.roundId}
                                </div>
                                <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                                  prize.isAlreadyClaimed 
                                    ? 'bg-green-900 text-green-300' 
                                    : 'bg-blue-900 text-blue-300'
                                }`}>
                                  {prize.isAlreadyClaimed ? 'Claimed' : 'Claimable'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                              <div className="text-center">
                                <div className="text-lg md:text-2xl font-bold text-blue-400">{prize.userTickets}</div>
                                <div className="text-xs md:text-sm text-gray-300">Tickets</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg md:text-2xl font-bold text-green-400">{prize.roundPrizes.length}</div>
                                <div className="text-xs md:text-sm text-gray-300">Winners</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg md:text-2xl font-bold text-yellow-400">
                                  {rankNames[prize.bestRank as keyof typeof rankNames]?.split(' ')[0]}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">Best Rank</div>
                              </div>
                            </div>
                            
                            {/* Winning Tickets Section */}
                            <div className="mb-4 md:mb-6">
                              <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 flex items-center">
                                <span className="mr-2">🏆</span>
                                Your Winning Tickets
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                                {prize.roundPrizes.map((ticketPrize, ticketIndex) => (
                                  <div key={ticketIndex} className="bg-gray-700 rounded-lg p-2 md:p-3 text-center">
                                    <div className="text-sm md:text-lg font-bold text-yellow-400">
                                      #{ticketPrize.ticketNumber}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-300">
                                      {rankNames[ticketPrize.rank as keyof typeof rankNames]}
                                    </div>
                                    <div className="text-xs md:text-sm font-semibold text-green-400">
                                      {parseFloat(ticketPrize.prize).toFixed(4)} USDT
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Total Prize Section */}
                            <div className="bg-gray-700 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                                <div className="text-center sm:text-left">
                                  <div className="text-lg md:text-2xl font-bold text-green-400">
                                    {parseFloat(prize.totalRoundPrize).toFixed(4)} USDT
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-300">Total Prize Value</div>
                                </div>
                                {!prize.isAlreadyClaimed && (
                                  <button
                                    onClick={() => handleClaim(prize.roundId)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition duration-300 text-sm md:text-base"
                                  >
                                    Claim Prize
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8 md:py-12">
                      <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎫</div>
                      <div className="text-lg md:text-xl font-semibold mb-2">No prizes found</div>
                      <div className="text-sm md:text-base">You haven't won any prizes in this round yet.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prize History Table */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">🏆 Prize History</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Round</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Tickets</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Winners</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Best Rank</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Total Prize</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Status</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-gray-300 font-semibold text-xs md:text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizeData.foundPrizes && prizeData.prizes.length > 0 ? (
                      prizeData.prizes.map((prize, index) => {
                        const rankNames = {
                          1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th',
                          6: '6th', 7: '7th', 8: '8th', 9: '9th', 10: '10th'
                        };
                        
                        return (
                          <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">#{prize.roundId}</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{prize.userTickets}</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{prize.roundPrizes.length}</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">
                              {rankNames[prize.bestRank as keyof typeof rankNames]}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-4">
                              <div className="text-center">
                                <div className="font-bold text-green-400 text-xs md:text-sm">
                                  {parseFloat(prize.totalRoundPrize).toFixed(4)} USDT
                                </div>
                                <div className="text-xs text-gray-400">total prize</div>
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-4">
                              <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                prize.isAlreadyClaimed 
                                  ? 'bg-green-900 text-green-300' 
                                  : 'bg-blue-900 text-blue-300'
                              }`}>
                                {prize.isAlreadyClaimed ? '✅ Claimed' : '🏆 Claimable'}
                              </span>
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-4">
                              {prize.isAlreadyClaimed ? (
                                <button className="bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm" disabled>
                                  Already Claimed
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleClaim(prize.roundId)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded text-sm font-semibold transition duration-300"
                                >
                                  Claim Prize
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 md:py-8 text-center text-gray-400">
                          <div className="text-3xl md:text-4xl mb-2">🎫</div>
                          <div className="text-sm md:text-lg font-semibold mb-1">No Prize History</div>
                          <div className="text-xs md:text-sm">You haven't won any lottery prizes yet. Keep playing and good luck!</div>
                          <div className="text-xs text-gray-500 mt-2">Prizes will appear here once you win in any lottery round.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Prize History Summary */}
              {prizeData.foundPrizes && prizeData.prizes.length > 0 && (
                <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{prizeData.prizes.length}</div>
                    <div className="text-sm text-gray-300">Total Rounds</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {prizeData.prizes.reduce((sum, prize) => sum + prize.roundPrizes.length, 0)}
                    </div>
                    <div className="text-sm text-gray-300">Total Winners</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {prizeData.prizes.filter(prize => !prize.isAlreadyClaimed).length}
                    </div>
                    <div className="text-sm text-gray-300">Pending Claims</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {prizeData.prizes.reduce((sum, prize) => sum + parseFloat(prize.totalRoundPrize), 0).toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-300">Total Prize Value</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-black min-h-screen flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      {/* Main Content */}
      <div className="md:ml-64 flex-1 bg-gradient-to-b from-blue-950 to-blue-900 text-white">
        {/* Header */}
        <header className="py-3 md:py-4 px-3 md:px-6 bg-gradient-to-r from-gray-900 to-blue-900 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="mr-3 md:mr-4 text-gray-400 hover:text-white md:hidden"
              onClick={toggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center">
              <span className="mr-2">🏆</span> 
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
          </div>
          <ConnectButton />
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
        notification={notification || walletNotification} 
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
