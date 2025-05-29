import React from 'react';
import { CheckIcon } from "lucide-react";

// Main App Component
export default function App() {
  return (
    <div className="flex flex-col items-center relative bg-white">
      {/* Header/Navigation Section */}
      <header className="flex flex-col items-center justify-center w-full py-3 px-6 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between w-full max-w-7xl">
          {/* Logo */}
          <div className="flex items-center gap-[7px]">
            <div className="w-[54px] py-3">
              <img
                className="w-full h-10"
                alt="Sheetbills"
                src="/sheetbills-logo77-1.png"
              />
            </div>
            <div className="[font-family:'Cal_Sans',Helvetica] font-normal text-green-800 text-xl">
              SheetBills
            </div>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="flex gap-[13px]">
              {['Why SheetBills ?', 'How it Works', 'FAQs'].map((link, index) => (
                <li key={index}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                    className="[font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-xl text-center w-fit block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button */}
          <button className="bg-green-800 text-white rounded-[10px] px-[53px] py-3 [font-family:'Cal_Sans',Helvetica] font-normal text-xl">
            Get Started
          </button>
        </div>
      </header>

      {/* Invoice Screenshot Section */}
      <div className="w-full flex justify-center my-8">
        <img
          className="w-[1154px] max-w-full h-auto object-cover"
          alt="Screencapture"
          src="/screencapture-sheetbills-client-vercel-app-create-invoice-2025-0.png"
        />
      </div>

      {/* Pricing Section */}
      <section className="flex flex-col items-center justify-center gap-8 py-8 px-4 md:px-24 w-full">
        <div className="flex items-center">
          <div className="font-sans text-xl text-gray-600 mr-4">Powered by</div>
          <div className="relative flex items-center px-2 py-2 rounded-[9px] shadow-[0px_4px_4px_#1ea952a6] bg-white">
            <img
              className="w-[52px] h-[42px] object-cover"
              alt="Google Sheets Logo"
              src="/61447d485953a50004ee16dc--1--1.png"
            />
            <div className="font-sans text-base text-green-800 text-center ml-1">
              Google Sheets
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <h1 className="font-sans text-5xl md:text-6xl text-center leading-tight">
            <span className="text-black">Tired of </span>
            <span className="text-green-800">Wrestling</span>
            <span className="text-black"> with </span>
            <span className="text-green-800">Invoices</span>
            <span className="text-black"> in </span>
            <span className="text-green-800">Google Sheets ?</span>
          </h1>
          <p className="font-sans text-xl text-gray-600 text-center max-w-lg">
            Ditch the templates, formulas and frustration. SheetBills makes
            invoicing in Google Sheets fast, simple and professional
          </p>
        </div>

        {/* Benefits List */}
        <div className="flex flex-col items-start gap-3">
          {["No more scattered files", "No more formulas", "No more copying and pasting"].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckIcon className="w-[15px] h-[15px] text-green-800" />
              <span className="font-sans text-[15px] text-gray-600">{benefit}</span>
            </div>
          ))}
        </div>

        <button className="bg-green-800 text-white font-sans text-xl px-12 py-4 rounded-[10px]">
          Try for Free
        </button>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center justify-center gap-5 py-16 px-8 md:px-16 lg:px-32 w-full bg-white">
        <div className="flex flex-col items-center gap-8 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl text-green-800 [font-family:'Cal_Sans',Helvetica] mb-2">
              Why Us ?
            </h3>
            <h2 className="text-4xl md:text-5xl [font-family:'Cal_Sans',Helvetica] font-normal mb-3">
              <span className="text-green-800">Invoice</span>
              <span className="text-black">&nbsp;&nbsp;Creation&nbsp;&nbsp;Made </span>
              <span className="text-green-800">Simple</span>
            </h2>
            <p className="text-xl text-gray-600 [font-family:'Cal_Sans',Helvetica] max-w-2xl">
              Transform your Google Sheets Into a powerful invoicing system. No
              more complex formulas or messy templates.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {[
              {
                icon: "/frame-15.svg",
                title: "Designed for Simplicity & Speed",
                description: "Transform your Google Sheets Into a powerful invoicing system. No more complex formulas or messy templates.",
              },
              {
                icon: "/frame-11.svg",
                title: "Tired of Messy Invoice Spreadsheets?",
                description: "Stop battling copy-paste errors, broken formulas, and clunky templates.",
              },
              {
                icon: "/frame-13.svg",
                title: "Built on Google Sheets - No Extra Tools Needed",
                description: "Skip the learning curve! SheetBills works directly inside the Google Sheets you already use, so there's no need to install software or migrate data.",
              },
              {
                icon: "/frame-7.svg",
                title: "Confused by Complex Invoicing Software?",
                description: "No need for heavy software — SheetBills simplifies invoicing right where you're already working: Google Sheets.",
              }
            ].map((feature, index) => (
              <div key={index} className="rounded-[10px] overflow-hidden border-none shadow-sm bg-white p-5">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-[102px] h-[95px] bg-white rounded-[9px] overflow-hidden border-4 border-solid border-green-800 shadow-[0px_4px_4px_#00000040] flex items-center justify-center">
                    <img className="w-12 h-12" alt="Feature icon" src={feature.icon} />
                  </div>
                  <h3 className="[font-family:'Cal_Sans',Helvetica] font-normal text-black text-[25px] text-center">
                    {feature.title}
                  </h3>
                  <p className="[font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-xl text-center">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Plan Section */}
      <section className="flex flex-col items-center justify-center gap-[18px] px-2.5 py-16 w-full">
        <h3 className="[font-family:'Cal_Sans',Helvetica] font-normal text-green-800 text-lg text-center">
          Pricing Section
        </h3>
        <h2 className="max-w-[700px] [font-family:'Cal_Sans',Helvetica] font-normal text-black text-[50px] text-center">
          Get Started Free — No Hidden Costs, No Commitments
        </h2>
        <p className="max-w-[618px] [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-lg text-center">
          With SheetBills, your Google Sheets become a full-featured invoice
          generation system — manage, share, and print invoices effortlessly, all
          for free
        </p>

        {/* Premium Plan Card */}
        <div className="w-[400px] bg-green-800 rounded-[20px] overflow-hidden shadow-[4px_4px_10px_-4px_#0124443d] p-[30px]">
          <div className="[font-family:'Cal_Sans',Helvetica] font-normal text-white text-base mb-[51px]">
            Premium
          </div>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-4xl">
                $30,000
              </h2>
              <p className="[font-family:'Cal_Sans',Helvetica] font-normal text-white text-base">
                An upgrade from the Basic plan. You get more benefits and access.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <h3 className="[font-family:'Poppins',Helvetica] font-medium text-base text-white">
                Benefits
              </h3>
              <div className="flex flex-col gap-5">
                {[
                  "All the benefits on the basic plan",
                  "₦1,000,000 daily transfer limit",
                  "7 free transfers every month",
                  "Daily Airtime and Data payments up to ₦150,000 / day",
                  "7 free transfers every month",
                  "1 Month free trial",
                  "Access to full financial analysis and summary",
                  "7 free transfers every month"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-5 h-5 bg-[#ecffdf] rounded-[10px]">
                      <CheckIcon className="w-[10.67px] h-[8.02px] text-green-800" />
                    </div>
                    <p className="[font-family:'Cal_Sans',Helvetica] font-normal text-white text-sm">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-[60px]">
            <button className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-[50px] [font-family:'Cal_Sans',Helvetica] font-normal text-base">
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 mb-16 max-w-3xl mx-auto text-center">
            <h3 className="font-['Cal_Sans',Helvetica] text-lg text-green-800">
              Take Action Now Before Its Too Late !!!
            </h3>
            <h2 className="font-['Cal_Sans',Helvetica] text-[42px] text-black leading-[58.8px]">
              Ditch Formulas, Copy & Pasting and Messy Invoice Templates
            </h2>
            <p className="font-['Cal_Sans',Helvetica] text-base text-black leading-[30.4px]">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio.
              Quisque volutpat mattis eros. Nullam malesuada erat ut turpis.
              Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede
            </p>
            <button className="mt-6 bg-green-800 hover:bg-green-700 text-white font-['Cal_Sans',Helvetica] text-xl px-14 py-4 rounded-[10px]">
              Get SheetBills
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}