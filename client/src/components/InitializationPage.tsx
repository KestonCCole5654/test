"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Building2, Mail, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react"

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
    address: "",
  })

  useEffect(() => {
    if (!session?.provider_token) {
      navigate("/login", { replace: true })
    }
  }, [session, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyName || !formData.email || !formData.phone || !formData.address) {
      setError("Please fill in all required fields")
      return
    }
    
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      // Call the API to create business sheet and update master
      const response = await fetch("https://sheetbills-server.vercel.app/api/check-business-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-token": session?.access_token || ""
        },
        body: JSON.stringify({
          accessToken: session?.provider_token,
          createIfMissing: true,
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

  const steps = [
    {
      icon: <Building2 className="h-8 w-8 text-emerald-600" />,
      question: "What should we call your business?",
      description: "This will be used for your invoices and business identity.",
      field: "companyName",
      placeholder: "e.g., Acme Corporation"
    },
    {
      icon: <Mail className="h-8 w-8 text-emerald-600" />,
      question: "What's your business email?",
      description: "We'll use this for important notifications and communications.",
      field: "email",
      placeholder: "hello@yourbusiness.com"
    },
    {
      icon: <Phone className="h-8 w-8 text-emerald-600" />,
      question: "What's your business phone number?",
      description: "This will be displayed on your invoices for customer contact.",
      field: "phone",
      placeholder: "+1 (555) 123-4567"
    },
    {
      icon: <MapPin className="h-8 w-8 text-emerald-600" />,
      question: "Where is your business located?",
      description: "This will be used for your business address on invoices.",
      field: "address",
      placeholder: "123 Business St, Suite 100, City, State, ZIP"
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Progress indicator */}
            <div className="flex justify-between items-center mb-8">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-emerald-600 text-white' : 
                    index === currentStep ? 'bg-emerald-100 text-emerald-600' : 
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-12 ${
                      index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current step content */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {steps[currentStep].question}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep].description}
              </p>

              <div className="mt-6">
                <input
                  type={steps[currentStep].field === "email" ? "email" : "text"}
                  name={steps[currentStep].field}
                  value={formData[steps[currentStep].field as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder={steps[currentStep].placeholder}
                  required
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-center text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-center text-green-700 bg-green-100 rounded-lg">
                  {success}
                  <div className="mt-2 flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2 text-green-600" />
                    <span>Redirecting...</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-2 rounded-lg ${
                    currentStep === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Back
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Complete Setup"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}