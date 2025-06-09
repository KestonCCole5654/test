import React from 'react';
import { CheckIcon, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';


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
      <div className="flex items-center justify-center mb-8 w-full">
      <div className="relative group">
        {/* Main badge container */}
        <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-4 border border-gray-100/50 group-hover:border-gray-200/80">
          {/* Logo section with enhanced visibility */}
          <div className="flex items-center space-x-1 mr-6">
            <div className="flex -space-x-2">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className={`relative w-12 h-12  ${integration.bgColor} border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 hover:-translate-y-1 flex items-center justify-center group/logo`}
                  style={{
                    zIndex: integrations.length - index,
                  }}
                >
                  <img
                    src={integration.src || "/placeholder.svg?height=24&width=24"}
                    alt={integration.alt}
                    className="w-7 h-7 transition-transform duration-200 group-hover/logo:scale-110"
                  />

                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1  opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {integration.name}
                  </div>
                </div>
              ))}
            </div>

        
          </div>

          {/* Text section with better typography */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-bold text-lg leading-tight">3+ Integrations</span>
            <span className="text-gray-500 font-medium text-sm">Built for Google Sheets</span>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
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
        <p className="text-[#5C5B61] font-sans font-medium text-lg md:text-xl max-w-3xl mx-auto mb-8">
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
                src={`https://png.pngtree.com/thumb_back/fh260/background/20230615/pngtree-man-wearing-a-pair-of-yellow-sunglasses-in-front-of-a-image_2898170.jpg`}
                alt={`User ${n}`}
                className="w-12 h-12 rounded-full border-3 border-white shadow-sm"
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FCD34D" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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