"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  X,
  Sparkles,
  SkipForward,
} from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import supabase from "../../components/Auth/supabaseClient"
import { useSession } from '@supabase/auth-helpers-react'
import { LoadingSpinner } from "../../components/ui/loadingSpinner"



// Progress Dots Component
const ProgressDots = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === currentStep
              ? "bg-green-600 w-4"
              : index < currentStep
              ? "bg-green-400"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  )
}

// Welcome Screen Component
const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <h1 className="text-4xl font-cal-sans font-normal mb-4">Let's Get Started</h1>
      <p className="text-gray-600 font-cal-sans dark:text-gray-400 mb-8">
        Set up your <span className="font-normal text-green-800 text-lg">SheetBills ™</span> account to start managing your invoices efficiently.
      </p>
      <Button
        onClick={onStart}
        className="bg-green-600 font-cal-sans hover:bg-green-700 px-8 py-6 text-lg"
      >
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  )
}

export default function InitializePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const [inputValid, setInputValid] = useState<boolean | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)

  // Auth tokens state
  const [supabaseToken, setSupabaseToken] = useState("")
  const [googleAccessToken, setGoogleAccessToken] = useState("")

  // Business details state
  const [businessData, setBusinessData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
  })

  // Survey state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Questions to ask in sequence
  const questions = [
    {
      id: "companyName",
      question: "What's your company name?",
      description: "This will appear on all your invoices and documents.",
      field: "companyName",
      required: true,
      icon: <Building2 className="h-5 w-5" />,
      placeholder: "e.g. Acme Inc.",
      validate: (value: string) => (value.trim() ? "" : "Company name is required"),
    },
    {
      id: "email",
      question: "What's your business email?",
      description: "We'll use this for communications related to your account.",
      field: "email",
      required: true,
      icon: <Mail className="h-5 w-5" />,
      placeholder: "e.g. contact@yourcompany.com",
      validate: (value: string) => {
        if (!value.trim()) return "Business email is required"
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email address"
        return ""
      },
    },
    {
      id: "phone",
      question: "What's your business phone number?",
      description: "Optional: This will appear on your invoices.",
      field: "phone",
      required: false,
      icon: <Phone className="h-5 w-5" />,
      placeholder: "e.g. (555) 123-4567",
      validate: () => "",
    },
    {
      id: "address",
      question: "What's your business address?",
      description: "Optional: This will appear on your invoices and documents.",
      field: "address",
      required: false,
      icon: <MapPin className="h-5 w-5" />,
      placeholder: "e.g. 123 Business St, City, State, ZIP",
      validate: () => "",
    },
  ]

  // Focus input when current question changes
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 500)

    // Reset input validation state when question changes
    setInputValid(null)
  }, [currentQuestion])

  // Get auth tokens on mount
  useEffect(() => {
    // Retrieve tokens using the correct keys set by auth-callback
    const supabaseToken = localStorage.getItem("supabase_token") || sessionStorage.getItem("supabase_token");
    const googleAccessToken = localStorage.getItem("google_access_token") || sessionStorage.getItem("google_access_token");

    if (supabaseToken) {
      setSupabaseToken(supabaseToken);
    } else {
      setError("Authentication required. Please sign in.");
    }
    if (googleAccessToken) {
      setGoogleAccessToken(googleAccessToken);
    } else {
      setError("Google authentication required. Please sign in again.");
    }
  }, [])

  // Validate current input whenever it changes
  useEffect(() => {
    const currentQ = questions[currentQuestion]
    const field = currentQ.field as keyof typeof businessData
    const value = businessData[field]

    if (value.trim() === "") {
      setInputValid(null) // Not validated yet
    } else {
      const validationError = currentQ.validate(value)
      setInputValid(validationError === "")
    }
  }, [businessData, currentQuestion])

  const triggerConfetti = () => {
    if (confettiCanvasRef.current) {
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true,
      })

      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  // Simple input change handler - no animations or complex logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const field = questions[currentQuestion].field as keyof typeof businessData

    setBusinessData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    const currentQ = questions[currentQuestion]
    const field = currentQ.field as keyof typeof businessData
    const value = businessData[field]
    // Validate current question
    const validationError = currentQ.validate(value)
    if (validationError) {
      setInputValid(false)
      setError(validationError)
      return
    }
    // Move to next question or review
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowReview(true)
    }
  }

  const handlePrevious = () => {
    if (showReview) {
      setShowReview(false)
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowReview(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNext()
    }
  }

  const session = useSession()

  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  // Check onboarding status on mount
  useEffect(() => {
    async function checkOnboarding() {
      if (!googleAccessToken) return;
      try {
        const response = await fetch("https://sheetbills-server.vercel.app/api/check-master-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: googleAccessToken }),
        });
        const data = await response.json();
        setIsOnboarded(data.onboarded);
        if (data.onboarded) {
          // Optionally, redirect to dashboard or show a message
          navigate('/invoices');
        }
      } catch (err) {
        console.error("Failed to check onboarding status", err);
      }
    }
    checkOnboarding();
  }, [googleAccessToken, navigate]);

  const createBusinessSheet = async () => {
    if (!supabaseToken || !googleAccessToken) {
      setError("Missing authentication tokens. Please try logging in again.");
      return;
    }

    // Add debug logging for tokens
    console.log("supabaseToken", supabaseToken);
    console.log("googleAccessToken", googleAccessToken);

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("https://sheetbills-server.vercel.app/api/create-business-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-token": supabaseToken,
        },
        body: JSON.stringify({
          accessToken: googleAccessToken,
          businessData: businessData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        if (response.status === 401) {
          throw new Error("Authentication failed. Please try logging in again.");
        } else if (response.status === 400) {
          throw new Error(data.error || "Invalid business data provided");
        } else {
          throw new Error(data.error || "Failed to create business sheet");
        }
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to create business sheet");
      }

      // Store the spreadsheet ID and URL
      sessionStorage.setItem("spreadsheetId", data.spreadsheetId);
      sessionStorage.setItem("spreadsheetUrl", data.spreadsheetUrl);

      setShowSuccess(true);
      setIsSubmitting(false);
    } catch (error: unknown) {
      console.error("Setup error:", error);
      setError(error instanceof Error ? error.message : "Failed to create business sheet. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Floating elements for visual interest
  const FloatingElements = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {i % 3 === 0 ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300/20 to-blue-300/20 blur-xl" />
            ) : i % 3 === 1 ? (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 blur-xl" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-300/20 blur-xl" />
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // Render the current question
  const renderCurrentQuestion = () => {
    const currentQ = questions[currentQuestion]
    const field = currentQ.field as keyof typeof businessData
    const value = businessData[field]

    let inputBorderClass = "border border-gray-200 dark:border-gray-700"
    if (inputValid === true) {
      inputBorderClass = "border border-green-500 dark:border-green-600"
    } else if (inputValid === false) {
      inputBorderClass = "border border-red-500 dark:border-red-600"
    } else if (inputFocused) {
      inputBorderClass = "border border-green-500 dark:border-green-600"
    }

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-cal-sans font-normal text-center mb-2"
          >
            {currentQ.question}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 font-cal-sans dark:text-gray-400 text-center text-md"
          >
            {currentQ.description}
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <Input
              ref={inputRef}
              type={currentQ.id === "email" ? "email" : "text"}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={currentQ.placeholder}
              className={`w-full p-4 text-base font-cal-sans ${inputBorderClass} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300`}
            />

            {inputValid !== null && value.trim() !== "" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {inputValid ? (
                  <CheckCircle className="h-5 w-5 font-cal-sans text-green-500" />
                ) : (
                  <X className="h-5 w-5 font-cal-sans text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {currentQ.required ? (
            <p className="text-sm text-gray-500 font-cal-sans mt-2">* Required field</p>
          ) : (
            <p className="text-sm text-gray-500 font-cal-sans mt-2">* Required field</p>
          )}
        </motion.div>

        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button variant="outline" className="flex-1" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          <Button
            className={`flex-1 ${
              currentQuestion === 0 && !value
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 font-cal-sans hover:bg-green-700"
            }`}
            onClick={handleNext}
            disabled={currentQ.required && !value}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Render the review screen
  const renderReviewScreen = () => {
    return (
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-cal-sans font-medium mb-2">Great! You're Almost There</h2>
          <p className="text-gray-600 font-cal-sans dark:text-gray-400">
            Please review your business details before we set up your account.
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {[
            {
              id: "companyName",
              icon: <Building2 className="h-5 w-5 font-cal-sans text-green-600 dark:text-green-400" />,
              label: "Company Name",
              color: "green",
            },
            {
              id: "email",
              icon: <Mail className="h-5 w-5 font-cal-sans text-blue-600 dark:text-blue-400" />,
              label: "Business Email",
              color: "blue",
            },
            {
              id: "phone",
              icon: <Phone className="h-5 w-5 font-cal-sans text-purple-600 dark:text-purple-400" />,
              label: "Phone Number",
              color: "purple",
            },
            {
              id: "address",
              icon: <MapPin className="h-5 w-5 font-cal-sans text-orange-600 dark:text-orange-400" />,
              label: "Business Address",
              color: "orange",
            },
          ].map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 p-2 rounded-full`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 font-cal-sans">{item.label}</h3>
                  <p className="text-gray-900 dark:text-gray-100 font-cal-sans">
                    {businessData[item.id as keyof typeof businessData] || "Not provided"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 font-cal-sans text-green-600 dark:text-green-400" />
            </div>
              <div>
                <h3 className="font-medium text-sm text-green-800 dark:text-green-300 font-cal-sans">Ready to Go!</h3>
                <p className="text-green-700 dark:text-green-400 text-sm font-cal-sans">
                  Your business profile is ready to be created. Click "Complete Setup" to finish.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={createBusinessSheet}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Completing setup..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        </motion.div>
      </div>
    )
  }

  // Render the success screen
  const SuccessScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Handler for continue button: set just_onboarded flag and navigate
    const handleContinue = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("https://sheetbills-server.vercel.app/api/create-business-sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-supabase-token": supabaseToken
          },
          body: JSON.stringify({
            accessToken: googleAccessToken,
            businessData: businessData,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to set up your business")
        }
        // Store the spreadsheet ID and URL for future use
        if (data.businessSheetId) {
          localStorage.setItem("business_sheet_id", data.businessSheetId)
        }
        if (data.spreadsheetUrl) {
          localStorage.setItem("business_sheet_url", data.spreadsheetUrl)
        }
        
        // Set the just_onboarded flag and navigate
        localStorage.setItem('just_onboarded', 'true');
        navigate('/invoices');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setIsLoading(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center max-w-md mx-auto"
          >
            <div className="relative mb-8">
              <LoadingSpinner />
            </div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-cal-sans font-medium mb-4"
            >
              Redirecting to dashboard...
            </motion.h2>
            {error && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4"
              >
                <p className="text-red-800 font-cal-sans dark:text-red-300 text-sm">
                  {error}
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <CheckCircle2 className="h-16 w-16 font-cal-sans text-green-800 mx-auto" />
            </div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-2xl font-cal-sans font-medium mb-2"
            >
              Welcome to <span className=" font-cal-sans font-medium text-green-800 text-3xl">SheetBills™</span>, <br /> Setup Complete!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-gray-600 font-cal-sans dark:text-gray-400 mb-5 mt-1"
            >
              Your Account and Business Profile has been created successfully. 
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full max-w-xs bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6"
            >
              <p className="text-green-800 font-cal-sans dark:text-green-300 text-sm">You can now continue to your dashboard.</p>
            </motion.div>
            <Button
              className="bg-green-800 hover:bg-green-900 font-cal-sans px-8 py-3 text-lg"
              onClick={handleContinue}
              disabled={isLoading}
            >
              Continue to Dashboard
            </Button>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col font-cal-sans min-h-screen bg-white dark:bg-gray-900">
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: "100vw", height: "100vh" }}
      />

      <FloatingElements />

      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 px-4">
        <div className="max-w-md mx-auto">
          {!showWelcome && !showSuccess && (
            <ProgressDots currentStep={showReview ? questions.length : currentQuestion} totalSteps={questions.length} />
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center font-cal-sans justify-center p-4 md:p-8">
        {showWelcome ? (
          <WelcomeScreen onStart={() => setShowWelcome(false)} />
        ) : showSuccess ? (
          <SuccessScreen />
        ) : showReview ? (
          renderReviewScreen()
        ) : (
          renderCurrentQuestion()
        )}
      </main>
    </div>
  )
}
