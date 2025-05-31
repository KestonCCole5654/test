import React from 'react';
import { CheckIcon, FileTextIcon, RefreshCwIcon, RocketIcon, ZapIcon, ArrowRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
};

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
    className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full"
  >
    <div className="flex flex-col items-center text-center">
      <div className="mb-5">
        <div className="bg-green-50 w-16 h-16 rounded-xl flex items-center justify-center text-green-800">
          {icon}
        </div>
      </div>
      <h4 className="text-xl md:text-2xl font-medium text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600 flex-grow">{description}</p>
      
    </div>
  </motion.div>
);

const FeatureSection = () => {
  const featureCards = [
    {
      icon: <ZapIcon className="w-6 h-6" />,
      title: "One-Click Invoice Generation",
      description: "Create professional invoices in seconds, not hours. No more wrestling with formulas or layouts – just enter your data and let SheetBills handle the rest.",
    },
    {
      icon: <FileTextIcon className="w-6 h-6" />,
      title: "Seamless Google Sheets Integration",
      description: "Works directly with your existing Google Sheets. No data migration, no new software to learn – just enhanced functionality right where you already work.",
    },
    {
      icon: <RefreshCwIcon className="w-6 h-6" />,
      title: "Automated Organization",
      description: "Say goodbye to scattered invoices across multiple sheets. SheetBills automatically organizes everything in one place with powerful filtering and search.",
    },
    {
      icon: <RocketIcon className="w-6 h-6" />,
      title: "Client-Friendly Experience",
      description: "Provide clients with a professional, branded experience. They complete a simple form, and the invoice data flows directly into your Google Sheet – no errors, no hassle.",
    },
  ];

  return (
    <section className="py-20 px-4" id="features">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-green-800 font-medium px-4 py-1 bg-green-50 rounded-full mb-4"
          >
            Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-normal mb-6"
          >
            <span className="text-[#2F303C]">Simply </span>
            <span className="text-[#2F303C]">Better Invoicing</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#2F303C] font-sans font-medium text-lg max-w-2xl mx-auto"
          >
            Transform your Google Sheets into a professional invoicing system without any technical skills.
            Maintain full control of your data while streamlining your workflow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  md:gap-8 mb-16">
          {featureCards.map((card, index) => (
            <FeatureCard 
              key={index} 
              icon={card.icon} 
              title={card.title} 
              description={card.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection; 