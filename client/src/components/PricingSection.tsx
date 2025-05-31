import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-gray-50 py-16 md:py-24 px-4" id="pricing">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl text-[#2F303C] md:text-4xl font-normal mb-6">
          Get Your SheetBills Free Plan
        </h2>
        <p className="text-[#2F303C] font-sans font-medium text-lg mb-12">
          All the essentials for $0.00 — forever.
          <span className="text-green-800 block mt-2">
            Paid plans with advanced features are coming soon!
          </span>
        </p>
        <div className="max-w-md mx-auto relative bg-white rounded-2xl border-2 border-green-800 p-6 md:p-8">
          <div className="absolute font-sans font-medium text-lg -top-4 left-1/2 transform -translate-x-1/2 bg-green-800 text-white px-4 py-1 rounded-md ">
            All Features Included
          </div>
          <div className="mt-4 mb-8">
            <div className="flex items-baseline justify-center">
              <span className="text-4xl md:text-5xl font-normal">$0.00</span>
              <span className="text-[#2F303C] ml-2">USD</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 text-left">
            <li className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-800 mr-2" />
              <span className="font-sans font-medium text-lg">Unlimited invoices</span>
            </li>
            <li className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-800 mr-2" />
              <span className="font-sans font-medium text-lg">
                <span className="bg-green-100 font-sans font-medium text-lg  text-green-800 px-2 py-0.5 rounded mr-1">
                  Unlimited
                </span>
                Invoice Link Generation
              </span>
            </li>
            <li className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-800 mr-2" />
              <span className="font-sans font-medium text-lg"> Automatic formatting — no templates or formulas</span>
            </li>
          </ul>
          <Button
            onClick={() => navigate('/login')}
            className="w-full font-sans font-medium text-lg bg-green-800 hover:bg-green-700 text-white py-3"
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 