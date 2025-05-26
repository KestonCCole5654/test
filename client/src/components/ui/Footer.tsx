import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-green-100 rounded-b-2xl py-6 px-4 flex flex-col items-center justify-center mt-auto">
      <div className="text-gray-400 text-sm mb-1">© {new Date().getFullYear()} SheetBills. All rights reserved.</div>
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <a href="/privacy" className="hover:text-green-800 transition-colors">Privacy Policy</a>
        <span className="mx-1">|</span>
        <a href="/terms" className="hover:text-green-800 transition-colors">Terms of Service</a>
      </div>
    </footer>
  );
} 