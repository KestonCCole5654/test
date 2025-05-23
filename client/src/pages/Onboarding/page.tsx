
        
        
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

const API_URL = "https://sheetbills-server.vercel.app/api"

interface BusinessData {
  companyName: string
  email: string
  phone: string
  address: string
  businessWebsite?: string
  businessLogo?: string
  businessDescription?: string
  businessType?: string
  businessIndustry?: string
  businessSize?: string
  businessFounded?: string
  businessTaxId?: string
  businessRegistrationNumber?: string
  businessBankAccount?: string
  businessPaymentTerms?: string
  businessCurrency?: string
  businessTimezone?: string
  businessLanguage?: string
  businessSocialMedia?: string
  businessReferences?: string
  businessNotes?: string
}

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
  const [error, setError] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)

  // Auth tokens state
  const [supabaseToken, setSupabaseToken] = useState("")
  const [googleAccessToken, setGoogleAccessToken] = useState("")

  // Business details state - SIMPLIFIED
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    email: "",
    phone: "",
    address: ""
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
      validate: (value: string) => value.trim().length > 0,
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return value.trim().length > 0 && emailRegex.test(value)
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
      validate: () => true, // Always valid since optional
    },
    {
      id: "address",
      question: "What's your business address?",
      description: "Optional: This will appear on your invoices and documents.",
      field: "address",
      required: false,
      icon: <MapPin className="h-5 w-5" />,
      placeholder: "e.g. 123 Business St, City, State, ZIP",
      validate: () => true, // Always valid since optional
    },
  ]

  // Focus input when current question changes
  useEffect(() => {
    if (!showWelcome && !showReview && !showSuccess) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentQuestion, showWelcome, showReview, showSuccess])

  // Get auth tokens on mount
  useEffect(() => {
    const sessionString = localStorage.getItem("sb-auth-token") || sessionStorage.getItem("sb-auth-token")

    if (sessionString) {
      try {
        const session = JSON.parse(sessionString)
        setSupabaseToken(session.access_token)
        
        if (session.provider_token) {
          setGoogleAccessToken(session.provider_token)
          localStorage.setItem('google_access_token', session.provider_token)
          sessionStorage.setItem('google_access_token', session.provider_token)
        } else {
          const storedGoogleToken = localStorage.getItem('google_access_token') || sessionStorage.getItem('google_access_token')
          if (storedGoogleToken) {
            setGoogleAccessToken(storedGoogleToken)
          } else {
            setError("Google authentication required. Please sign in again.")
          }
        }
      } catch (error) {
        console.error("Error parsing auth session:", error)
        setError("Invalid authentication data. Please sign in again.")
      }
    } else {
      setError("Authentication required. Please sign in.")
    }
  }, [])

  const session = useSession()
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null)

  // Check onboarding status on mount
  useEffect(() => {
    async function checkOnboarding() {
      if (!googleAccessToken) return
      try {
        const response = await fetch("https://sheetbills-server.vercel.app/api/check-master-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: googleAccessToken }),
        })
        const data = await response.json()
        setIsOnboarded(data.onboarded)
        if (data.onboarded) {
          navigate('/invoices')
        }
      } catch (err) {
        console.error("Failed to check onboarding status", err)
      }
    }
    checkOnboarding()
  }, [googleAccessToken, navigate])

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

  // SIMPLIFIED input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const currentQ = questions[currentQuestion]
    const field = currentQ.field as keyof typeof businessData
    
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear any previous errors
    if (error) {
      setError("")
    }
  }

  // SIMPLIFIED validation check
  const isCurrentQuestionValid = () => {
    const currentQ = questions[currentQuestion]
    const field = currentQ.field as keyof typeof businessData
    const value = businessData[field] || ""
    return currentQ.validate(value)
  }

  const handleNext = () => {
    const currentQ = questions[currentQuestion]
    const field = currentQ.field as keyof typeof businessData
    const value = businessData[field] || ""
    
    // Only validate required fields
    if (currentQ.required && !currentQ.validate(value)) {
      if (currentQ.id === "email") {
        setError("Please enter a valid email address")
      } else {
        setError(`${currentQ.question.replace("What's your ", "").replace("?", "")} is required`)
      }
      return
    }
    
    setError("") // Clear errors
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowReview(true)
    }
  }

  const handlePrevious = () => {
    setError("") // Clear errors
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
      e.preventDefault()
      handleNext()
    }
  }

  const updateOnboardingStatus = async (status: string) => {
    try {
      const response = await fetch(`${API_URL}/update-onboarding-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${googleAccessToken}`,
          "X-Supabase-Token": supabaseToken
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error("Failed to update onboarding status")
      }
    } catch (error) {
      console.error("Error updating onboarding status:", error)
    }
  }

  const createBusinessSheet = async () => {
    try {
      setIsSubmitting(true)
      setError("")

      const currentGoogleToken = googleAccessToken || localStorage.getItem('google_access_token') || sessionStorage.getItem('google_access_token')
      
      if (!currentGoogleToken) {
        throw new Error("Google authentication token not found")
      }

      const sessionString = localStorage.getItem("sb-auth-token") || sessionStorage.getItem("sb-auth-token")
      if (!sessionString) {
        throw new Error("Supabase authentication token not found")
      }

      const session = JSON.parse(sessionString)
      const currentSupabaseToken = session.access_token

      if (!currentSupabaseToken) {
        throw new Error("Invalid Supabase session")
      }

      const response = await fetch(`${API_URL}/create-business-sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentGoogleToken}`,
          "X-Supabase-Token": currentSupabaseToken
        },
        body: JSON.stringify({
          businessData: {
            businessName: businessData.companyName,
            businessEmail: businessData.email,
            businessPhone: businessData.phone,
            businessAddress: businessData.address,
            businessWebsite: businessData.businessWebsite,
            businessLogo: businessData.businessLogo,
            businessDescription: businessData.businessDescription,
            businessType: businessData.businessType,
            businessIndustry: businessData.businessIndustry,
            businessSize: businessData.businessSize,
            businessFounded: businessData.businessFounded,
            businessTaxId: businessData.businessTaxId,
            businessRegistrationNumber: businessData.businessRegistrationNumber,
            businessBankAccount: businessData.businessBankAccount,
            businessPaymentTerms: businessData.businessPaymentTerms,
            businessCurrency: businessData.businessCurrency,
            businessTimezone: businessData.businessTimezone,
            businessLanguage: businessData.businessLanguage,
            businessSocialMedia: businessData.businessSocialMedia,
            businessReferences: businessData.businessReferences,
            businessNotes: businessData.businessNotes
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create business sheet")
      }

      const data = await response.json()
      sessionStorage.setItem("spreadsheetId", data.businessSheetId)
      
      await updateOnboardingStatus("completed")
      setShowSuccess(true)
      
    } catch (error: unknown) {
      console.error("Error creating business sheet:", error)
      setError(error instanceof Error ? error.message : "Failed to create business sheet")
    } finally {
      setIsSubmitting(false)
    }
  }

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
    const value = businessData[field] || ""
    const isValid = isCurrentQuestionValid()
    
    // Simplified border logic
    const getBorderClass = () => {
      if (error) return "border-red-500 dark:border-red-600"
      if (value && isValid) return "border-green-500 dark:border-green-600"
      return "border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-600"
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
          className="mb-4"
        >
          <div className="relative">
            <Input
              ref={inputRef}
              type={currentQ.id === "email" ? "email" : "text"}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={currentQ.placeholder}
              className={`w-full p-4 text-base font-cal-sans border ${getBorderClass()} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200`}
            />

            {value && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 mt-2 font-cal-sans"
            >
              {error}
            </motion.p>
          )}

          <p className="text-sm text-gray-500 font-cal-sans mt-2">
            {currentQ.required ? "* Required field" : "Optional"}
          </p>
        </motion.div>

        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button 
              variant="outline" 
              className="flex-1 font-cal-sans" 
              onClick={handlePrevious}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {!currentQ.required && (
            <Button
              variant="ghost"
              className="flex-1 font-cal-sans text-gray-500"
              onClick={handleSkip}
              type="button"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          )}

          <Button
            className="flex-1 bg-green-600 font-cal-sans hover:bg-green-700"
            onClick={handleNext}
            type="button"
          >
            {currentQuestion === questions.length - 1 ? "Review" : "Next"}
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
              icon: <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
              label: "Company Name",
              color: "green",
            },
            {
              id: "email",
              icon: <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
              label: "Business Email",
              color: "blue",
            },
            {
              id: "phone",
              icon: <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
              label: "Phone Number",
              color: "purple",
            },
            {
              id: "address",
              icon: <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
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
                <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded-full">
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
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4"
          >
            <p className="text-red-800 dark:text-red-300 text-sm font-cal-sans">
              {error}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            className="flex-1 font-cal-sans"
            onClick={handlePrevious}
            disabled={isSubmitting}
            type="button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 font-cal-sans"
            onClick={createBusinessSheet}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
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
    const [isLoading, setIsLoading] = useState(false)
    const [successError, setSuccessError] = useState("")

    const handleContinue = async () => {
      setIsLoading(true)
      setSuccessError("")
      
      try {
        localStorage.setItem('just_onboarded', 'true')
        navigate('/invoices')
      } catch (error) {
        setSuccessError(error instanceof Error ? error.message : 'An unexpected error occurred')
        setIsLoading(false)
      }
    }

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
            {successError && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4"
              >
                <p className="text-red-800 font-cal-sans dark:text-red-300 text-sm">
                  {successError}
                </p>
              </motion.div>
            )}
          </motion.div>
        )
        : (
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
