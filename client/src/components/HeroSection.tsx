import React from 'react';
import { CheckIcon, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';


const benefitItems = [
  { text: 'No more Scattered Files/Sheets' },
  { text: 'No more Complex Invoice Generation' },
  { text: 'No more Formulas' },
];











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
        <div className="flex items-center justify-center mb-6 w-full">
          <div className="flex items-center bg-white rounded-full shadow-md px-8 py-3 h-16 space-x-4 mx-auto">
            <div className="flex -space-x-3">
              <img
                src="/google-sheets.svg"
                alt="Google Sheets"
                className="w-9 h-9 rounded-full border-2 border-white bg-white"
              />
              <img
                src="/google-drive.svg"
                alt="Google Drive"
                className="w-9 h-9 rounded-full border-2 border-white bg-white"
              />
              <img
                src="/make-logo.svg"
                alt="Make"
                className="w-9 h-9 rounded-full border-2 border-white bg-white"
              />
              <img
                src="/whatsapp-logo.svg"
                alt="WhatsApp"
                className="w-9 h-9 rounded-full border-2 border-white bg-white"
              />
            </div>
            <span className="text-[#2F303C] font-semibold text-lg whitespace-nowrap text-center">
              3+ Integrations & Google Sheets
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
        <p className="text-[#5C5B61] font-sans font-medium text-lg md:text-xl max-w-xl mx-auto mb-8">
          Say goodbye to clunky templates and confusing formulas. 
          SheetBills is the easiest way to manage invoices—built right into Google Sheets and
          powered by smart integrations like Make, Google Drive, and WhatsApp.
          
        </p>
        <div className="flex justify-center mb-10">
          <ul className="hidden font-sans font-medium  text-md md:block text-center text-[#5C5B61] leading-relaxed space-y-1 md:-mt-3">
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
              Centralized invoice management
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
              Smart syncing with Google Drive
            </li>
          
          </ul>
        </div>
        
        <div className="flex justify-center mb-10">
        <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="h-12 w-full sm:w-auto px-6 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow transition-all duration-200 rounded-lg flex items-center justify-center gap-3 font-medium"
              >
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="font-normal">Continue with Google</span>
        </Button>

        </div>

    
        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((n) => (
              <img
                key={n}
                src={`/placeholder.svg?height=48&width=48`}
                alt={`User ${n}`}
                className="w-12 h-12 rounded-full border-3 border-white shadow-sm"
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              Join <span className="font-semibold text-gray-900">250+</span> satisfied users
            </p>
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default HeroSection; 