'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// import { LanguageSwitcher } from '@/components/LanguageSwitcher';

import PlatformFeatures from '@/components/PlatformFeatures';
import HowItWorks from '@/components/HowItWorks';
// import PlatformStatistics from '@/components/PlatformStatistics';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';

export default function HomePage() {
  // Animation for BLOCKCHAIN LOTTERY color
  const [isPurple, setIsPurple] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPurple(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Background and Header */}
      <section className="relative h-screen overflow-hidden bg-[#0a002a]">
        {/* Pure background color for consistent backdrop */}
        <div className="absolute inset-0 z-0 bg-[#0a002a]"></div>
        
        {/* Background image with guaranteed full visibility */}
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full">
            <Image 
              src="/ibg.png" 
              alt="Background" 
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority 
              quality={100}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Space left intentionally clean for the background image to be fully visible */}
        
        <div className="absolute top-0 left-0 right-0 z-50 w-full">
          <Header />
          {/* <div className="absolute top-20 right-4 z-60">
            <LanguageSwitcher />
          </div> */}
        </div>
        
        {/* Hero Content - Centered on the left half of the screen */}
        <div className="absolute inset-y-0 left-0 z-30 flex flex-col justify-center w-full md:w-1/2 px-4 sm:px-8">
          <div className="w-full flex flex-col items-center">
            {/* Win big with */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0 text-center tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              WIN BIG WITH
            </h2>
            
            {/* BLOCKCHAIN LOTTERY */}
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] tracking-wide">
              TRONADO LOTTERY
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-300 text-center max-w-lg mx-auto mb-8 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Experience the future of lottery gaming with transparent, secure, and decentralized draws powered by smart contracts
            </p>
            
            {/* Buttons directly below description */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 justify-center w-full max-w-xl mx-auto">
              <button
                className="flex-1 flex items-center justify-center bg-[#16072d] hover:bg-[#291352] text-white font-bold py-4 px-8 rounded-full text-xl shadow-[0_4px_16px_rgba(156,25,233,0.5)] border border-[#3d2b59] hover:border-purple-500 transition-all duration-300 cursor-pointer max-w-xs group"
                onClick={() => {
                  const howItWorksSection = document.getElementById('how-it-works-section');
                  if (howItWorksSection) howItWorksSection.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="w-10 h-10 mr-4 relative bg-[#ff338d] group-hover:bg-[#ff4b9e] rounded-full flex items-center justify-center transition-colors duration-300">
                  <Image src="/how.png" alt="How it works" width={28} height={28} className="object-contain" />
                </div>
                <span className="text-xl group-hover:text-purple-300 transition-colors duration-300">How It Works</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center bg-[#16072d] hover:bg-[#291352] text-white font-bold py-4 px-8 rounded-full text-xl shadow-[0_4px_16px_rgba(255,162,0,0.5)] border border-[#3d2b59] hover:border-yellow-500 transition-all duration-300 cursor-pointer max-w-xs group"
                onClick={() => {
                  window.location.href = '/dashboard?section=dashboard';
                }}
              >
                <div className="w-10 h-10 mr-4 relative bg-[#ffa200] group-hover:bg-[#ffb733] rounded-full flex items-center justify-center transition-colors duration-300">
                  <Image src="/buy.png" alt="Buy tickets" width={28} height={28} className="object-contain" />
                </div>
                <span className="text-xl group-hover:text-yellow-200 transition-colors duration-300">Buy Tickets Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Components only */}
      {/* <PlatformStatistics /> */}
      <PlatformFeatures />
      <Testimonials />
      <CallToAction />

      <Footer />
    </div>
  );
}
