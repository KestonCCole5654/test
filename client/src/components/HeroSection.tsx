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
        <div className="flex items-center justify-center space-x-2 mb-6">
          <span className="text-[#5C5B61] text-sm">Made for</span>
          <span className="flex items-center bg-gray-50 px-2 py-1 rounded">
            <img
              className="w-5 h-5 mr-1"
              alt="Google Sheets logo"
              src="/Google_Sheets_logo_(2014-2020).svg"
            />
            <span className="text-green-600">Google Sheets</span>
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
          <span className="text-[#2F303C]">Stop </span>
          <span className="text-green-800">Wrestling</span>
          <span className="text-[#2F303C]"> with</span>
          <br className="hidden sm:block" />
          <span className="text-green-800">Invoices <span className="text-[#2F303C]">in</span> Google Sheets?</span>
        </h1>
        <p className="text-[#5C5B61] font-sans font-medium text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Ditch the templates, formulas and frustration. SheetBills makes
          invoicing in Google Sheets fast, simple and professional
        </p>
        <div className="flex justify-center mb-10">
          <ul className="hidden font-sans font-medium  text-md md:block text-center text-[#5C5B61] leading-relaxed space-y-1 md:-mt-3">
            <li className="flex  items-center justify-center lg:justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              No more Scattered Files/Sheets
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Google Sheets integration
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Ditch formulas & templates
            </li>
          </ul>
        </div>
       
        <Button
          onClick={() => navigate("/login")}
          className="w-full sm:w-auto bg-green-800 hover:bg-green-700 rounded-sm text-white px-16 py-3"
        >
          Try for Free
        </Button>
        {/* Social Proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <img
                key={n}
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
                alt={`User ${n}`}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex text-yellow-400 justify-center sm:justify-start">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">
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