"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useToast } from "../../components/ui/use-toast"
import { Toaster } from "../../components/ui/toaster"
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

export default function InitializePage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4 // Including review step

  // Auth tokens state
  const [supabaseToken, setSupabaseToken] = useState("")
  const [googleAccessToken, setGoogleAccessToken] = useState("")

  // Business details state
  const [businessData, setBusinessData] = useState({
    companyName: "",
    phone: "",
    address: "",
    email: "",
  })

  // Form validation
  const [errors, setErrors] = useState({
    companyName: "",
    email: "",
  })

  useEffect(() => {
    // Get the auth session from storage
    const sessionString = localStorage.getItem("sb-auth-token") || sessionStorage.getItem("sb-auth-token");
    
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        
        // Extract Supabase JWT (access_token) and Google token (provider_token)
        setSupabaseToken(session.access_token);
        setGoogleAccessToken(session.provider_token);
  
      } catch (error) {
        console.error("Error parsing auth session:", error);
        setError("Invalid authentication data. Please sign in again.");
      }
    } else {
      setError("Authentication required. Please sign in.");
    }
  }, []);
  

  const validateStep = (step: number) => {
    let isValid = true
    const newErrors = {
      companyName: "",
      email: "",
    }

    if (step === 1) {
      if (!businessData.companyName.trim()) {
        newErrors.companyName = "Company name is required"
        isValid = false
      }

      if (!businessData.email.trim()) {
        newErrors.email = "Business email is required"
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(businessData.email)) {
        newErrors.email = "Please enter a valid email address"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }
  
  // Handle form submission - updated to match the backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for required tokens
    if (!supabaseToken || !googleAccessToken) {
      setError("Authentication required. Please sign in and connect your Google account.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Call the API with all required data
      const response = await fetch('https://sheetbills-server.vercel.app/api/create-business-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Supabase-Token': supabaseToken
        },
        body: JSON.stringify({
          accessToken: googleAccessToken,
          businessData: businessData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up your business')
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

      // Redirect to dashboard after successful setup
      setTimeout(() => (window.location.href = "/invoices"), 1500)
    } catch (err) {
      console.error("Setup error:", err)
      setError((err instanceof Error ? err.message : "An unknown error occurred") || "Failed to save your business details. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium
                  ${
                    currentStep === step
                      ? "bg-green-600 text-white"
                      : currentStep > step
                        ? "bg-green-100 text-green-600 border border-green-600"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}
              >
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-10 h-1 ${currentStep > step ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center mb-4">Company Information</h3>
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={businessData.companyName}
                onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                placeholder="Your business name"
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Business Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={businessData.email}
                onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                placeholder="contact@yourbusiness.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center mb-4">Contact Information</h3>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={businessData.phone}
                onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                placeholder="Your business phone number"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center mb-4">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={businessData.address}
                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                placeholder="123 Business St, Suite 100, City, State, ZIP"
              />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center mb-4">Review Your Information</h3>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name:</p>
                <p className="text-sm">{businessData.companyName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Email:</p>
                <p className="text-sm">{businessData.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number:</p>
                <p className="text-sm">{businessData.phone || "Not provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address:</p>
                <p className="text-sm">{businessData.address || "Not provided"}</p>
              </div>
            </div>
            
            {/* Authentication status */}
            <div className="mt-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">Authentication Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supabase Auth:</p>
                <p className={`text-sm ${supabaseToken ? "text-green-600" : "text-red-500"}`}>
                  {supabaseToken ? "✓ Connected" : "✗ Not Connected"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Google Account:</p>
                <p className={`text-sm ${googleAccessToken ? "text-green-600" : "text-red-500"}`}>
                  {googleAccessToken ? "✓ Connected" : "✗ Not Connected"}
                </p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderNavigation = () => {
    // Disable the Submit button if authentication tokens are missing
    const isAuthComplete = supabaseToken && googleAccessToken
    const disableSubmit = isSubmitting || !isAuthComplete

    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        ) : (
          <div></div> // Empty div to maintain layout
        )}

        {currentStep < totalSteps ? (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700" 
            disabled={disableSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your business sheet...
              </>
            ) : !isAuthComplete ? (
              "Authentication Required"
            ) : (
              "Complete Setup"
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid min-h-screen place-items-center bg-white dark:bg-gray-900">
      <Toaster />

      <div className="w-full max-w-md px-8 py-12">
        
        <div className="space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Welcome to SHEETBILLS</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Let's set up your business details. This information will appear on your invoices and other documents.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}
            {renderNavigation()}
          </form>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
            Already set up your account?{" "}
            <a href="/dashboard" className="font-medium text-green-600 dark:text-green-500 hover:underline">
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}