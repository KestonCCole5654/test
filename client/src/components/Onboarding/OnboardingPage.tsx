import React from 'react';

const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-cal-sans">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Onboarding Unavailable</h1>
        <p className="text-gray-600">Onboarding functionalities are temporarily frozen. Please check back later or contact support if you need assistance.</p>
      </div>
    </div>
  );
};

export default OnboardingPage; 