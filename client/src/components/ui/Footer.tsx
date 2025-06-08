import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 font-onest border-t border-green-100 rounded-b-2xl py-12 px-4 flex flex-col items-center justify-center mt-20">
      <div className="flex flex-col items-center mb-4">
        <img src="/sheetbills-logo.svg" alt="SheetBills Logo" className="h-8 w-auto mb-2" />
        <div className="w-full font-onest text-center text-md text-gray-400">
          Powered by <span className="font-onest text-md font-medium text-green-800">SheetBills</span>
        </div>
      </div>
      <div className="text-gray-400 font-onest text-sm mb-2">© {new Date().getFullYear()} SheetBills. All rights reserved.</div>
      <div className="flex items-center font-onest gap-3 text-gray-400 text-sm">
        <a href="/privacy" className="hover:text-green-800 font-onest transition-colors">Privacy Policy</a>
        <span className="mx-1">|</span>
        <a href="/terms" className="hover:text-green-800 font-onest transition-colors">Terms of Service</a>
      </div>
    </footer>
  );
} 