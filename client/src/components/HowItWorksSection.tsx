import React, { useState } from 'react';

const steps = [
  {
    title: '1. Connect your Google Account',
    description: 'Securely link your Google Sheets to SheetBills. No coding required.',
    isOpen: true,
  },
  {
    title: '2. Setup Business Details',
    description: 'Enter your business name, address, and other details.',
  },
  {
    title: '3. Customers generate invoices',
    description: 'Enter your customer details and generate invoices.',
  },
];

const HowItWorksSection = () => {
  const [openStepIdx, setOpenStepIdx] = useState(0);
  return (
    <section className="py-16 md:py-24 px-4" id="how">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl text-[#2F303C] md:text-4xl font-normal text-center mb-5">
          Get Started in Just 3 Simple Steps
        </h2>
        <p className="text-center text-[#2F303C] font-sans font-medium text-lg mb-12">SheetBills is designed to be simple and easy to use. Just follow these steps to get started.</p>
        <div className="grid md:grid-cols-2  gap-12">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <details
                key={index}
                open={index === openStepIdx}
                className="group border-b border-gray-200 pb-4"
              >
                <summary
                  onClick={e => {
                    e.preventDefault();
                    setOpenStepIdx(index === openStepIdx ? -1 : index);
                  }}
                  className="flex justify-between items-center cursor-pointer text-lg"
                >
                  <span className={index === 0 ? 'text-green-800' : 'text-gray-800'}>
                    {step.title}
                  </span>
                  <span>{index === openStepIdx ? '-' : '+'}</span>
                </summary>
                <div className="mt-4 text-[#2F303C] font-sans font-medium text-lg pl-4">{step.description}</div>
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
  );
};

export default HowItWorksSection; 