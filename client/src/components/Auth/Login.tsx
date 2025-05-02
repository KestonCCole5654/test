"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import supabase from "./supabaseClient"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Loader2, Shield, CheckCircle2 } from "lucide-react"
import Header from "../../components/header"
import type { Session } from "@supabase/supabase-js"

export default function Login() {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (event === "SIGNED_IN" && session) {
        try {
          sessionStorage.setItem("supabase_token", session.access_token)
          if (session.provider_token) {
            sessionStorage.setItem("google_access_token", session.provider_token)
          }
          await checkBusinessSheet(session)
        } catch (err) {
          console.error("Error storing session:", err)
          setError("Failed to store session data")
        }
      } else if (event === "SIGNED_OUT") {
        sessionStorage.clear()
        localStorage.clear()
      }
    })
    return () => authListener?.subscription.unsubscribe()
  }, [navigate])

  const checkBusinessSheet = useCallback(
    async (session: Session) => {
      try {
        setLoading(true)

        const response = await fetch("https://sheetbills-server.vercel.app/api/check-business-sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-supabase-token": session.access_token,
          },
          body: JSON.stringify({
            accessToken: session.provider_token,
            createIfMissing: false,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Business sheet check failed")
        }

        const { hasBusinessSheet } = await response.json()
        window.location.href = hasBusinessSheet ? "/invoices" : "/businessSetup"
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Check failed")
        await supabase.auth.signOut()
      } finally {
        setLoading(false)
      }
    },
    [navigate],
  )

  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"].join(" "),
          redirectTo: window.location.origin,
          queryParams: {
            access_type: "offline",
            include_granted_scopes: "true",
          },
          skipBrowserRedirect: false,
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error("Google login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
      await supabase.auth.signOut()
      sessionStorage.clear()
      localStorage.clear()
    }
  }, [])

  // Check for existing session
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session check error:", error)
          return
        }

        if (session) {
          try {
            sessionStorage.setItem("supabase_token", session.access_token)
            if (session.provider_token) {
              sessionStorage.setItem("google_access_token", session.provider_token)
            }
            await checkBusinessSheet(session as Session)
          } catch (err) {
            console.error("Error storing session:", err)
            setError("Failed to store session data")
          }
        }
      } catch (err) {
        console.error("Session check failed:", err)
        setError("Failed to check session")
      }
    }
    checkExistingSession()
  }, [checkBusinessSheet])

  // Loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-slate-600 text-sm font-medium">
            {loading ? "Connecting to Google..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-screen-lg mx-auto">
          <div className="flex flex-col items-center">
            {/* Centered content with login card as focus */}
            <div className="text-center mb-8 max-w-xl">
              <div className="bg-green-600 py-6 px-8">
                <h2 className="text-white text-2xl font-bold text-center">Welcome to SheetBills</h2>
              </div>
              <p className="text-slate-600 text-center mb-6">Sign in to access your invoicing dashboard</p>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Invoice Management, <span className="text-green-600">Simplified</span>
              </h1>
              <p className="text-slate-600 text-lg">
                Streamline your business finances with our secure, Google Sheets-powered invoicing platform.
              </p>
            </div>

            {/* Login Card - Main Focus */}
            <Card className="border-0 overflow-hidden w-full max-w-md">
            

              <CardContent className="p-8">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2 mb-6">
                    <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                

                {/* Feature highlights inside the card */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Real-time sync with Google Sheets</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Advanced analytics dashboard</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm hover:shadow transition-all duration-200 rounded-lg flex items-center justify-center gap-3"
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
                  <span className="font-medium">Continue with Google</span>
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500">
                    By signing in, you agree to our{" "}
                    <Link to="#" className="text-green-600 hover:text-green-700 font-medium">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="text-green-600 hover:text-green-700 font-medium">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust indicators below the card */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Shield className="h-3 w-3" />
                <span>Secure Login</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <svg
                  className="h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
                <span>Cloud Powered</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <svg
                  className="h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>GDPR Compliant</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <svg
                  className="h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Team Collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
