"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Loader2, Shield } from "lucide-react"
import supabase from "./supabaseClient"


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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const from = (location.state as { from?: string })?.from || "/invoices"
        navigate(from)
      }
    }
    checkUser()
  }, [navigate])

  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
          scopes: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen font-cal-sans flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 font-cal-sans animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-cal-sans text-sm font-medium">
            {loading ? "Connecting to Google..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-cal-sans flex flex-col bg-gradient-to-b from-white to-gray-50">
      
       <div className="flex items-center mb-6 p-10">
          <a href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-green-800 flex items-center justify-center">
              <span className="text-white font-medium text-md">SB</span>
            </div>
            <span className="text-lg font-medium text-green-800">SheetBills™</span>
          </a>
        </div>

 

   
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-emerald-600 h-1.5 w-full"></div>
            <CardContent className="p-8">
              <h1 className="text-2xl font-cal-sans text-gray-900 mb-2 text-center">Welcome to <span className=" font-cal-sans font-medium text-green-800">SheetBills™</span></h1>
              <p className="text-gray-600 font-cal-sans text-center text-sm mb-6">
                Your professional invoicing platform with seamless Google Sheets integration
              </p>

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
                <span className="font-medium font-cal-sans">Continue with Google</span>
              </Button>

            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 font-cal-sans">
              By signing in, you agree to our{" "}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium font-cal-sans ">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium font-cal-sans">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
