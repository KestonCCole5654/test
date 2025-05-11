import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  BarChart, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Archive
} from "lucide-react"
import supabase from "../Auth/supabaseClient"
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
import { Avatar, AvatarFallback } from "../ui/avatar"
import { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from "../../lib/utils"

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate("/login")
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className={cn(
      "flex flex-col h-screen border-r border-gray-200 transition-all duration-300 bg-gray-50",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 border-b border-gray-100 px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-green-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-md">$</span>
          </div>
          {!collapsed && (
            <span className="text-xl  text-green-800">Sheetbills<sup className="text-xs text-green-800">TM</sup></span>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-gray-500 hover:text-gray-700"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <li>
            <Link
              to="/invoices"
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive("/invoices") 
                  ? "bg-green-100 text-green-800" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <Archive size={20} className="flex-shrink-0" />
              {!collapsed && <span className="ml-3">Invoices</span>}
            </Link>
          </li>
        
          <li>
            <Link
              to="/create-invoice"
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive("/create-invoice") 
                  ? "bg-green-100 text-green-800" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <FileText size={20} className="flex-shrink-0" />
              {!collapsed && <span className="ml-3">Create Invoice</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive("/settings") 
                  ? "bg-green-100 text-green-800" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <Settings size={20} className="flex-shrink-0" />
              {!collapsed && <span className="ml-3">Settings</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive("/contact") 
                  ? "bg-green-100 text-green-800" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <HelpCircle size={20} className="flex-shrink-0" />
              {!collapsed && <span className="ml-3">Support</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        {collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100 text-black">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user.email?.split("@")[0] || "User"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 text-black">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {user.email?.split("@")[0] || "User"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
