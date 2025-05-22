import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ArrowRight, CheckCircle2, FileText, BarChart3, Mail } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen   bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-green-800 flex items-center justify-center">
                <span className="text-white font-normal text-lg">SB</span>
              </div>
              <span className="text-xl font-extralight text-green-800">SheetBills ™</span>
            </div>

            {/* Centered Navigation Links */}
            <div className="hidden md:flex items-center justify-center space-x-12">
              <a href="#why-codeguide" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Why SheetBills?
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                How It Works
              </a>
              <a href="#faqs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                FAQs
              </a>
            </div>

            <div className="flex items-center">
              <Button
                onClick={() => navigate("/login")}
                className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-normal text-gray-900 mb-6">
              Tired of <span className="text-green-800">Wrestling</span> with <span className="text-green-800">Invoices</span> in <span className="text-green-800">Google Sheets</span>?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ditch the templates, formulas, and frustration. SheetBills makes invoicing in Google Sheets fast, simple, and professional.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try SheetBills for Free
              </Button>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-normal text-green-600">Streamline Your Invoicing</h2>
            <p className="mt-2 text-4xl font-normal tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">Professional Invoices Made Simple</p>
            <p className="mt-6 text-lg/8 text-gray-600">Transform your Google Sheets into a powerful invoicing system. No more complex formulas or messy templates.</p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base/7 font-normal text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-600">
                    <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                    </svg>
                  </div>
                  Brings structure to your Google Sheets Invoices
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">Uses your Google Sheet as the database, no new tool or storage needed. All invoice data is centralized and structured for easy access.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base/7 font-normal text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-600">
                    <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                    </svg>
                  </div>
                  User-friendly interface for Google Sheets invoicing
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">No need to open the spreadsheet — create, read, update, and delete invoices via a clean UI. Feels like a modern app but runs on your Sheet.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base/7 font-normal text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-600">
                    <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                    </svg>
                  </div>
                  Print & share invoices professionally
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">One-click print-ready PDFs. Generate public invoice links to share with clients.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base/7 font-normal text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-600">
                    <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                    </svg>
                  </div>
                  Update business info easily
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">Quickly update name, and, contact details — reflected on all your invoices automatically.</dd>
              </div>
            </dl>
            {/* Centered last feature */}
            <div className="flex justify-center items-center mt-12">
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-600 mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <dt className="text-lg font-semibold text-gray-900 mb-2">Lightweight, simple, and fast</dt>
                <dd className="text-base text-gray-600">No need to learn complex tools. Ideal for freelancers, consultants, and small businesses already using Google Sheets.</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="flex flex-col items-center mx-auto max-w-5xl px-6 lg:px-8 justify-center pt-32 scroll-mt-[3.2rem]" id="how-it-works">
        <div className="flex items-center justify-between w-full howItWorks3:flex-col howItWorks3:items-start howItWorks3:gap-3">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center justify-center gap-2 border rounded-full bg-green-50 border-green-200 px-5 py-0.5 font-medium w-max text-green-800">
              How It Works ? 
            </div>
            <h2 className="text-4xl font-normal text-green-800 pr-1">
              Built For Freelancers <br /> & Small Businesses
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-gray-600 w-[35rem] leading-8 max-w-[90vw] howItWorks2:w-[32rem]">
              SheetBills makes creating and managing invoices easy with a simple, streamlined process that takes you from sign-up to sending professional invoices in just a few steps.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="flex items-center text-nowrap justify-center rounded-full bg-green-800 text-white font-medium px-8 py-4 w-fit hover:bg-green-700"
            >
              Get Started Today
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-16 w-full max-w-[900px] mx-auto px-4 py-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl leading-tight text-green-800 font-normal pb-2 tracking-tight">How It Works</h2>
            <p className="text-gray-600 w-full leading-[1.86rem]">
              Get started with SheetBills in just a few simple steps. Our intuitive process makes invoice management effortless.
            </p>
          </div>

          {/* Step 1 */}
          <div className="flex items-center gap-16 w-full justify-between howItWorks3:gap-5 howItWorks4:flex-col-reverse howItWorks4:gap-10">
            <div className="w-[400px] h-[300px] bg-gray-100 rounded-lg howItWorks1:w-[350px] howItWorks3:w-[320px] howItWorks4:w-full howItWorks4:max-w-[90vw]"></div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0">
                <span className="text-[6rem] leading-[5rem] opacity-[0.5] pb-2 font-normal text-green-800">01</span>
                <h3 className="text-lg leading-tight text-green-800 font-normal pb-2 tracking-tight">Quick Sign-Up</h3>
              </div>
              <p className="text-gray-600 w-[400px] leading-[1.86rem] howItWorks2:w-[350px] howItWorks4:w-full howItWorks4:max-w-[90vw]">
                Sign up with your Google account to access the SheetBills dashboard. The process is quick and easy, getting you started right away.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-16 w-full justify-between howItWorks3:gap-5 howItWorks4:flex-col howItWorks4:gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0">
                <span className="text-[6rem] leading-[5rem] opacity-[0.5] pb-2 font-normal text-green-800">02</span>
                <h3 className="text-lg leading-tight text-green-800 font-normal pb-2 tracking-tight">Connect Your Sheet</h3>
              </div>
              <p className="text-gray-600 w-[400px] leading-[1.86rem] howItWorks2:w-[350px] howItWorks4:w-full howItWorks4:max-w-[90vw]">
                Connect your Google Sheet or let us create one for you. SheetBills will set up the perfect structure for your invoices.
              </p>
            </div>
            <div className="w-[400px] h-[300px] bg-gray-100 rounded-lg howItWorks1:w-[350px] howItWorks3:w-[320px] howItWorks4:w-full howItWorks4:max-w-[90vw]"></div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-16 w-full justify-between howItWorks3:gap-16 howItWorks4:flex-col-reverse howItWorks4:gap-10">
            <div className="w-[400px] h-[300px] bg-gray-100 rounded-lg howItWorks1:w-[350px] howItWorks3:w-[320px] howItWorks4:w-full howItWorks4:max-w-[90vw]"></div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0">
                <span className="text-[6rem] leading-[5rem] opacity-[0.5] pb-2 font-normal text-green-800">03</span>
                <h3 className="text-lg leading-tight text-green-800 font-normal pb-2 tracking-tight">Add Business Details</h3>
              </div>
              <p className="text-gray-600 w-[400px] leading-[1.86rem] howItWorks2:w-[350px] howItWorks4:w-full howItWorks4:max-w-[90vw]">
                Enter your business information once, and it will automatically appear on all your invoices. Update it anytime, and changes reflect everywhere.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-16 w-full justify-between howItWorks3:gap-5 howItWorks4:flex-col howItWorks4:gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0">
                <span className="text-[6rem] leading-[5rem] opacity-[0.5] font-normal pb-2 text-green-800">04</span>
                <h3 className="text-lg leading-tight text-green-800 font-normal pb-2 tracking-tight">Start Creating Invoices</h3>
              </div>
              <p className="text-gray-600 w-[400px] leading-[1.86rem] howItWorks2:w-[350px] howItWorks4:w-full howItWorks4:max-w-[90vw]">
                Begin creating professional invoices instantly. Our system automatically syncs with your Google Sheet, keeping everything organized.
              </p>
            </div>
            <div className="w-[400px] h-[300px] bg-gray-100 rounded-lg howItWorks1:w-[350px] howItWorks3:w-[320px] howItWorks4:w-full howItWorks4:max-w-[90vw]"></div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <div className="py-24 px-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col text-left basis-1/2">
            <p className="inline-block font-normal text-green-800 mb-4">FAQ</p>
            <p className="text-3xl md:text-4xl font-normal text-gray-900">Frequently Asked Questions</p>
          </div>
          <ul className="basis-1/2">
            <li>
              <button className="relative flex gap-2 items-center w-full py-5 text-base font-normal text-left border-t md:text-lg border-gray-200" aria-expanded="false">
                <span className="flex-1 text-gray-900">What is SheetBills?</span>
                <svg className="flex-shrink-0 w-4 h-4 ml-auto fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center transition duration-200 ease-out"></rect>
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center rotate-90 transition duration-200 ease-out"></rect>
                </svg>
              </button>
              <div className="transition-all duration-300 ease-in-out opacity-80 overflow-hidden" style={{ maxHeight: "0", opacity: 0 }}>
                <div className="pb-5 leading-relaxed">
                  <div className="space-y-2 leading-relaxed">
                    <p>SheetBills is a powerful invoice management system that integrates with Google Sheets. It helps you create, manage, and track invoices efficiently while maintaining all your data in a familiar spreadsheet format.</p>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <button className="relative flex gap-2 items-center w-full py-5 text-base font-normal text-left border-t md:text-lg border-gray-200" aria-expanded="false">
                <span className="flex-1 text-gray-900">Do I need to be tech-savvy to use SheetBills?</span>
                <svg className="flex-shrink-0 w-4 h-4 ml-auto fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center transition duration-200 ease-out"></rect>
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center rotate-90 transition duration-200 ease-out"></rect>
                </svg>
              </button>
              <div className="transition-all duration-300 ease-in-out opacity-80 overflow-hidden" style={{ maxHeight: "0", opacity: 0 }}>
                <div className="pb-5 leading-relaxed">
                  <p>Not at all! SheetBills is designed to be user-friendly. If you can use Google Sheets, you can use SheetBills. We provide a simple interface for creating and managing invoices, while handling all the technical details in the background.</p>
                </div>
              </div>
            </li>
            <li>
              <button className="relative flex gap-2 items-center w-full py-5 text-base font-normal text-left border-t md:text-lg border-gray-200" aria-expanded="false">
                <span className="flex-1 text-gray-900">Can I customize my invoices?</span>
                <svg className="flex-shrink-0 w-4 h-4 ml-auto fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center transition duration-200 ease-out"></rect>
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center rotate-90 transition duration-200 ease-out"></rect>
                </svg>
              </button>
              <div className="transition-all duration-300 ease-in-out opacity-80 overflow-hidden" style={{ maxHeight: "0", opacity: 0 }}>
                <div className="pb-5 leading-relaxed">
                  <p>Yes! You can customize your business details, invoice templates, and add your logo. SheetBills provides professional templates that you can personalize to match your brand identity.</p>
                </div>
              </div>
            </li>
            <li>
              <button className="relative flex gap-2 items-center w-full py-5 text-base font-normal text-left border-t md:text-lg border-gray-200" aria-expanded="false">
                <span className="flex-1 text-gray-900">Is my data secure?</span>
                <svg className="flex-shrink-0 w-4 h-4 ml-auto fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center transition duration-200 ease-out"></rect>
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center rotate-90 transition duration-200 ease-out"></rect>
                </svg>
              </button>
              <div className="transition-all duration-300 ease-in-out opacity-80 overflow-hidden" style={{ maxHeight: "0", opacity: 0 }}>
                <div className="pb-5 leading-relaxed">
                  <p>Absolutely. SheetBills uses Google's secure authentication and data storage. Your data is stored in your own Google Sheet, and we only access it with your explicit permission. We never store your sensitive business information on our servers.</p>
                </div>
              </div>
            </li>
            <li>
              <button className="relative flex gap-2 items-center w-full py-5 text-base font-normal text-left border-t md:text-lg border-gray-200" aria-expanded="false">
                <span className="flex-1 text-gray-900">Can I track invoice status?</span>
                <svg className="flex-shrink-0 w-4 h-4 ml-auto fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center transition duration-200 ease-out"></rect>
                  <rect y="7" width="16" height="2" rx="1" className="transform origin-center rotate-90 transition duration-200 ease-out"></rect>
                </svg>
              </button>
              <div className="transition-all duration-300 ease-in-out opacity-80 overflow-hidden" style={{ maxHeight: "0", opacity: 0 }}>
                <div className="pb-5 leading-relaxed">
                  <p>Yes, SheetBills provides a comprehensive dashboard where you can track all your invoices, their status (paid, pending, overdue), and payment history. You can also filter and search through your invoices easily.</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Testimonial Section - Commented Out
      <div className="space-y-4 md:space-y-6 max-w-md mx-auto mt-16 md:mt-24">
        <div className="rating !flex justify-center">
          {[...Array(5)].map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-500">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
          ))}
        </div>
        <div className="text-base leading-relaxed space-y-2 max-w-md mx-auto text-center">
          <p>SheetBills has transformed how I manage my invoices. The Google Sheets integration makes it incredibly easy to keep track of everything.</p>
          <p>I've saved countless hours that I used to spend on manual invoice management <span className="bg-yellow-100/80 px-1">and my clients love the professional look</span> of the generated invoices.</p>
        </div>
        <div className="flex justify-center items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200"></div>
          <div>
            <p className="font-normal">Sarah M.</p>
            <p className="text-gray-600 text-sm">Small Business Owner</p>
          </div>
        </div>
      </div>
      */}

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