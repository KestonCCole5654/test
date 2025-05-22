import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ArrowRight, CheckCircle2, FileText, BarChart3, Mail } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      title: "Professional Invoices",
      description: "Create beautiful, professional invoices in minutes with our easy-to-use templates.",
      icon: FileText,
    },
    {
      title: "Track Payments",
      description: "Keep track of all your invoices and payments in one place with real-time updates.",
      icon: BarChart3,
    },
    {
      title: "Email Integration",
      description: "Send invoices directly to your clients via email with just one click.",
      icon: Mail,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SB</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#blog" className="text-gray-600 hover:text-gray-900">Blog</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#waitlist" className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Join Waitlist
            </a>
          </div>
        </nav>
      </div>
    </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Tired of Wrestling with Invoices in Google Sheets?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ditch the templates, formulas, and frustration. SheetBills makes invoicing in Google Sheets fast, simple, and professional.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Join Waitlist
              </Button>
              <Button
                variant="ghost"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900"
              >
                See how it works →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-800 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your invoices
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-800 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-gray-500">© 2024 SheetBills. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
} 