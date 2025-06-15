import React, { useState } from 'react';

const steps = [
  {
    title: '1. Connect Your Google Account',
    description: 'Securely link SheetBills to your Google account. This grants access to Google Sheets and Drive files that SheetBills creates and manages, without any coding required from your side.',
    isOpen: true,
  },
  {
    title: '2. Set Up Your Business Details',
    description: 'Easily enter your company name, business email, address, and phone number. This information is stored directly in your Google Sheet and automatically populates your invoices.',
  },
  {
    title: '3. Create & Manage Invoices',
    description: 'Start generating professional invoices by entering customer details and itemizing your services. All data is automatically saved and organized in your connected Google Sheet.',
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
        <div className="grid md:grid-cols-1 gap-12 max-w-2xl mx-auto">
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
          {/*
          <div className="hidden md:block">
            <img
              src="/placeholder-image.jpg"
              alt="How it works"
              className="rounded-lg shadow-lg"
            />
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 