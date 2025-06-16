import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center mb-4 md:mb-0">
          <img src="/sheetbills-logo.svg" alt="SheetBills Logo" className="h-9 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">
        Powered by <span className="text-green-800">SheetBills</span>
      </p>
      <p className="text-gray-500 text-sm mb-4">
        © 2025 <span className="text-green-800">SheetBills</span>. All rights reserved.
      </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link 
              to="/privacy-policy" 
              className="text-gray-600 hover:text-green-800 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-gray-600 hover:text-green-800 transition-colors"
            >
              Terms of Service
            </Link>
            <a 
              href="mailto:support@sheetbills.com" 
              className="text-gray-600 hover:text-green-800 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} SheetBills. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 