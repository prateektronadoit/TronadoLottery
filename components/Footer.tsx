import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-700 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Main footer content - links and contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - About/Info links */}
          <div className="space-y-4">
            <Link href="/about" className="block hover:text-gray-300">About Us</Link>
            <Link href="/how-to-play" className="block hover:text-gray-300">How to Play</Link>
            <Link href="/faq" className="block hover:text-gray-300">Frequently Asked Questions</Link>
          </div>
          
          {/* Column 2 - Legal links */}
          <div className="space-y-4">
            <Link href="/terms" className="block hover:text-gray-300">Terms & Conditions</Link>
            <Link href="/privacy" className="block hover:text-gray-300">Privacy Notice</Link>
            <Link href="/responsible" className="block hover:text-gray-300">Play Responsibly</Link>
          </div>
          
          {/* Column 3 - Customer service */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-600 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>Live Customer Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-600 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Support@tronadolottery.ae</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-600 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>8002365</span>
            </div>
          </div>
          
          {/* Column 4 - Social media links */}
          <div className="text-center sm:text-left">
            <div className="flex space-x-4 mb-4 justify-center sm:justify-start">
              <Link href="#" className="bg-gray-600 hover:bg-gray-500 rounded-full p-2 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </Link>
              <Link href="#" className="bg-gray-600 hover:bg-gray-500 rounded-full p-2 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
              <Link href="#" className="bg-gray-600 hover:bg-gray-500 rounded-full p-2 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Link>
              <Link href="#" className="bg-gray-600 hover:bg-gray-500 rounded-full p-2 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </Link>
            </div>
            
            {/* Age verification badge */}
            <div className="flex items-center mb-4 justify-center sm:justify-start">
              <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mr-2">
                18+
              </div>
              <div className="text-xs">
                PLAY RIGHT<br />
                PLAY RESPONSIBLY
              </div>
            </div>
            
            {/* Legal disclaimer */}
            <p className="text-xs text-gray-300">
              You must be 18 years or older to register and use this platform.<br />
              Individuals from restricted jurisdictions are not permitted to register or use this platform.
            </p>
          </div>
        </div>
        
        {/* Bottom footer with logo and copyright */}
        <div className="pt-8 border-t border-gray-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center mb-4 md:mb-0 justify-center">
            <Image 
              src="/Logo.png" 
              alt="Tronado Lottery Logo" 
              width={80} 
              height={80} 
              className="mr-3"
            />
            <div className="text-sm">
              THE TRONADO<br />
              LOTTERY<br />
              النصيب
            </div>
          </div>
          
          <div className="text-xs text-gray-300 text-center md:text-right max-w-xs mx-auto md:mx-0">
            <div className="flex items-center justify-end mb-2">
              <span className="mr-1">En</span>
            </div>
            <p>© THE GAME L.L.C, 2025 Licensed by the GCGRA.</p>
            <p>Version 1.0.5</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
