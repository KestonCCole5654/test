"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, ChevronDown, LogOut, Settings, User, Bell, HelpCircle } from "lucide-react"
import supabase from "../components/Auth/supabaseClient"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback } from "./ui/avatar"

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    setMounted(true)

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate("/login")
      setIsMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        event.target !== document.getElementById("mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close mobile menu when navigating
  const handleNavigation = () => {
    setIsMobileMenuOpen(false)
  }

  if (!mounted || loading) return null

  return (
    <header className="w-full border-b bg-white">
      <div className="container max-w-7xl flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <h1 className="font-AfacadFlux text-green-600 font-extrabold text-2xl">SHEETBILLS <span className="text-xs align-super">TM</span></h1>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="text-md text-gray-600 font-medium hover:underline underline-offset-4"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection('benefits')} 
            className="text-md text-gray-600 font-medium hover:underline underline-offset-4"
          >
            Demo
          </button>
          <button 
            onClick={() => scrollToSection('testimonials')} 
            className="text-md text-gray-600 font-medium hover:underline underline-offset-4"
          >
            Testimonials 
          </button>
          <button 
            onClick={() => scrollToSection('faq')} 
            className="text-md text-gray-600 font-medium hover:underline underline-offset-4"
          >
            FAQ
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-green-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-black">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-black font-medium hidden sm:inline-block max-w-[120px] truncate">
                    {user.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronDown size={16} className="text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href="/login" className="hidden sm:inline-block">
              <button className="h-9 rounded-md bg-green-600 hover:bg-green-700 px-4 text-sm font-medium text-white">
                Get Started
              </button>
            </a>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-4 border-t">
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('benefits')} 
                className="text-md font-medium py-2 text-left"
              >
                Demo
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-md font-medium py-2 text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className="text-md font-medium py-2 text-left"
              >
                FAQ
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-md font-medium py-2 text-left"
              >
                Contact
              </button>

              <div className="flex flex-col gap-4 mt-4">
                {user ? (
                  <>
                    <a href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full h-10 rounded-md border border-input bg-background px-4 text-sm font-medium">
                        Settings
                      </button>
                    </a>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full h-10 rounded-md bg-red-600 hover:bg-red-700 px-4 text-sm font-medium text-white"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full h-10 rounded-md border border-input bg-background px-4 text-sm font-medium">
                        Log in
                      </button>
                    </a>
                    <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full h-10 rounded-md bg-green-600 hover:bg-green-700 px-4 text-sm font-medium text-white">
                        Get Started
                      </button>
                    </a>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
