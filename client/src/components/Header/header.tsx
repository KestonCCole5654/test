import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, ChevronDown, LogOut, Settings, User, Bell, HelpCircle } from "lucide-react"
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import axios from "axios";

const Header = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const supabaseClient = useSupabaseClient();
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient])

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session?.provider_token) {
          console.warn("Google authentication not available for fetching business details in header.");
          return;
        }

        const sheetUrl = localStorage.getItem("defaultSheetUrl");
        if (!sheetUrl) {
          console.warn("No defaultSheetUrl found in localStorage for fetching business details in header.");
          return;
        }

        const response = await axios.get("https://sheetbills-server.vercel.app/api/business-details", {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
          },
          params: { sheetUrl },
        });

        if (response.data.businessDetails && response.data.businessDetails["Company Name"]) {
          setBusinessName(response.data.businessDetails["Company Name"]);
        }
      } catch (error) {
        console.error("Error fetching business details for header:", error);
      }
    };

    fetchBusinessDetails();
  }, [supabaseClient]);

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut()
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

  return (
    <header className="sticky no-print font-onest top-0 z-50 bg-slate-900 shadow-xs">
      <div className="container max-w-8xl mx-auto sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/invoices" className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-slate-200">
                {businessName || "SheetBills"}
              </span> 
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user && (
              <>
                <Link
                  to="/invoices"
                  className="px-3 py-2 rounded-md font-normal text-slate-200 hover:text-slate-300 transition-colors"
                  onClick={handleNavigation}
                >
                 Invoices
                </Link>
                
                {/* <Link
                  to="/reports"
                  className="px-3 py-2 rounded-md font-normal text-slate-200 hover:text-slate-300 transition-colors"
                  onClick={handleNavigation}
                >
                  Reports
                </Link> */}

                <Link
                  to="/settings"
                  className="px-3 py-2 rounded-md font-normal text-slate-200 hover:text-slate-300  transition-colors"
                  onClick={handleNavigation}
                >
                  Account & Settings
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 rounded-md font-normal text-slate-200 hover:text-slate-300  transition-colors"
                  onClick={handleNavigation}
                >
                  Contact & Support
                </Link>
              </>
            )}
          </nav>

          {/* User profile section - desktop */}
          <div className="hidden md:flex font-onest font-normal items-center space-x-2">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-2 py-1.5 "
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                          alt={user.email?.split("@")[0] || "User"}
                        />
                        <AvatarFallback className="bg-green-200 text-black">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-200 font-normal font-md hidden sm:inline-block max-w-[120px] truncate">
                        {user.email?.split("@")[0] || "User"}
                      </span>
                      <ChevronDown size={16} className="text-slate-200" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        {/* User profile section - desktop */}
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
                  to="/invoices"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                 Invoices
                </Link>
                
             
                
                <Link
                  to="/settings"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                  Settings
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2.5 rounded-md text-slate-700 hover:text-slate-900 transition-colors"
                  onClick={handleNavigation}
                >
                  Contact & Support
                </Link>
              </nav>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header