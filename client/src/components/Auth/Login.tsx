"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import supabase from "./supabaseClient"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Loader2, Shield, CheckCircle2, LockKeyhole, Database, BarChart3 } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white"></div>
            </div>
          </div>
          <p className="text-slate-700 font-medium">{loading ? "Connecting to Google..." : "Loading..."}</p>
          <p className="text-slate-500 text-sm max-w-xs">
            This may take a few moments while we securely connect to your account
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-screen-xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-6 order-2 md:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Trusted by 1000+ businesses
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Invoice Management, <span className="text-green-600">Simplified</span>
              </h1>
              <p className="text-slate-600 text-lg max-w-md">
                Streamline your business finances with our secure, Google Sheets-powered invoicing platform.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid gap-4 mt-8">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Real-time Google Sheets Sync</h3>
                  <p className="text-slate-600 text-sm">
                    Keep your data in familiar spreadsheets that update instantly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <LockKeyhole className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Enterprise-grade Security</h3>
                  <p className="text-slate-600 text-sm">Your financial data is protected with bank-level encryption</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Advanced Analytics</h3>
                  <p className="text-slate-600 text-sm">
                    Gain insights into your business with powerful reporting tools
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login card */}
          <div className="order-1 md:order-2">
            <Card className="border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                  <p className="text-slate-600 text-sm">Sign in to access your invoicing dashboard</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

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

                {/* Testimonial */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">5.0</span>
                  </div>
                  <p className="text-sm text-slate-600 italic">
                    "This platform has transformed how we manage our invoices. The Google Sheets integration is
                    brilliant!"
                  </p>
                  <p className="text-xs text-slate-500 mt-2">— Sarah T., Small Business Owner</p>
                </div>

                <div className="text-center">
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

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5" />
                <span>Secure Login</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg
                  className="h-3.5 w-3.5"
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

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg
                  className="h-3.5 w-3.5"
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

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg
                  className="h-3.5 w-3.5"
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
