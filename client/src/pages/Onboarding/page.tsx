"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useToast } from "../../components/ui/use-toast"
import { Toaster } from "../../components/ui/toaster"
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
import Header from "../../components/Header/header"

// Custom SVG Illustrations
const CompanyIllustration = () => (
  <motion.svg
    width="200"
    height="160"
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <motion.rect
      initial={{ height: 0 }}
      animate={{ height: 120 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      x="40"
      y="40"
      width="50"
      height="120"
      rx="2"
      fill="#E2F0FF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ height: 0 }}
      animate={{ height: 140 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      x="100"
      y="20"
      width="60"
      height="140"
      rx="2"
      fill="#E5F5EC"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.7 }}
      d="M100 20H160V80H100V20Z"
      fill="#D1EBE1"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      x="110"
      y="30"
      width="15"
      height="15"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      x="135"
      y="30"
      width="15"
      height="15"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      x="110"
      y="55"
      width="15"
      height="15"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      x="135"
      y="55"
      width="15"
      height="15"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      x="50"
      y="60"
      width="12"
      height="12"
      rx="2"
      fill="#FFFFFF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      x="68"
      y="60"
      width="12"
      height="12"
      rx="2"
      fill="#FFFFFF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      x="50"
      y="80"
      width="12"
      height="12"
      rx="2"
      fill="#FFFFFF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      x="68"
      y="80"
      width="12"
      height="12"
      rx="2"
      fill="#FFFFFF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      x="50"
      y="100"
      width="12"
      height="12"
      rx="2"
      fill="#FFFFFF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.3 }}
      x="68"
      y="100"
      width="12"
      height="12"
      rx="2"
      fill="#FFFFFF"
      stroke="#94C2FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.4 }}
      x="110"
      y="90"
      width="40"
      height="10"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      x="110"
      y="110"
      width="40"
      height="10"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.6 }}
      x="110"
      y="130"
      width="40"
      height="10"
      rx="2"
      fill="#FFFFFF"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ y: 160 }}
      animate={{ y: 150 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      x="30"
      y="150"
      width="140"
      height="10"
      rx="2"
      fill="#D1D5DB"
    />
  </motion.svg>
)

const EmailIllustration = () => (
  <motion.svg
    width="200"
    height="160"
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <motion.rect
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      x="40"
      y="40"
      width="120"
      height="80"
      rx="4"
      fill="#E5EDFF"
      stroke="#94A3FF"
      strokeWidth="2"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      d="M40 40L100 80L160 40"
      stroke="#94A3FF"
      strokeWidth="2"
      fill="none"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.7 }}
      d="M40 120L80 90"
      stroke="#94A3FF"
      strokeWidth="2"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.7 }}
      d="M160 120L120 90"
      stroke="#94A3FF"
      strokeWidth="2"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      cx="100"
      cy="80"
      r="5"
      fill="#94A3FF"
    />
    <motion.path
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      d="M85 65H115M85 72H105"
      stroke="#94A3FF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </motion.svg>
)

const PhoneIllustration = () => (
  <motion.svg
    width="200"
    height="160"
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <motion.rect
      initial={{ y: 100, height: 0 }}
      animate={{ y: 30, height: 100 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      x="70"
      y="30"
      width="60"
      height="100"
      rx="10"
      fill="#F0E6FF"
      stroke="#C4A7FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      x="75"
      y="40"
      width="50"
      height="70"
      rx="4"
      fill="#E2D8F5"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      cx="100"
      cy="120"
      r="8"
      fill="#FFFFFF"
      stroke="#C4A7FF"
      strokeWidth="2"
    />
    <motion.rect
      initial={{ width: 0 }}
      animate={{ width: 20 }}
      transition={{ duration: 0.5, delay: 1 }}
      x="90"
      y="35"
      width="20"
      height="3"
      rx="1.5"
      fill="#C4A7FF"
    />
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.2 }}>
      <motion.rect x="85" y="50" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="95" y="50" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="105" y="50" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="85" y="60" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="95" y="60" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="105" y="60" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="85" y="70" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="95" y="70" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="105" y="70" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="85" y="80" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="95" y="80" width="10" height="10" rx="2" fill="#FFFFFF" />
      <motion.rect x="105" y="80" width="10" height="10" rx="2" fill="#FFFFFF" />
    </motion.g>
  </motion.svg>
)

const AddressIllustration = () => (
  <motion.svg
    width="200"
    height="160"
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <motion.rect
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      x="40"
      y="40"
      width="120"
      height="80"
      rx="4"
      fill="#FFF2E6"
      stroke="#FFCCA7"
      strokeWidth="2"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      cx="100"
      cy="65"
      r="15"
      fill="#FFECDB"
      stroke="#FFCCA7"
      strokeWidth="2"
    />
    <motion.path
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      d="M100 55L100 75M90 65L110 65"
      stroke="#FFCCA7"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.9 }}
      d="M100 80L100 100"
      stroke="#FFCCA7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="2 2"
    />
    <motion.rect
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      x="85"
      y="100"
      width="30"
      height="10"
      rx="2"
      fill="#FFECDB"
      stroke="#FFCCA7"
      strokeWidth="2"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1.3 }}
      d="M60 60H70M60 70H75M60 80H65"
      stroke="#FFCCA7"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1.3 }}
      d="M130 60H140M125 70H140M135 80H140"
      stroke="#FFCCA7"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </motion.svg>
)

const SuccessIllustration = () => (
  <motion.svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      cx="100"
      cy="100"
      r="60"
      fill="#E5F5EC"
      stroke="#A7E3C0"
      strokeWidth="2"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      d="M75 100L90 115L125 80"
      stroke="#22C55E"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.circle
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: [0, 0.2, 0] }}
      transition={{ duration: 1, delay: 0.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
      cx="100"
      cy="100"
      r="70"
      stroke="#22C55E"
      strokeWidth="2"
    />
    <motion.circle
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: [0, 0.2, 0] }}
      transition={{ duration: 1, delay: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
      cx="100"
      cy="100"
      r="80"
      stroke="#22C55E"
      strokeWidth="2"
    />
  </motion.svg>
)

export default function OnboardingPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const [inputValid, setInputValid] = useState<boolean | null>(null)

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
  const [progress, setProgress] = useState(0)
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
      icon: <Building2 className="h-6 w-6" />,
      illustration: <CompanyIllustration />,
      placeholder: "e.g. Acme Inc.",
      validate: (value: string) => (value.trim() ? "" : "Company name is required"),
    },
    {
      id: "email",
      question: "What's your business email?",
      description: "We'll use this for communications related to your account.",
      field: "email",
      required: true,
      icon: <Mail className="h-6 w-6" />,
      illustration: <EmailIllustration />,
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
      icon: <Phone className="h-6 w-6" />,
      illustration: <PhoneIllustration />,
      placeholder: "e.g. (555) 123-4567",
      validate: () => "",
    },
    {
      id: "address",
      question: "What's your business address?",
      description: "Optional: This will appear on your invoices and documents.",
      field: "address",
      required: false,
      icon: <MapPin className="h-6 w-6" />,
      illustration: <AddressIllustration />,
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

  // Update progress bar
  useEffect(() => {
    const totalSteps = questions.length
    const currentProgress = ((currentQuestion + 1) / totalSteps) * 100

    // Animate progress
    const timer = setTimeout(() => {
      setProgress(currentProgress)
    }, 300)

    return () => clearTimeout(timer)
  }, [currentQuestion, questions.length])

  // Get auth tokens on mount
  useEffect(() => {
    // Get the auth session from storage
    const sessionString = localStorage.getItem("sb-auth-token") || sessionStorage.getItem("sb-auth-token")

    if (sessionString) {
      try {
        const session = JSON.parse(sessionString)

        // Extract Supabase JWT (access_token) and Google token (provider_token)
        setSupabaseToken(session.access_token)
        setGoogleAccessToken(session.provider_token)
      } catch (error) {
        console.error("Error parsing auth session:", error)
        setError("Invalid authentication data. Please sign in again.")
      }
    } else {
      setError("Authentication required. Please sign in.")
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
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      })
      setInputValid(false)
      return
    }

    // Move to next question or review
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowReview(true)
      setProgress(100)
    }
  }

  const handlePrevious = () => {
    if (showReview) {
      setShowReview(false)
      setProgress((questions.length / questions.length) * 100)
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowReview(true)
      setProgress(100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    // Check for required tokens AFTER user clicks submit
    if (!supabaseToken || !googleAccessToken) {
      toast({
        title: "Authentication Required",
        description: "Please sign in and connect your Google account to continue.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Call the API with all required data
      const response = await fetch("https://sheetbills-server.vercel.app/api/create-business-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Supabase-Token": supabaseToken,
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

      // Handle successful response
      toast({
        title: "Setup Complete",
        description: "Your business sheet has been created successfully.",
      })

      // Store the spreadsheet ID and URL for future use
      if (data.businessSheetId) {
        localStorage.setItem("business_sheet_id", data.businessSheetId)
      }

      if (data.spreadsheetUrl) {
        localStorage.setItem("business_sheet_url", data.spreadsheetUrl)
      }

      // Trigger confetti
      triggerConfetti()

      // Show success state
      setShowSuccess(true)

      // Redirect to dashboard after successful setup
      setTimeout(() => (window.location.href = "/invoices"), 3000)
    } catch (err) {
      console.error("Setup error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      toast({
        title: "Error",
        description: errorMessage || "Failed to save your business details. Please try again.",
        variant: "destructive",
      })
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
    const value = businessData[field]

    // Determine input border color based on validation state
    let inputBorderClass = "border-2 border-gray-200 dark:border-gray-700"
    if (inputValid === true) {
      inputBorderClass = "border-2 border-green-500 dark:border-green-600"
    } else if (inputValid === false) {
      inputBorderClass = "border-2 border-red-500 dark:border-red-600"
    } else if (inputFocused) {
      inputBorderClass = "border-2 border-blue-500 dark:border-blue-600"
    }

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 flex justify-center">{currentQ.illustration}</div>

        <div className="mb-8">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-center mb-2"
          >
            {currentQ.question}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 text-center"
          >
            {currentQ.description}
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 relative"
        >
          <div className="relative group">
            <Input
              ref={inputRef}
              type={currentQ.id === "email" ? "email" : "text"}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={currentQ.placeholder}
              className={`w-full p-6 text-lg ${inputBorderClass} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 ease-in-out`}
            />

            {/* Subtle glow effect on focus */}
            {inputFocused && (
              <div className="absolute inset-0 -z-10 rounded-md bg-blue-500/20 dark:bg-blue-500/10 blur-sm transition-all duration-300 ease-in-out"></div>
            )}

            {/* Validation icons */}
            {inputValid !== null && value.trim() !== "" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {inputValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {currentQ.required ? (
            <p className="text-sm text-gray-500 mt-2">* Required field</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Optional field</p>
          )}
        </motion.div>

        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button variant="outline" className="flex-1" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {!currentQ.required && (
            <Button
              variant="ghost"
              className="flex-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={handleSkip}
            >
              Skip
              <SkipForward className="h-4 w-4 ml-2" />
            </Button>
          )}

          <Button
            className={`flex-1 ${
              currentQuestion === 0 && !value
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            } transition-all duration-300`}
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
          <h2 className="text-2xl font-bold mb-2">Review Your Information</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please review your business details before completing setup.
          </p>
        </motion.div>

        <div className="space-y-6 mb-8">
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
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`bg-${item.color}-100 dark:bg-${item.color}-900/30 p-2 rounded-full`}>{item.icon}</div>
                <div>
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-gray-700 dark:text-gray-300">
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
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium">Authentication Status</h3>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                {supabaseToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Supabase Auth: {supabaseToken ? "Connected" : "Not Connected"}</span>
              </div>
              <div className="flex items-center gap-2">
                {googleAccessToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Google Account: {googleAccessToken ? "Connected" : "Not Connected"}</span>
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
            className="flex-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            onClick={handlePrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Processing..." : "Complete Setup"}
          </Button>
        </motion.div>
      </div>
    )
  }

  // Render the success screen
  const renderSuccessScreen = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        <div className="mb-6">
          <SuccessIllustration />
        </div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl font-bold mb-2"
        >
          Setup Complete!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          Your business profile has been created successfully.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-xs bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
        >
          <p className="text-green-800 dark:text-green-300 text-sm">Redirecting you to invoices in a moment...</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <Toaster />
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: "100vw", height: "100vh" }}
      />

      <FloatingElements />

      <Header hideNav={true} />
      {/* Progress Bar Section */}
      <div className="w-full bg-white mt-10 p-4 flex flex-col items-center z-10">
        <h2 className="text-2xl font-bold mb-2">User Onboarding: Getting Started With SheetBills</h2>
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-1 text-sm text-gray-600">
            <span>Step {showReview ? questions.length : currentQuestion + 1} of {questions.length}</span>
            <span>
              {showReview
                ? "Review"
                : questions[currentQuestion]?.question || ""}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${showReview ? 100 : ((currentQuestion + 1) / questions.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        {showSuccess ? renderSuccessScreen() : showReview ? renderReviewScreen() : renderCurrentQuestion()}
      </main>
    </div>
  )
}
