import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

const navItems = [
  { title: 'Why SheetBills ?', href: '#why' },
  { title: 'How it Works', href: '#how' },
  { title: 'FAQs', href: '#faqs' },
];

const HeaderSection = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="top-0 z-50 w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              className="h-14 w-auto"
              alt="Sheetbills"
              src="/SheetBills-logo.svg"
            />
            <span className="font-bold text-green-800 text-lg">SheetBills</span>
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
              onClick={() => navigate('/login')}
              className="bg-green-800 hover:bg-green-700 rounded-sm text-white px-6"
            >
              Try for free
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
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-green-800 hover:bg-green-700 rounded-sm text-white mt-4"
            >
              Try for free
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderSection; 