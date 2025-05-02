"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import supabase from "./supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, Zap, BarChart3, Users, Lock } from "lucide-react"
import Header from "@/components/header"

// Define types for better type safety
type Session = {
  access_token: string
  provider_token?: string | null
}

type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

type GoogleIconProps = {
  className?: string
}

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
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto" />
          {loading && <p className="mt-4 text-slate-600">Connecting to Google...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Brand and Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Professional Invoice Management
                  <span className="block text-green-700 mt-1">Powered by Google Sheets</span>
                </h1>

                <p className="text-slate-600 max-w-lg">
                  Streamline your invoicing process with enterprise-grade features while keeping your data secure in
                  your Google account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Zap className="h-5 w-5 text-green-600" />}
                  title="Lightning Fast"
                  description="Real-time synchronization with Google Sheets"
                />
                <FeatureCard
                  icon={<BarChart3 className="h-5 w-5 text-green-600" />}
                  title="Advanced Analytics"
                  description="Comprehensive dashboards to track payments"
                />
                <FeatureCard
                  icon={<Users className="h-5 w-5 text-green-600" />}
                  title="Team Collaboration"
                  description="Role-based access controls for your team"
                />
                <FeatureCard
                  icon={<Lock className="h-5 w-5 text-green-600" />}
                  title="Enterprise Security"
                  description="Bank-grade encryption and compliance"
                />
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-lg border-0 bg-white rounded-xl overflow-hidden">
                <CardHeader className="space-y-2 pb-6 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <CardTitle className="text-2xl font-bold text-center">Welcome to SheetBills</CardTitle>
                  <CardDescription className="text-green-50 text-center">
                    Sign in to access your invoicing dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-11 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md rounded-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <>
                        <GoogleIcon className="mr-2" />
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      By signing in, you agree to our{" "}
                      <Link to="#" className="text-green-700 hover:text-green-800 transition-colors font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="#" className="text-green-700 hover:text-green-800 transition-colors font-medium">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Lock className="h-3 w-3" />
                      <span>Secure Login</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">{icon}</div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  )
}

// Google Icon Component
function GoogleIcon({ className = "" }: GoogleIconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24">
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
  )
}
