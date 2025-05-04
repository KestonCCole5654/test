"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function BusinessSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Get session data from location state
  const { session } = location.state || {}
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    addressLine1: "",
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
    
    if (!formData.companyName || !formData.email || !formData.phone || !formData.addressLine1) {
      setError("Please fill in all required fields")
      return
    }
    
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      // Call the API to create business sheet
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
        console.error("Business sheet creation failed:", errorData)
        throw new Error(errorData.error || "Business sheet creation failed")
      }
      
      const { businessSheetId, spreadsheetUrl } = await response.json()
      
      setSuccess("Business details saved successfully! Redirecting...")
      
      setTimeout(() => {
        navigate("/invoices", {
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
      console.error("Setup error:", error)
      setError(error.message || "An error occurred while saving business details")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Logo and Heading */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">SB</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Complete Your Business Setup</h1>
            <p className="text-gray-600 mt-2 text-center">
              We need some details about your business for invoicing purposes. 
              This information will be saved to your Google Sheets account.
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="123 Business St, Suite 100, City, State, ZIP"
                  required
                />
              </div>
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
                  <svg className="animate-spin h-5 w-5 mr-2 text-green-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Redirecting...</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Business Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}