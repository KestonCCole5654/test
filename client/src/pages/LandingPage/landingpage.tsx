"use client"

import React from "react"
import { Button } from "../../components/ui/button"
import { CheckCircle2, ChevronDown, ArrowRight, Check, Badge, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

export default function LandingPage() {
  const betaFeatures = [
    "Unlimited invoices",
    "Google Sheets integration",
    "Early access to new features",
    "Priority support",
    "Help shape product development",
  ]
  function toggleMenu() {
    const menu = document.getElementById("mobile-menu")
    if (menu) {
      menu.classList.toggle("hidden")
    }
  }
  return (
    <div className="flex font-AfacadFlux min-h-screen flex-col">
      {/* Navigation */}
      <header className="w-full border-b bg-white">
        <div className="container max-w-6xl flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
          <h1 className="font-AfacadFlux text-green-600 font-extrabold text-2xl">SHEETBILLS <span className="text-xs align-super">TM</span></h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a href="#pricing" className="text-md text-gray-600 font-medium hover:underline underline-offset-4">
              Pricing
            </a>
            <a href="#pricing" className="text-md text-gray-600 font-medium hover:underline underline-offset-4">
              Demo
            </a>
            <a href="#pricing" className="text-md text-gray-600 font-medium hover:underline underline-offset-4">
              Testimonials 
            </a>
            <a href="#faq" className="text-md  text-gray-600 font-medium hover:underline underline-offset-4">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            
            <a href="/sign-in" className="hidden sm:inline-block">
              <button className="h-9 rounded-md bg-green-600 hover:bg-green-700 px-4 text-sm font-medium text-white">
                Get Started
              </button>
            </a>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10"
              aria-label="Toggle menu"
            >
              <span className="w-6 h-0.5 bg-black mb-1.5"></span>
              <span className="w-6 h-0.5 bg-black mb-1.5"></span>
              <span className="w-6 h-0.5 bg-black"></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden">
          <div className="px-4 py-4 border-t">
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-md font-medium py-2" onClick={toggleMenu}>
                Demo
              </a>
              <a href="#pricing" className="text-md font-medium py-2" onClick={toggleMenu}>
                Pricing
              </a>
              <a href="#faq" className="text-md font-medium py-2" onClick={toggleMenu}>
                FAQ
              </a>
              <a href="#contact" className="text-md font-medium py-2" onClick={toggleMenu}>
                Contact
              </a>

              <div className="flex flex-col gap-4 mt-4">
                <a href="/login" onClick={toggleMenu}>
                  <button className="w-full h-10 rounded-md border border-input bg-background px-4 text-sm font-medium">
                    Log in
                  </button>
                </a>
                <a href="/initialize" onClick={toggleMenu}>
                  <button className="w-full h-10 rounded-md bg-green-600 hover:bg-green-700 px-4 text-sm font-medium text-white">
                    Get Started
                  </button>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="container max-w-6xl mx-auto px-4 md:px-6 mt-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero Section - Upgraded for commercial look */}
      <section className="w-full py-20 bg-gradient-to-b from-white to-green-50 border-b">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center">
          {/* Logo and Brand Section */}
          <div className="flex flex-col items-center mb-8">
            <img src="/icon1.svg" alt="SheetBills Logo" className="h-24 w-24 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-600 mb-2">
              SheetBills <span className="text-xs align-super">™</span>
            </h1>
          </div>

          {/* Welcome Statement */}
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to the Future of Invoicing
            </h2>
            <p className="text-xl text-gray-600">
              Create, track, and manage invoices with the power of Google Sheets. Secure, simple, and built for growth.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="/sign-up" className="inline-flex items-center justify-center rounded-md bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-700 transition">
              Start Free Trial
            </a>
            <a href="#demo" className="inline-flex items-center justify-center rounded-md border border-green-600 bg-white px-8 py-4 text-lg font-bold text-green-700 shadow hover:bg-green-50 transition">
              Watch Demo
            </a>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center items-start mt-4 w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <svg className="h-8 w-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              <h3 className="font-bold text-lg text-gray-800 mb-1">100% Data Ownership</h3>
              <p className="text-gray-500 text-sm text-center">Your invoices and client data stay in your Google account—never on our servers.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <svg className="h-8 w-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              <h3 className="font-bold text-lg text-gray-800 mb-1">No Vendor Lock-in</h3>
              <p className="text-gray-500 text-sm text-center">Export, edit, and manage your data anytime—no proprietary formats or restrictions.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <svg className="h-8 w-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              <h3 className="font-bold text-lg text-gray-800 mb-1">Works Instantly with Google Sheets</h3>
              <p className="text-gray-500 text-sm text-center">No setup headaches—just connect your account and start invoicing in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="comparison" className="w-full py-16 md:py-24 bg-white">
        <div className="container max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
              <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-600">Why Choose SheetBills?</div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tighter md:text-4xl">
                The Smart Choice for Modern Businesses
            </h2>
              <p className="max-w-[700px] mx-auto text-gray-600 md:text-lg">
                SheetBills combines the power of Google Sheets with professional invoicing features, giving you the best of both worlds.
            </p>
          </div>
        </div>

          {/* Comparison Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                  <TableHead className="w-[250px] py-6 font-bold text-gray-700">Key Features</TableHead>
                  <TableHead className="text-center py-6">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-700">SheetBills</span>
                  </div>
                </TableHead>
                  <TableHead className="text-center py-6 font-bold text-gray-700">Other Solutions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {[
                  {
                    name: "Google Sheets Integration",
                    sheetbills: true,
                    others: false,
                    description: "Work in the environment you know best"
                  },
                  {
                    name: "Real-Time Sync",
                    sheetbills: true,
                    others: false,
                    description: "Instant updates between app and Google Sheets"
                  },
                  {
                    name: "Customizable Workflows",
                    sheetbills: true,
                    others: false,
                    description: "Tailor your invoicing process to your needs"
                  },
                  {
                    name: "Data Ownership",
                    sheetbills: "Your Google Account",
                    others: "Vendor's Servers",
                    description: "Your data stays in your control"
                  },
                  {
                    name: "Learning Curve",
                    sheetbills: "Minimal",
                    others: "Moderate to Steep",
                    description: "Get started in minutes, not days"
                  },
                
                 
                ].map((feature, index) => (
                  <TableRow 
                    key={index} 
                    className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-gray-700">{feature.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{feature.description}</div>
                </TableCell>
                    <TableCell className="text-center py-4">
                      {typeof feature.sheetbills === 'boolean' ? (
                        feature.sheetbills ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{feature.sheetbills}</span>
                      )}
                </TableCell>
                    <TableCell className="text-center py-4">
                      {typeof feature.others === 'boolean' ? (
                        feature.others ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{feature.others}</span>
                      )}
                </TableCell>
              </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 text-center">
            <a href="/sign-up" className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Start Free Trial
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
        </div>
      </div>
    </section>

      {/* Benefits Section with Video */}
      <section id="benefits" className="w-full py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-600">Simple Process</div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tighter md:text-4xl">How SheetBills Works</h2>
              <p className="max-w-[600px] text-gray-600 md:text-lg">
                Get started in minutes and transform your invoicing workflow with our simple 3-step process
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">1</div>
                <h3 className="text-xl font-bold text-gray-800">Connect Your Google Account</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Link your Google account in seconds. Your data stays secure in your Google Drive, with no complex setup required.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-600" />
                <span>Secure OAuth connection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-600" />
                <span>No data migration needed</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">2</div>
                <h3 className="text-xl font-bold text-gray-800">Create Professional Invoices</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Use our intuitive interface to create beautiful, professional invoices. All your data syncs automatically with Google Sheets.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-600" />
                <span>Custom templates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-600" />
                <span>Auto-calculations</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">3</div>
                <h3 className="text-xl font-bold text-gray-800">Manage & Track Everything</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track payments, manage clients, and get insights - all within your Google Sheets. Your data, your control.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-600" />
                <span>Payment tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-600" />
                <span>Client management</span>
              </div>
            </div>
          </div>

          {/* Video Showcase */}
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/pdOk5Rysvb8?si=R6TgLCIJpSUfzEEK" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="rounded-xl"
              ></iframe>
            </div>
            <div className="mt-6 text-center">
              <a 
                href="/sign-up" 
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Start Free Trial
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-600 mb-2">Loved by users</span>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tighter md:text-4xl mb-2">What Our Users Say</h2>
            <p className="max-w-[600px] text-gray-600 md:text-lg">
              Professionals and business owners trust SheetBills to simplify invoicing and save time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl mb-3">
                JD
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="font-semibold text-gray-800">Jane Doe</p>
              <p className="text-sm text-gray-500 mb-3">Freelance Designer</p>
              <blockquote className="text-gray-600 text-sm">
                "SheetBills makes invoicing so easy. I love that everything syncs with my Google Sheets automatically!"
              </blockquote>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl mb-3">
                AP
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="font-semibold text-gray-800">Alex Parker</p>
              <p className="text-sm text-gray-500 mb-3">Agency Owner</p>
              <blockquote className="text-gray-600 text-sm">
                "The integration with Google Sheets is a game changer. SheetBills saves me hours every month."
              </blockquote>
            </div>
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl mb-3">
                SM
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="font-semibold text-gray-800">Samira Malik</p>
              <p className="text-sm text-gray-500 mb-3">Small Business Owner</p>
              <blockquote className="text-gray-600 text-sm">
                "I can finally keep all my invoicing in one place. SheetBills is simple and reliable."
              </blockquote>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">98%</p>
              <p className="text-sm text-gray-600 mt-1">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">4.8/5</p>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">500+</p>
              <p className="text-sm text-gray-600 mt-1">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">30%</p>
              <p className="text-sm text-gray-600 mt-1">Time Saved</p>
            </div>
          </div>
          {/* CTA */}
          <div className="mt-12 text-center">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Join Our Growing Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section - Early Access */}
      <section
        id="pricing"
        className="relative w-full py-20 md:py-28 bg-gradient-to-br from-green-50 via-green-100 to-teal-100 overflow-hidden"
      >
        {/* Decorative SVG background */}
        <svg
          className="absolute left-0 top-0 w-full h-full opacity-10 pointer-events-none"
          aria-hidden="true"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 0 }}
        >
          <circle cx="700" cy="100" r="200" fill="#22c55e" />
          <circle cx="100" cy="500" r="150" fill="#14b8a6" />
        </svg>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-200 px-4 py-1 text-sm font-semibold text-green-700 shadow">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Early Access
            </span>
            <h2 className="text-4xl font-extrabold tracking-tighter text-gray-800 md:text-5xl">
              Join Our Exclusive Beta Program
            </h2>
            <p className="max-w-[600px] text-gray-700 md:text-lg">
              Be among the first to experience SheetBills and help shape the future of invoicing.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-green-400 bg-white/90 shadow-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
              {/* Left: Features */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Badge className="h-6 w-6 text-green-500" />
                  Beta Access
                </h3>
                <ul className="space-y-3 mb-6">
                  {betaFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check className="h-5 w-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 text-left text-sm text-gray-500">
                  <span>• Direct access to our development team</span>
                  <span>• Influence product roadmap</span>
                  <span>• Priority support and updates</span>
                </div>
              </div>
              {/* Right: Price & CTA */}
              <div className="flex flex-col items-center gap-4 min-w-[220px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-green-600">Free</span>
                  <span className="text-lg font-semibold text-gray-500">during beta</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">No credit card required</p>
                <a href="/initialize" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg transition-all duration-150">
                    Join Beta Program
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <span className="text-xs text-gray-400 mt-2">Limited spots available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-12 md:py-12 lg:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
              <p className="max-w-[600px] font-bold text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Got questions? We've got answers.
              </p>
            </div>
          </div>


          <div className="mx-auto max-w-3xl space-y-4 py-12">
            {/* FAQ Item 1 */}
            <div className="rounded-lg border">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  How does SheetBills work with Google Sheets?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-4 text-sm">
                  SheetBills connects to your Google account and creates a dedicated spreadsheet for your invoicing
                  data. When you create an invoice in SheetBills, it's automatically saved to your Google Sheets. You
                  can also edit your data directly in Google Sheets, and the changes will be reflected in SheetBills.
                </div>
              </details>
            </div>

            {/* FAQ Item 2 */}
            <div className="rounded-lg border">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Do I need a Google account to use SheetBills?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-4 text-sm">
                  Yes, SheetBills requires a Google account since it uses Google Sheets to store your data. This
                  integration allows you to maintain ownership of your data while benefiting from the familiar interface
                  of Google Sheets.
                </div>
              </details>
            </div>

            {/* FAQ Item 3 */}
            <div className="rounded-lg border">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Can I customize my invoice templates?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-4 text-sm">
                  Yes, SheetBills offers customizable invoice templates. You can add your logo, change colors, and
                  adjust the layout to match your brand. Pro and Business plans offer more advanced customization
                  options.
                </div>
              </details>
            </div>

            {/* FAQ Item 4 */}
            <div className="rounded-lg border">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Is my data secure with SheetBills?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-4 text-sm">
                  SheetBills takes data security seriously. Your invoice data is stored in your own Google account, not
                  on our servers. We use OAuth for authentication, which means we never see or store your Google
                  password. All connections are encrypted with SSL.
                </div>
              </details>
            </div>

            {/* FAQ Item 5 */}
            <div className="rounded-lg border">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Can I accept payments through SheetBills?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-4 text-sm">
                  SheetBills integrates with popular payment processors like Stripe and PayPal, allowing your clients to
                  pay invoices online. When a payment is received, your invoice status is automatically updated in your
                  Google Sheet.
                </div>
              </details>
            </div>

            {/* FAQ Item 6 */}
            <div className="rounded-lg border">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  Can I switch plans later?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t p-4 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access
                  to the new features. When downgrading, the changes will take effect at the end of your current billing
                  cycle.
                </div>
              </details>
            </div>
          </div>

          
        </div>
      </section>

      {/* CTA Section - Improved for higher conversion */}
      <section
        id="contact"
        className="w-full py-14 md:py-14 lg:py-14 bg-gradient-to-r from-green-700 via-green-600 to-teal-600 text-white"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="flex flex-col items-center space-y-3">
             
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Ready to Take Control of Your Invoicing?
              </h2>
              <p className="max-w-[600px] text-lg md:text-xl text-white/90 font-medium">
                Join SheetBills today and experience effortless invoicing, seamless Google Sheets integration, and total data ownership. Start free—no credit card required.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center mt-4">
              <a href="/sign-up">
                <Button className="bg-white text-green-700 hover:bg-green-100 font-bold px-8 py-3 text-base shadow-lg">
                  Get Started Free
                </Button>
              </a>
              <a href="#demo">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 text-base"
                >
                  See How It Works
                </Button>
              </a>
            </div>
            <p className="text-sm text-white/70 mt-4">
              Limited beta spots available. Secure your place now!
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="w-full border-t py-8 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Description */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-extrabold text-green-600">
              SHEETBILLS <span className="text-xs align-super">TM</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1 text-center md:text-left">
              Simple, secure invoicing with Google Sheets.
            </p>
          </div>
          {/* Essential Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#pricing" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Pricing</a>
            <a href="#benefits" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Demo</a>
            <a href="#testimonials" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Testimonials</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-green-600 transition-colors">FAQ</a>
            <a href="/sign-up" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Get Started</a>
          </div>
          {/* Contact */}
          <div className="flex flex-col items-center md:items-end">
            <a href="mailto:support@sheetbills.com" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              support@sheetbills.com
            </a>
            <p className="text-xs text-gray-400 mt-1">&copy; 2025 SheetBills</p>
          </div>
        </div>
      </footer>


    </div>
  )
}

