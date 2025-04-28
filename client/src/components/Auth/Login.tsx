"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import supabase from "./supabaseClient"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Loader2, Shield, Zap, BarChart3, Users, CheckCircle2, Mail, ArrowRight, Lock, Globe } from "lucide-react"

export default function Login() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle auth state changes with improved session management
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Store tokens with better error handling
        try {
          sessionStorage.setItem("supabase_token", session.access_token)
          if (session.provider_token) {
            sessionStorage.setItem("google_access_token", session.provider_token)
          }
          // Check for business sheet after successful login
          await checkBusinessSheet(session)
        } catch (err) {
          console.error("Error storing session:", err)
          setError("Failed to store session data")
        }
      } else if (event === "TOKEN_REFRESHED") {
        // Handle token refresh
        console.log("Token refreshed successfully")
      } else if (event === "SIGNED_OUT") {
        // Clear all storage on sign out
        sessionStorage.clear()
        localStorage.clear()
      }
    })
    return () => authListener?.subscription.unsubscribe()
  }, [navigate])

  const checkBusinessSheet = useCallback(
    async (session: any) => {
      try {
        setLoading(true)

        const response = await fetch("http://localhost:5000/api/check-business-sheet", {
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

        if (hasBusinessSheet) {
          navigate("/dashboard")
        } else {
          navigate("/business-setup", { state: { session } })
        }
      } catch (err) {
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
          redirectTo: window.location.origin + "/auth/callback",
          queryParams: {
            access_type: "offline",
            include_granted_scopes: "true",
          },
          skipBrowserRedirect: false,
        },
      })

      if (error) throw error
    } catch (err) {
      console.error("Google login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
      await supabase.auth.signOut()
      sessionStorage.clear()
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }, [])

  // Check for existing session with improved error handling
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
          // Store tokens with error handling
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
        }
      } catch (err) {
        console.error("Session check failed:", err)
        setError("Failed to check session")
      }
    }
    checkExistingSession()
  }, [checkBusinessSheet])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      

      <div className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Brand and Features */}
            <div className="space-y-10">
              <div className="space-y-6">
                

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Professional Invoice Management
                  <span className="block text-green-700 mt-2">Powered by Google Sheets</span>
                </h1>

                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                  Streamline your invoicing process with enterprise-grade features while keeping your data secure in
                  your Google account.
                </p>

               
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">Lightning Fast</h3>
                  </div>
                  <p className="text-slate-600">
                    Real-time synchronization with your Google Sheets for instant updates
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">Advanced Analytics</h3>
                  </div>
                  <p className="text-slate-600">Comprehensive dashboards to track payments and revenue streams</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">Team Collaboration</h3>
                  </div>
                  <p className="text-slate-600">Seamless collaboration with role-based access controls</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">Enterprise Security</h3>
                  </div>
                  <p className="text-slate-600">Bank-grade encryption and compliance with industry standards</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-xl p-8 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium italic leading-relaxed">
                      "SheetBills has transformed our invoicing process. The seamless Google Sheets integration and
                      professional templates have saved us countless hours while providing enterprise-level security."
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Sarah Johnson"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Sarah Johnson</p>
                        <p className="text-sm text-slate-500">CFO, TechStart Inc.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-xl border-0 bg-white rounded-xl overflow-hidden">
                <CardHeader className="space-y-4 pb-6 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <div className="space-y-2 text-center py-4">
                    <CardTitle className="text-2xl font-bold">Welcome to SheetBills</CardTitle>
                    <CardDescription className="text-emerald-50">
                      Sign in to access your professional invoicing dashboard
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full h-12 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
                          Continue with Google
                        </>
                      )}
                    </Button>

                
                  </div>

                  <div className="text-center space-y-4 pt-2">
                    <p className="text-sm text-slate-500 px-6">
                      By signing in, you agree to our{" "}
                      <a href="#" className="text- hover:text-emerald-700 transition-colors font-medium">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text- hover:text-emerald-700 transition-colors font-medium">
                        Privacy Policy
                      </a>
                    </p>

                
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Lock className="h-3 w-3" />
                      <span>Secure Login</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Globe className="h-3 w-3" />
                      <span>GDPR Compliant</span>
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
