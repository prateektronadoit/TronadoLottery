'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });

export default function VerifyAge() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    // Check if they've already verified their age
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified === 'true') {
      router.push('/home');
    }
  }, [router]);

  const handleVerify = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem('ageVerified', 'true');
      router.push('/home');
    } else {
      router.push('/404');
    }
  };
  
  const handleNotificationOk = () => {
    setShowNotification(false);
  };

  const handleRecaptcha = (valor: string | null) => {
    if (valor) setVerificado(true);
  };

  const handleContinue = () => {
    if (verificado) {
      router.push('/home');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative text-white">
      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button 
              onClick={handleNotificationOk}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" 
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">!</span>
              </div>
            </div>
            
            <h2 className="text-gray-800 text-2xl font-bold text-center mb-4">Notification</h2>
            
            <p className="text-gray-600 text-center mb-8">
              Please note that you have denied the authorization to obtain your location information, which will prevent us from identifying your geographical location in a timely manner. You will, therefore, not be able to engage in any gaming activities. If you want to resolve this issue, please enable the location permission in your browser and refresh the page before trying again.
            </p>
            
            <div className="flex justify-center">
              <button 
                onClick={handleNotificationOk}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-12 rounded-full transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Background Image with Light/Dark Contrast */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--tronado-dark)] bg-opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-indigo-900/40 to-black/70"></div>
        
        {/* Light particles effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Light rays from top */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-[120%] h-[40%] bg-gradient-to-b from-blue-300/20 to-transparent rotate-180 opacity-50 rounded-full blur-2xl"></div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <Image 
          src="/Logo.png" 
          alt="Tronado Lottery Logo" 
          width={150} 
          height={75} 
          className="mx-auto drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
        />
      </div>
      
      {/* Main Content Container with flex column layout */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 space-y-12 mt-20">
        {/* Hero Text */}
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-3">
            DARE TO IMAGINE!
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 drop-shadow-lg">
            WIN TRDO 100 MILLION
          </h2>
        </div>
        
        {/* Age Verification Box */}
        <div className="text-center w-full mt-16 relative">
          {/* Light glow behind the verification section */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Verification content */}
          <div className="relative bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm px-8 py-10 rounded-xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-md">AGE VERIFICATION</h2>
            <p className="mb-8 text-white/80 text-lg">You must be 18 years or older to enter this website</p>
            
            <ReCAPTCHA
              sitekey="6LdblVorAAAAALy6WqqQF70KXVQIxFHBK_yodjE3"
              onChange={handleRecaptcha}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-10 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-full transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transform hover:-translate-y-0.5"
                disabled={!verificado}
                onClick={handleContinue}
              >
                I am 18 or older
              </button>
              
              <button
                onClick={() => handleVerify(false)}
                className="px-10 py-3 bg-transparent border border-white/30 hover:border-white/70 text-white font-bold rounded-full transition-all duration-300 hover:bg-white/5"
              >
                Exit
              </button>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-4 justify-center mt-4 px-4 xs:px-0">
              <div className="flex items-center">
                <div className="bg-red-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-1">18</div>
                <span className="text-xs text-white/90">PLAY RIGHT BE SAFEGUARDED</span>
              </div>
              {/* <p className="text-xs text-white/90 md:border-l md:border-white/20 md:pl-2">THE GAME L.L.C. - GCGRA Licensed Operator</p> */}
            </div>
            
            <div className="mt-2 flex flex-col items-center">
              <p className="text-xs text-white/70 max-w-lg mt-4">
                When using this Tronado Lottery website, kindly note that we employ cookies to gather your personal information, ensuring proper website functionality and enhancing the quality of our services for your benefit.
              </p>
              
              {/* <div className="flex gap-4 mt-4">
                <button className="px-4 py-1 rounded-full bg-transparent border border-white/20 text-xs hover:bg-white/10 transition-colors">
                  COOKIES POLICY
                </button>
                <button className="px-6 py-1 rounded-full bg-yellow-500 text-black text-xs font-semibold hover:bg-yellow-600 transition-colors">
                  ACCEPT ALL
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Jackpot Numbers removed as requested */}
    </div>
  );
}
