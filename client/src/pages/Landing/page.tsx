import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, Menu, X, FileTextIcon, RefreshCwIcon, RocketIcon, ZapIcon } from 'lucide-react';
import { Button } from '../../components/ui/button'

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
    <div className="flex flex-col p- min-h-screen bg-gray-50">
      {/* Header */}
      <header className=" top-0 z-50 w-full bg-gray-50  ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                className="h-8 w-auto"
                alt="Sheetbills"
                src="/sheetbills-logo.svg"
              />
              <span className="font-normal text-green-800 text-lg">
                SheetBills
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="text-gray-600 hover:text-green-800 transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </nav>

            {/* Desktop Login Button */}
            <div className="hidden md:block">
              <Button
                onClick={() => navigate("/login")}
                className="bg-green-800 hover:bg-green-700 text-white px-6"
              >
                Login
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="block text-gray-600 hover:text-green-800 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </a>
              ))}
              <Button
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-green-800 hover:bg-green-700 text-white mt-4"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-4 pt-8 md:pt-20 pb-12 md:pb-20">
          <div className="max-w-6xl flex flex-col items-center gap-0 md:gap-4  mx-auto text-center ">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="text-gray-600 font-sans font-medium text-md">Powered by</span>
              <span className="flex items-center bg-gray-50">
                <img
                  className="w-5 h-5 mr-1"
                  alt="Google Sheets logo"
                  src="/Google_Sheets_logo_(2014-2020).svg"
                />
                <span className="text-green-600 font-sans font-medium text-md">Google Sheets</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
              <span className="text-[#2F303C]">Stop </span>
              <span className="text-green-800">Wrestling</span>
              <span className="text-[#2F303C]"> with <br/> </span>
            
              <span className="text-green-800"> Invoices  <span className="text-[#2F303C]">in</span> Google Sheets</span>
            </h1>

            <p className="text-gray-600 font-sans font-medium text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Ditch the templates, formulas and frustration. SheetBills makes
              invoicing in Google Sheets fast, simple and professional
            </p>

            {/* Benefits */}
            <div className="flex flex-col items-center space-y-4  max-w-md mx-auto mb-6">
            <ul className="hidden text-[#2F303C] md:block text-base-content-secondary leading-relaxed space-y-1 md:-mt-3">
              <li className="flex items-center justify-center lg:justify-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[24px] h-[32px] text-green-800 font-bold"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <p className="text-[#2F303C] font-sans  font-medium">No more Scattered Files/Sheets</p>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[24px] h-[32px] text-green-800 font-bold"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <p className="text-[#2F303C] font-sans font-medium">No more Complex Invoice Generation</p>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[24px] h-[32px] text-green-800 font-bold"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <p className="text-[#2F303C] font-sans font-medium   ">No more Formulas</p>  
              </li>
            </ul>
            </div>
            

            <Button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto bg-green-800 hover:bg-green-700 text-md rounded-md font-sans font-semibold text-white px-24 py-6"
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
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex text-yellow-400 justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">
                  Join <span className="font-medium">250+</span> Satisfied Users
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16 md:py-24 px-4" id="features">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-green-800 text-lg mb-4">Why Us?</h2>
              <h3 className="text-3xl md:text-4xl font-medium text-[#2F303C] mb-6">
                <span className="text-[#2F303C]">Invoice Creation</span>
                <span className="text-[#2F303C]"> Made </span>
                <span className="text-[#2F303C]">Simple</span>
              </h3>
              <p className="text-gray-600 font-sans text-lg font-medium max-w-xl mx-auto">
                Transform your Google Sheets Into a powerful invoicing system.
                No more complex formulas or messy templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featureCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h4 className="text-xl font-medium text-center mb-3">
                    {card.title}
                  </h4>
                  <p className="text-gray-600 text-center">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 md:py-24 px-4" id="how">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-normal text-[#2F303C] text-center mb-12">
              Get Started in Just 3 Simple Steps
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-14">
              SheetBills is designed to be simple and easy to use.
            </p>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                {[
                  {
                    title: "1. Connect your Google Account",
                    description:
                      "Securely link your Google Sheets to SheetBills. No coding required.",
                    isOpen: true,
                  },
                  {
                    title: "2. Get your SheetBills link",
                    description:
                      "Instantly generate a unique link for your business.",
                  },
                  {
                    title: "3. Customers generate invoices",
                    description:
                      "Your customers fill out a simple form and we handle the rest.",
                  },
                ].map((step, index) => (
                  <details
                    key={index}
                    open={index === openStepIdx}
                    className="group border-b border-gray-200 pb-4"
                  >
                    <summary
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenStepIdx(index === openStepIdx ? -1 : index);
                      }}
                      className="flex justify-between items-center cursor-pointer text-lg"
                    >
                      <span
                        className={
                          index === 0 ? "text-green-800" : "text-gray-800"
                        }
                      >
                        {step.title}
                      </span>
                      <span>{index === openStepIdx ? "-" : "+"}</span>
                    </summary>
                    <div className="mt-4 text-gray-600 pl-4">
                      {step.description}
                    </div>
                  </details>
                ))}
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder-image.jpg"
                  alt="How it works"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-gray-50 py-16 md:py-24 px-4" id="pricing">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-normal text-[#2F303C] mb-6">
              Get Your SheetBills Free Plan
            </h2>
            <p className="text-gray-600 mb-12">
              All the essentials for $0.00 — forever.
              <span className="text-green-800 block mt-2">
                Paid plans with advanced features are coming soon!
              </span>
            </p>

            <div className="max-w-md mx-auto relative bg-white rounded-2xl border-2 border-green-800 p-6 md:p-8">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-800 text-white px-4 py-1 rounded-full text-sm">
                All Features Included
              </div>

              <div className="mt-4 mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl md:text-5xl font-normal">
                    $0.00
                  </span>
                  <span className="text-gray-500 ml-2">USD</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-800 mr-2" />
                  <span>Unlimited invoices</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-800 mr-2" />
                  <span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded mr-1">
                      Unlimited
                    </span>
                    Invoice Link Generation
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-800 mr-2" />
                  <span>Automatic formatting — no templates or formulas</span>
                </li>
              </ul>

              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-green-800 hover:bg-green-700 text-white py-3"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 md:py-24 px-4" id="faqs">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl  font-normal text-[#2F303C] text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "How do you bill your servers?",
                  a: "Servers have both a monthly price cap and a price per hour. Your server's bill will never exceed its monthly price cap.",
                },
                {
                  q: "Do you bill servers that are off?",
                  a: "Yes, servers that are off are still billed until they are deleted from your account.",
                },
                {
                  q: "Is there any way to get a custom configuration?",
                  a: "Yes, you can contact our support team to discuss custom configurations for your needs.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group border-b border-gray-200 pb-4"
                >
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-medium">
                    <span>{faq.q}</span>
                    <span className="text-green-800">+</span>
                  </summary>
                  <div className="mt-4 text-gray-600">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <img
            src="/sheetbills-logo.svg"
            alt="SheetBills Logo"
            className="h-8 mx-auto mb-4"
          />
          <p className="text-gray-600 mb-2">
            Powered by <span className="text-green-800">SheetBills</span>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            © 2025 <span className="text-green-800">SheetBills</span>. All
            rights reserved.
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-green-800">
              Privacy Policy
            </a>
            <span className="text-gray-300">|</span>
            <a href="/terms" className="text-gray-600 hover:text-green-800">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;