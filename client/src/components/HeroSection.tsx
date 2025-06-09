import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const benefitItems = [
  { text: 'No more Scattered Files/Sheets' },
  { text: 'No more Complex Invoice Generation' },
  { text: 'No more Formulas' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="px-4 pt-8 md:pt-20 pb-12 md:pb-20">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge at the top, centered */}
        <div className="flex justify-center mb-6 w-full">
          <div className="flex items-center bg-white rounded-full shadow-sm px-4 py-2 space-x-3 mx-auto">
            <div className="flex -space-x-2">
              <img
                src="https://cdn.brandfetch.io/google.com:gmail/icon"
                alt="Gmail"
                className="w-7 h-7 rounded-full border-2 border-white bg-white"
              />
              <img
                src="https://cdn.brandfetch.io/google.com:calendar/icon"
                alt="Calendar"
                className="w-7 h-7 rounded-full border-2 border-white bg-white"
              />
              <img
                src="https://cdn.brandfetch.io/google.com:drive/icon"
                alt="Drive"
                className="w-7 h-7 rounded-full border-2 border-white bg-white"
              />
            </div>
            <span className="text-[#2F303C] font-medium text-md whitespace-nowrap text-center">
              Recommended for Google Sheets/Workspace
            </span>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          <span className="text-[#2F303C]">Stop </span>
          <span className="text-green-800">Wrestling</span>
          <span className="text-[#2F303C]"> with</span>
          <br className="hidden sm:block" />
          <span className="text-green-800">
            Invoices <span className="text-[#2F303C]">in</span> Google Sheets.
          </span>
        </h1>
        <p className="text-[#5C5B61] font-sans font-medium text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Say goodbye to clunky templates and confusing formulas. SheetBills is
          the easiest way to manage invoices—built right into Google Sheets and
          powered by smart integrations like Make, Google Drive, and WhatsApp.
          
        </p>
        {/* Feature list centered */}
        <div className="flex justify-center mb-10">
          <ul className="font-sans font-medium text-md text-center text-[#5C5B61] leading-relaxed space-y-1">
            <li className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Ditch formulas & templates
            </li>
            <li className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Centralized invoice management
            </li>
            <li className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Smart syncing with Google Drive
            </li>
          </ul>
        </div>
        {/* Center the button */}
        <div className="flex justify-center w-full">
          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full px-16 py-10 font-medium text-base shadow-none border-none"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
              <g>
                <path fill="#4285F4" d="M21.805 10.023h-9.82v3.977h5.627c-.243 1.3-1.47 3.818-5.627 3.818-3.386 0-6.145-2.803-6.145-6.26s2.759-6.26 6.145-6.26c1.927 0 3.222.82 3.963 1.527l2.71-2.634C17.13 2.62 15.02 1.5 12.5 1.5 6.977 1.5 2.5 5.977 2.5 11.5s4.477 10 10 10c5.74 0 9.5-4.02 9.5-9.72 0-.65-.07-1.28-.195-1.757z"/>
                <path fill="#34A853" d="M3.653 7.345l3.285 2.41C7.7 8.36 9.89 6.5 12.5 6.5c1.927 0 3.222.82 3.963 1.527l2.71-2.634C17.13 2.62 15.02 1.5 12.5 1.5c-3.13 0-5.8 1.77-7.347 4.345z"/>
                <path fill="#FBBC05" d="M12.5 21.5c2.52 0 4.63-.83 6.18-2.26l-2.85-2.34c-.79.67-1.8 1.07-3.33 1.07-2.15 0-3.97-1.45-4.62-3.41l-3.25 2.51C5.7 19.38 8.77 21.5 12.5 21.5z"/>
                <path fill="#EA4335" d="M21.805 10.023h-9.82v3.977h5.627c-.243 1.3-1.47 3.818-5.627 3.818-3.386 0-6.145-2.803-6.145-6.26s2.759-6.26 6.145-6.26c1.927 0 3.222.82 3.963 1.527l2.71-2.634C17.13 2.62 15.02 1.5 12.5 1.5 6.977 1.5 2.5 5.977 2.5 11.5s4.477 10 10 10c5.74 0 9.5-4.02 9.5-9.72 0-.65-.07-1.28-.195-1.757z"/>
              </g>
            </svg>
            Connect Google Account
          </Button>
        </div>
        {/* Social Proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((n) => (
              <img
                key={n}
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
                alt={`User ${n}`}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex text-yellow-400 justify-center sm:justify-start">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-md">
                  ★
                </span>
              ))}
            </div>
            <p className="text-[#5C5B61]">
              Join <span className="font-medium">250+</span> Satisfied Users
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 