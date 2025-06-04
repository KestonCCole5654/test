"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useToast } from "../../components/ui/use-toast"
import { Loader2, Edit, Save, X, Info, Calendar, Mail, User, Building2, Shield, ExternalLink, LogOut, Phone, MapPin, Clock } from "lucide-react"
import axios from "axios"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { LoadingSpinner } from "../../components/ui/loadingSpinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Checkbox } from '../../components/ui/checkbox'
import { useBrandLogo } from "../../components/ui/InvoiceStats"
import LogoUpload from '../../components/LogoUpload'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface UserData {
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
  lastLogin?: string
  accountType?: string
  phone?: string
}

export default function SettingsPage() {
  const supabase = useSupabaseClient()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    avatarUrl: "",
    createdAt: "",
    lastLogin: "",
    accountType: "Free Beta User",
    phone: "",
  })
  const [businessData, setBusinessData] = useState({
    companyName: "",
    phone: "",
    address: "",
    email: "",
  })
  const [isUpdatingBusiness, setIsUpdatingBusiness] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  //const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInvoices, setDeleteInvoices] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const sheetUrl = typeof window !== 'undefined' ? localStorage.getItem("defaultSheetUrl") : ""

  // Brand logo for business (using business email domain)
  const businessDomain = businessData.email?.split("@")[1] || "";
  const businessLogo = useBrandLogo(businessDomain);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate("/sign-in");
        return;
      }

      // Configure headers with both tokens
      const headers = {
        Authorization: `Bearer ${session.provider_token}`,
        'X-Supabase-Token': session.access_token
      };      



      // Fetch user data
      const userResponse = await axios.get("https://sheetbills-server.vercel.app/api/user", { headers });
      if (userResponse.data.user) {
        setUserData({
          name: userResponse.data.user.name,
          email: userResponse.data.user.email,
          avatarUrl: userResponse.data.user.avatarUrl,
          createdAt: userResponse.data.user.createdAt,
          lastLogin: userResponse.data.user.lastLogin,
          accountType: userResponse.data.user.accountType,
          phone: userResponse.data.user.phone
        });
      }

      // Fetch business details
      // Always pass the current invoice spreadsheet URL as sheetUrl
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected")
      }
      const businessResponse = await axios.get("https://sheetbills-server.vercel.app/api/business-details", {
        headers,
        params: { sheetUrl }
      });
      if (businessResponse.data.businessDetails) {
        setBusinessData({
          companyName: businessResponse.data.businessDetails["Company Name"] || "",
          email: businessResponse.data.businessDetails["Business Email"] || "",
          phone: businessResponse.data.businessDetails["Phone Number"] || "",
          address: businessResponse.data.businessDetails["Address"] || "",
        });
      }

    } catch (error) {
      console.error("Fetch error:", {
        error: axios.isAxiosError(error) ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        response: axios.isAxiosError(error) ? error.response?.data : undefined
      });

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/sign-in");
        return;
      }


    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchDataWrapper = async () => {
      try {
        await fetchData();
      } catch (error) {
        if (isMounted) {
          console.error("Data fetch error:", error);
        }
      }
    };

    if (isMounted) {
      fetchDataWrapper();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);


  const handleBusinessUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdatingBusiness(true);

      // Get session and tokens
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Authentication required");
      }

      // Get the current sheet URL from localStorage
      const currentSheetUrl = localStorage.getItem("defaultSheetUrl");
      if (!currentSheetUrl) {
        throw new Error("No invoice spreadsheet selected");
      }

      const response = await axios.put(
        "https://sheetbills-server.vercel.app/api/update-business-details",
        {
          companyName: businessData.companyName,
          email: businessData.email,
          phone: businessData.phone,
          address: businessData.address,
          sheetUrl: currentSheetUrl
        },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Business details updated successfully",
        });
        await fetchData();
        setIsEditing(false);
      }

    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to update business details"
          : "Network error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBusiness(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Logged out", description: "You have been logged out successfully." });
      navigate("/login");
    } catch (error) {
      toast({ title: "Logout Failed", description: error instanceof Error ? error.message : "Failed to log out.", variant: "destructive" });
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Authentication required");

      const response = await axios.delete("https://sheetbills-server.vercel.app/api/delete-account", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token
        },
        data: {
          deleteInvoices: deleteInvoices,
          sheetUrl: sheetUrl || undefined
        }
      });

      // Check for success explicitly based on backend response
      if (response.data.success) {
        // Sign out from Supabase on the client side
        await supabase.auth.signOut();
        // Navigate to the new status page with success state
        navigate("/account-status", { 
          state: { 
            success: true, 
            message: response.data.message || "Your account has been successfully deleted." 
          } 
        });
      } else {
        // If backend indicates failure but no error was thrown
        navigate("/account-status", { 
          state: { 
            success: false, 
            message: response.data.error || "Account deletion failed.",
            errorDetails: response.data.details
          } 
        });
      }

    } catch (error) {
      console.error("Delete account error:", error);
      // Navigate to the new status page with error state
      navigate("/account-status", {
        state: {
          success: false,
          message: error instanceof Error ? error.message : "An unexpected error occurred.",
          errorDetails: axios.isAxiosError(error) ? error.response?.data?.details || error.response?.data?.error : undefined
        }
      });
    } finally {
      setIsDeleting(false);
      //setShowDeleteModal(false);
      setDeletePhrase("");
      setDeleteInvoices(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col justify-center items-center gap-4">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation and Page Title */}
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Profile Section */}
      <div className="mb-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-green-800" />
            Account Profile
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and account details.</p>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Email</span>
            </div>
            <span className="text-gray-900">{userData.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Account Created</span>
            </div>
            <span className="text-gray-900">{formatDate(userData.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Last Login</span>
            </div>
            <span className="text-gray-900">{userData.lastLogin ? formatDate(userData.lastLogin) : "—"}</span>
          </div>
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Account Type</span>
            </div>
            <span className="text-gray-900">{userData.accountType || "—"}</span>
          </div>
          {userData.phone && (
            <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">Phone</span>
              </div>
              <span className="text-gray-900">{userData.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Business Information Section */}
      <div className="mb-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-green-800" />
                Business Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage your business information and contact details.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {businessLogo && (
                    <img src={businessLogo} alt="Brand Logo" className="h-8 w-8 rounded-full bg-white border border-gray-200" />
                  )}
                  <span className="text-gray-700">Company Name</span>
                </div>
                <span className="text-gray-900">{businessData.companyName || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Business Email</span>
                </div>
                <span className="text-gray-900">{businessData.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Phone Number</span>
                </div>
                <span className="text-gray-900">{businessData.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Address</span>
                </div>
                <span className="text-gray-900">{businessData.address || "—"}</span>
              </div>
            </>
          ) : (
            <form onSubmit={handleBusinessUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-3">
                    {businessLogo && (
                      <img src={businessLogo} alt="Brand Logo" className="h-8 w-8 rounded-full bg-white border border-gray-200" />
                    )}
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    required
                    value={businessData.companyName}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your company name"
                    className="mt-1.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Business Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={businessData.email}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@example.com"
                    className="mt-1.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Business St, Suite 100, City, State, ZIP"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingBusiness}
                  className="min-w-[120px] bg-green-800 hover:bg-green-900 text-white"
                >
                  {isUpdatingBusiness ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Terms & Privacy Policy Section */}
      <div className="mb-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-800" />
            Terms & Privacy Policy
          </h2>
          <p className="text-sm text-gray-500 mt-1">View our Terms of Service and Privacy Policy.</p>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <span className="text-gray-700">Terms of Service</span>
            <a
              href="/legal?tab=terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 font-medium hover:underline flex items-center gap-2"
            >
              View Terms of Service
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <span className="text-gray-700">Privacy Policy</span>
            <a
              href="/legal?tab=privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 font-medium hover:underline flex items-center gap-2"
            >
              View Privacy Policy
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="mb-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
            <LogOut className="h-6 w-6 text-red-600" />
            Account Actions
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account session and data.</p>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <Button 
              onClick={handleLogout} 
              className="bg-green-800 hover:bg-green-900 text-white flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

