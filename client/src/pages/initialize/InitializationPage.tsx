"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle, ArrowRight, Building2, Mail, Phone, MapPin } from "lucide-react"

export default function BusinessSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  
  // Get session data from location state
  const { session } = location.state || {}
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    addressLine1: "",
  })

  const steps = [
    {
      question: "What's your company name?",
      icon: <Building2 className="w-6 h-6 text-emerald-600" />,
      placeholder: "e.g., Acme Corp",
      field: "companyName"
    },
    {
      question: "What's your business email?",
      icon: <Mail className="w-6 h-6 text-emerald-600" />,
      placeholder: "e.g., hello@acmecorp.com",
      field: "email"
    },
    {
      question: "What's your business phone number?",
      icon: <Phone className="w-6 h-6 text-emerald-600" />,
      placeholder: "e.g., (555) 123-4567",
      field: "phone"
    },
    {
      question: "What's your business address?",
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      placeholder: "e.g., 123 Business St, Suite 100, City, State, ZIP",
      field: "addressLine1"
    }
  ]

  useEffect(() => {
    if (!session?.provider_token) {
      navigate("/login", { replace: true })
    }
  }, [session, navigate])

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [steps[currentStep].field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyName || !formData.email || !formData.phone || !formData.addressLine1) {
      setError("Please fill in all required fields")
      return
    }
    
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch("https://sheetbills-server.vercel.app/api/create-business-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-token": session?.access_token || ""
        },
        body: JSON.stringify({
          accessToken: session?.provider_token,
          businessData: formData
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save business details")
      }
      
      const { businessSheetId, spreadsheetUrl } = await response.json()
      
      setSuccess("Business details saved successfully! Redirecting...")
      
      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
          state: {
            sheetAccessReady: true,
            businessSheetId,
            spreadsheetUrl,
            businessSetupComplete: true,
          },
        })
      }, 1500)
      
    } catch (err) {
      const error = err as Error
      setError(error.message || "An error occurred while saving business details")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-8">
              {/* Progress indicator */}
              <div className="flex justify-center space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index <= currentStep ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Chat-style content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Question */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {steps[currentStep].icon}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {steps[currentStep].question}
                      </h2>
                      <p className="text-sm text-gray-500">
                        This will appear on your invoices and documents
                      </p>
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={formData[steps[currentStep].field as keyof typeof formData]}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={steps[currentStep].placeholder}
                      className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-end">
                    {currentStep < steps.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                      >
                        Next
                        <ArrowRight className="inline-block ml-2 h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            Complete Setup
                            <CheckCircle className="inline-block ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Error message */}
              {error && (
                <div className="p-3 text-sm text-center text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="p-3 text-sm text-center text-green-700 bg-green-100 rounded-lg">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}