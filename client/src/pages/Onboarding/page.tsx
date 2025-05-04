import React from "react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to SheetBills
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get started by setting up your business sheet
          </p>
        </div>
      </div>
    </div>
  );
}
