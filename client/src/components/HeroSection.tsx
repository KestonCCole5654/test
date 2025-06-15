import React from 'react';
import { CheckIcon, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoogleButton from './GoogleButton';
import IntegrationBadge from './IntegrationBadge';
import SocialProof from './SocialProof';


const benefitItems = [
  { text: 'No more Scattered Files/Sheets' },
  { text: 'No more Complex Invoice Generation' },
  { text: 'No more Formulas' },
];


const integrations = [
  {
    src: "/google-sheets.svg",
    alt: "Google Sheets",
    name: "Sheets",
    bgColor: "bg-green-50",
  },
  {
    src: "/google-drive.svg",
    alt: "Google Drive",
    name: "Drive",
    bgColor: "bg-blue-50",
  },
  {
    src: "/make-logo.svg",
    alt: "Make",
    name: "Make",
    bgColor: "bg-purple-50",
  },
  {
    src: "/whatsapp-logo.svg",
    alt: "WhatsApp",
    name: "WhatsApp",
    bgColor: "bg-green-50",
  },
]








const HeroSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  
  const handleGoogleLogin = async () => {
    setLoading(true);
    navigate("/login");
    setLoading(false);
  };

  return (
    <section className="px-4 pt-8 md:pt-20 pb-12 md:pb-20">
      <div className="max-w-7xl mx-auto text-center">
      <IntegrationBadge />

        <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold leading-tight mb-6">
          <span className="text-[#2F303C]">Stop </span>
          <span className="text-green-800">Wrestling</span>
          <span className="text-[#2F303C]">  with <br/> </span>
          <span className="text-green-800"> Invoices <span className="text-[#2F303C]">in</span> Google Sheets.
          </span>
        </h1>
        
        <p className="text-[#5C5B61] font-sans font-medium text-md md:text-xl max-w-lg md:max-w-3xl mx-auto mb-0 md:mb-8">
          Say goodbye to clunky templates and confusing formulas. 
          SheetBills is the easiest way to manage invoices—built right into Google Sheets and
          powered by smart integrations like Make, Google Drive, and WhatsApp.
          
        </p>
        <div className="flex justify-center mb-10">
          <ul className="hidden font-sans font-normal  text-md md:block text-center text-[#5C5B61] leading-relaxed space-y-1 md:-mt-3">
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
              Seamless Google Sheets Integration
            </li>
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
              Automated Invoice Generation
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
              Easy Customer & Business Details Management
            </li>
          
          </ul>
        </div>
        
        <div className="flex justify-center mb-10">
          <GoogleButton
            onClick={handleGoogleLogin}
            loading={loading}
            disabled={loading}
            text="Connect SheetsBills"
          />
        </div>

    
        {/* Social Proof */}
        <SocialProof />
      </div>
      
    </section>
  );
};

export default HeroSection; 