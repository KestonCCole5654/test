"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Loader2, Shield, CheckCircle2 } from "lucide-react"
import { useToast } from "../../components/ui/use-toast"
import { Toaster } from "../../components/ui/toaster"
import { motion } from "framer-motion"
import Header from "../Header/header"

// Custom SVG Illustration
const InvoiceIllustration = () => (
  <motion.svg
    width="200"
    height="160"
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {/* Invoice Paper */}
    <motion.rect
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      x="40"
      y="20"
      width="120"
      height="120"
      rx="4"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2"
    />

    {/* Invoice Header */}
    <motion.rect
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      x="50"
      y="30"
      width="100"
      height="20"
      rx="2"
      fill="#F0F9FF"
    />

    {/* Invoice Logo */}
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      cx="60"
      cy="40"
      r="6"
      fill="#22C55E"
    />

    {/* Invoice Title */}
    <motion.rect
      initial={{ width: 0 }}
      animate={{ width: 40 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      x="75"
      y="36"
      width="40"
      height="8"
      rx="2"
      fill="#94A3B8"
    />

    {/* Invoice Number */}
    <motion.rect
      initial={{ width: 0 }}
      animate={{ width: 30 }}
      transition={{ duration: 0.3, delay: 0.7 }}
      x="120"
      y="36"
      width="30"
      height="8"
      rx="2"
      fill="#94A3B8"
    />

    {/* Line Items Header */}
    <motion.rect
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      x="50"
      y="60"
      width="100"
      height="6"
      rx="1"
      fill="#E2E8F0"
    />

    {/* Line Item 1 */}
    <motion.rect
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 50, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.9 }}
      x="50"
      y="75"
      width="70"
      height="6"
      rx="1"
      fill="#CBD5E1"
    />
    <motion.rect
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 130, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.9 }}
      x="130"
      y="75"
      width="20"
      height="6"
      rx="1"
      fill="#CBD5E1"
    />

    {/* Line Item 2 */}
    <motion.rect
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 50, opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.0 }}
      x="50"
      y="90"
      width="60"
      height="6"
      rx="1"
      fill="#CBD5E1"
    />
    <motion.rect
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 130, opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.0 }}
      x="130"
      y="90"
      width="20"
      height="6"
      rx="1"
      fill="#CBD5E1"
    />

    {/* Line Item 3 */}
    <motion.rect
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 50, opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.1 }}
      x="50"
      y="105"
      width="65"
      height="6"
      rx="1"
      fill="#CBD5E1"
    />
    <motion.rect
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 130, opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.1 }}
      x="130"
      y="105"
      width="20"
      height="6"
      rx="1"
      fill="#CBD5E1"
    />

    {/* Total Line */}
    <motion.rect
      initial={{ width: 0 }}
      animate={{ width: 100 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      x="50"
      y="120"
      width="100"
      height="1"
      fill="#94A3B8"
    />

    {/* Total Amount */}
    <motion.rect
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 1.3 }}
      x="110"
      y="125"
      width="40"
      height="8"
      rx="2"
      fill="#22C55E"
    />

    {/* Total Label */}
    <motion.rect
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 1.4 }}
      x="50"
      y="125"
      width="25"
      height="8"
      rx="2"
      fill="#64748B"
    />

    {/* Decorative Elements */}
    <motion.circle
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.5 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      cx="160"
      cy="40"
      r="15"
      fill="#F0FDF4"
      stroke="#22C55E"
      strokeWidth="1"
      strokeDasharray="2 2"
    />
    <motion.circle
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.5 }}
      transition={{ duration: 0.5, delay: 1.6 }}
      cx="30"
      cy="110"
      r="10"
      fill="#F0F9FF"
      stroke="#94A3B8"
      strokeWidth="1"
      strokeDasharray="2 2"
    />
  </motion.svg>
)

export default function LoginPage() {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock function for Google login
  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success - would redirect to dashboard in real implementation
      toast({
        title: "Login successful",
        description: "Redirecting to your dashboard...",
      })

      // Simulate redirect
      setTimeout(() => {
        navigate("/dashboard")
      }, 1000)
    } catch (err: any) {
      console.error("Google login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [navigate, toast])

  // Floating elements for visual interest
  const FloatingElements = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {i % 3 === 0 ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300/20 to-blue-300/20 blur-xl" />
            ) : i % 3 === 1 ? (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 blur-xl" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-300/20 blur-xl" />
            )}
          </motion.div>
        ))}
      </div>
    )
  }

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
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col relative">
      <Toaster />
      <FloatingElements />
      <Header/>

      

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-screen-lg mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Left side - Content */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Invoice Management, <span className="text-green-600">Simplified</span>
                </h1>
                <p className="text-slate-600 text-lg mb-6">
                  Streamline your business finances with our secure, cloud-powered invoicing platform.
                </p>

                <div className="hidden md:block space-y-4 mt-8">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Real-time Sync</h3>
                      <p className="text-slate-600 text-sm">Keep your data synchronized across all devices</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Enterprise Security</h3>
                      <p className="text-slate-600 text-sm">Your data is protected with bank-level encryption</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Advanced Analytics</h3>
                      <p className="text-slate-600 text-sm">Gain insights into your business performance</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side - Login Card */}
            <div className="w-full md:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden w-full max-w-md mx-auto">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-6">
                      <InvoiceIllustration />
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2 mb-6">
                        <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
                    <p className="text-slate-600 text-center mb-6">Sign in to access your invoicing dashboard</p>

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

                    {/* Additional space between button and terms */}
                    <div className="h-6"></div>

                    <div className="mt-6 text-center">
                      <p className="text-xs text-slate-500">
                        By signing in, you agree to our{" "}
                        <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                          Privacy Policy
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust indicators below the card */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
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
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
