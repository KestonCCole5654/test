import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { useToast } from '../ui/use-toast';

// Type for the business profile data
interface BusinessProfile {
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * OnboardingPage component
 * - Step-based onboarding for new users
 * - Collects business info and contact details
 * - Submits to backend and redirects to dashboard on success
 */
const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Track the current step (1-based index)
  const [currentStep, setCurrentStep] = useState(1);
  // Store the business profile form data
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: '',
    businessType: '',
    email: '',
    phone: '',
    address: '',
  });

  // Define the onboarding steps and their fields
  const steps = [
    {
      title: 'Welcome to SheetBills',
      description: "Let's get your business set up in just a few steps.",
      fields: [],
    },
    {
      title: 'Business Information',
      description: 'Tell us about your business.',
      fields: [
        { name: 'businessName', label: 'Business Name', type: 'text', required: true },
        { name: 'businessType', label: 'Business Type', type: 'text', required: true },
      ],
    },
    {
      title: 'Contact Details',
      description: 'How can we reach you?',
      fields: [
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'address', label: 'Business Address', type: 'text', required: true },
      ],
    },
  ];

  // Handle input changes for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle advancing to the next step or submitting the form
  const handleNext = async () => {
    if (currentStep === steps.length) {
      // Final step: submit profile to backend
      try {
        const response = await fetch('/api/business/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
        if (!response.ok) throw new Error('Failed to save profile');
        toast({
          title: 'Success!',
          description: 'Your business profile has been created.',
        });
        navigate('/dashboard');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save your profile. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle going back to the previous step
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Get the current step's data
  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen font-cal-sans bg-background flex flex-col items-center justify-center p-4">
      <div className="flex-1 flex items-center justify-center w-full">
        <Card className="w-full max-w-2xl p-8 font-cal-sans">
          {/* Step header and description */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-cal-sans font-semibold">{currentStepData.title}</h1>
              <div className="text-sm text-muted-foreground font-cal-sans">
                Step {currentStep} of {steps.length}
              </div>
            </div>
            <p className="text-muted-foreground font-cal-sans">{currentStepData.description}</p>
          </div>

          {/* Step content: either fields or welcome message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepData.fields.length > 0 ? (
                <div className="space-y-4 font-cal-sans">
                  {currentStepData.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={profile[field.name as keyof BusinessProfile]}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 font-cal-sans">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-4xl mb-4 font-cal-sans">👋</div>
                    <p className="text-lg text-muted-foreground font-cal-sans">
                      We're excited to have you on board! Let's set up your business profile.
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 font-cal-sans">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
      {/* Footer */}
      <footer className="w-full font-cal-sans text-center text-md text-gray-400 mt-10 mb-2">
        Powered by <span className="font-cal-sans font-medium text-green-800">SheetBills™</span>
      </footer>
    </div>
  );
};

export default OnboardingPage; 