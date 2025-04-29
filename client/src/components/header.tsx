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
    <header className="sticky top-0 z-50 border-b border-gray-50 bg-white shadow-sm">
      <div className="container max-w-8xl mx-auto  sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-green-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-green-700 font-bold text-xl hidden sm:inline-block">SHEETBILLS <sup className="text-xs text-green-700">TM</sup></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
           <nav className="hidden md:flex items-center space-x-1">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/template-generator"
                  className="px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Invoices Template Generator
                </Link>
                <Link
                  to="/settings"
                  className="px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Account & Settings
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Contact & Support
                </Link>
              </>
            )}
          </nav>
        

          {/* User profile section - desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="text-green-700 hover:text-green-800">
                  <span className="sr-only">Notifications</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-green-700 hover:text-green-800">
                  <span className="sr-only">Help</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-green-50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 ">
                        <AvatarFallback className="bg-green-100 text-black ">
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
                      <DropdownMenuItem>
                  
                          {/* User profile section - desktop :       <User className="mr-2 h-4 w-4" />  <span>Profile</span> */}
                      
                      </DropdownMenuItem>
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
              </>
            ) : (
              <Button onClick={() => navigate("/login")} className="bg-green-700 hover:bg-green-800">
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            id="mobile-menu-button"
            variant="ghost"
            size="icon"
            className="md:hidden text-green-700 hover:text-green-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-16 inset-x-0 bg-white border-b border-green-700 shadow-lg z-50 md:hidden"
        >
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
            {user && (
              <nav className="flex flex-col space-y-1">
                <Link
                  to="/dashboard"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                  Dashboard
                </Link>
                <Link
                  to="/template-generator"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                  Invoices Template Generator
                </Link>
                <Link
                  to="/settings"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                  Settings
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                  Contact & Support
                </Link>
              </nav>
            )}

            {user ? (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center px-3 py-2">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-green-100 text-green-800">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-green-900 truncate">{user.email}</p>
                    <p className="text-sm text-green-700 truncate">Account</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-green-200">
                <Button
                  className="w-full bg-green-700 hover:bg-green-800"
                  onClick={() => {
                    navigate("/login")
                    handleNavigation()
                  }}
                >
                  Sign in
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
