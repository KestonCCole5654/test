import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, Menu, X, FileTextIcon, RefreshCwIcon, RocketIcon, ZapIcon } from 'lucide-react';
import { Button } from '../../components/ui/button'
import FeatureSection from '../../components/FeatureSection';
import HeaderSection from '../../components/HeaderSection';
import HeroSection from '../../components/HeroSection';
import HowItWorksSection from '../../components/HowItWorksSection';
import PricingSection from '../../components/PricingSection';
import FAQSection from '../../components/FAQSection';
// Feature card data
const featureCards = [
  {
    icon: <ZapIcon className="w-8 md:w-[35px] h-8 md:h-[35px]" />,
    title: "Designed for Simplicity & Speed",
    description: "Transform your Google Sheets Into a powerful invoicing system. No more complex formulas or messy templates.",
  },
  {
    icon: <FileTextIcon className="w-8 md:w-[49px] h-8 md:h-[49px]" />,
    title: "Google Sheets Powered",
    description: "Skip the learning curve! SheetBills works directly inside the Google Sheets you already use, so there's no need to install software or migrate data.",
  },
  {
    icon: <RefreshCwIcon className="w-8 md:w-[51px] h-8 md:h-[51px]" />,
    title: "No More Messy Invoice Spreadsheets",
    description: "Stop battling copy-paste errors, broken formulas, and clunky templates.",
  },
  {
    icon: <RocketIcon className="w-8 md:w-[49px] h-8 md:h-[49px]" />,
    title: "Confused by Complex Invoicing Software?",
    description: "No need for heavy software — SheetBills simplifies invoicing right where you're already working: Google Sheets.",
  },
];

  const navItems = [
  { title: "Why SheetBills ?", href: "#why" },
  { title: "How it Works", href: "#how" },
  { title: "FAQs", href: "#faqs" },
  ];

  const benefitItems = [
    { text: "No more Scattered Files/Sheets" },
  { text: "No more Complex Invoice Generation" },
    { text: "No more Formulas" },
  ];

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openStepIdx, setOpenStepIdx] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderSection />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
      </main>
  
    </div>
  );
};

export default LandingPage;