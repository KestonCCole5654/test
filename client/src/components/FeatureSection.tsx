import React from 'react';
import { CheckIcon, FileTextIcon, RefreshCwIcon, RocketIcon, ZapIcon, ArrowRightIcon, CircleDollarSign, Target, FileCheck, GitFork, Headphones } from 'lucide-react';
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
        <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center text-blue-600 border border-gray-200 shadow-sm">
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
      icon: <FileTextIcon className="w-6 h-6" />,
      title: "Effortless Invoice Creation",
      description: "Generate professional invoices quickly with intuitive forms, no manual formatting required.",
    },
    {
      icon: <CircleDollarSign className="w-6 h-6" />,
      title: "Automated Calculations",
      description: "Automatically calculate totals, taxes, and discounts as you add items, ensuring accuracy.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Centralized Customer Management",
      description: "Keep all your customer details organized and easily accessible for quick invoicing.",
    },
    {
      icon: <ZapIcon className="w-6 h-6" />,
      title: "Instant Shareable Links",
      description: "Create secure, public links for your invoices that clients can view and print instantly.",
    },
    {
      icon: <RefreshCwIcon className="w-6 h-6" />,
      title: "Seamless Google Sheets Sync",
      description: "All your invoice data is automatically synced to your Google Sheet in real-time.",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Customizable Invoice Design",
      description: "Personalize your invoices with your business logo and brand colors to match your identity.",
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
            className="inline-block text-gray-700 font-medium px-4 py-1 bg-gray-100 rounded-full mb-4"
          >
            Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-normal mb-6 text-gray-900 leading-tight"
          >
            Streamline Your Invoicing with SheetBills.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 font-sans text-lg max-w-2xl mx-auto"
          >
            Simplify your billing process, automate calculations, and manage client records all in one place, powered by Google Sheets.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  md:gap-8 mb-16">
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