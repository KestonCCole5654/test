"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Loader2, Shield } from "lucide-react"
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from "../../components/ui/loadingSpinner"

export default function LoginPage() {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMounted(true)
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          const from = (location.state as { from?: string })?.from || "/invoices"
          navigate(from)
        }
      } catch (err) {
        console.error("Session check error:", err)
      }
    }
    checkUser()
  }, [navigate, location])

  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      console.log('Starting Google OAuth flow...')

      // Configure OAuth with more permissive settings
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/google/callback`,
          scopes: [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
          ].join(" "),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            include_granted_scopes: 'true'
          },
          skipBrowserRedirect: true // Changed to true to handle redirect manually
        },
      })

      if (error) {
        console.error("OAuth error:", error)
        throw new Error(error.message || "Failed to initiate Google login")
      }

      if (!data?.url) {
        console.error("No OAuth URL returned")
        throw new Error("Failed to get authentication URL")
      }

      // Store the intended redirect path
      const redirectPath = location.state?.from || '/invoices'
      console.log('Storing redirect path:', redirectPath)

      // Try both storage methods
      try {
        sessionStorage.setItem('auth_redirect', redirectPath)
      } catch (e) {
        console.warn('sessionStorage not available, using localStorage')
        localStorage.setItem('auth_redirect', redirectPath)
      }

      // Redirect to the OAuth URL
      console.log('Redirecting to Google OAuth...')
      window.location.href = data.url
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
      setLoading(false)
    }
  }, [location, navigate])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen font-onest flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600 font-onest text-sm font-medium">
            {loading ? "Connecting to Google..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-onest flex flex-col bg-gradient-to-b from-white to-gray-50">
      <div className="flex items-center mb-4 p-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span></span>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-3 py-12">
        <div className="max-w-md w-full mx-auto ">
          <div className="flex flex-col text-center justify-center items-center gap-3 ">
            <div className="h-20 w-20 p-2 rounded-sm space-x-2 flex items-center justify-center">
              <img src="/sheetbills-logo.svg" alt="SheetBills Logo" className="h-20 w-auto" />
              <span className="text-2xl font-semibold text-green-800">SheetBills</span>
            </div>
          </div>
          
          <Card className="border-0 overflow-hidden">


            <CardContent className="p-8">

              <div className="flex flex-col mb-8">

                <p className="text-gray-600 font-normal text-center text-lg mb-5">
                  Transform Google Sheets into your invoice management system
                </p>
              </div>

              <div className="flex justify-center mb-10">
          <ul className="hidden font-sans font-normal  text-md md:block text-center text-[#5C5B61] leading-relaxed space-y-1 md:-mt-3">
          <li className="flex items-center justify-center lg:justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Ditch formulas & templates
            </li>
            <li className="flex  items-center justify-center lg:justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Centralized invoice management
            </li>
            <li className="flex items-center justify-center lg:justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[20px] h-[20px] text-green-800"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Smart syncing with Google Drive
            </li>
          
          </ul>
        </div>
        

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2 mb-6">
                  <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow transition-all duration-200 rounded-lg flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-normal">Continue with Google</span>
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500">
                  By signing in, you agree to our{" "}
                  <a href="/legal" className="text-green-800 hover:text-emerald-700">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="/legal" className="text-green-800 hover:text-emerald-700">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
