import React from 'react';

const FooterSection = () => (
  <footer className="bg-gray-50 border-t  border-gray-100 py-8 px-4">
    <div className="max-w-7xl mx-auto text-center">
      <img src="/sheetbills-logo.svg" alt="SheetBills Logo" className="h-9 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">
        Powered by <span className="text-green-800">SheetBills</span>
      </p>
      <p className="text-gray-500 text-sm mb-4">
        © 2025 <span className="text-green-800">SheetBills</span>. All rights reserved.
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
);

export default FooterSection; 