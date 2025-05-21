"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useToast } from "../../components/ui/use-toast"
import { Loader2, Edit, Save, X, Info, Calendar, Mail, User } from "lucide-react"
import axios from "axios"
import supabase from "../../components/Auth/supabaseClient"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { LoadingSpinner } from "../../components/ui/loadingSpinner"

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
      const sheetUrl = localStorage.getItem("defaultSheetUrl") || "";
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
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    try {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Authentication required");
      // Call backend to delete user
      await axios.delete("https://sheetbills-server.vercel.app/api/delete-account", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token
        }
      });
      await supabase.auth.signOut();
      toast({ title: "Account Deleted", description: "Your account and all data have been deleted." });
      navigate("/login");
    } catch (error) {
      toast({ title: "Delete Failed", description: error instanceof Error ? error.message : "Failed to delete account.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">Loading Account & Business Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
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
      <div className="mb-12">
        <h2 className="text-2xl font-cal-sans font-medium text-gray-900 mb-1 flex items-center gap-2">
          Account Profile
          {/* Google Icon */}
          <span title="Signed in with Google" className="ml-2">
            <svg width="22" height="22" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.6 20.5H42V20.4H24v7.2h11.2C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l5.8-5.8C33.5 6.2 28.1 4 22 4 12.1 4 4 12.1 4 22s8.1 18 18 18c8.9 0 17.3-6.4 17.3-18 0-1.2-.1-2.1-.3-3.5z"/><path fill="#34A853" d="M6.3 14.7l5.9 4.3C14 16.1 18.6 13 24 13c2.6 0 5 .9 6.9 2.4l5.8-5.8C33.5 6.2 28.1 4 22 4 12.1 4 4 12.1 4 22c0 3.1.8 6 2.3 8.5z"/><path fill="#FBBC05" d="M24 44c5.3 0 10.2-1.8 13.9-4.9l-6.4-5.2C29.3 35 24 35 18.8 33.8l-6.4 5.2C13.8 42.2 18.7 44 24 44z"/><path fill="#EA4335" d="M43.6 20.5H42V20.4H24v7.2h11.2C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l5.8-5.8C33.5 6.2 28.1 4 22 4 12.1 4 4 12.1 4 22s8.1 18 18 18c8.9 0 17.3-6.4 17.3-18 0-1.2-.1-2.1-.3-3.5z"/></g></svg>
          </span>
        </h2>
        <p className="text-sm font-cal-sans font-normal text-gray-400 mb-6">Manage your personal information and account details.</p>
        <div className="divide-y divide-gray-200 border-t border-b">
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Full Name</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{userData.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Email</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{userData.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Account Created</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{formatDate(userData.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Last Login</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{userData.lastLogin ? formatDate(userData.lastLogin) : "—"}</span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Account Type</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{userData.accountType || "—"}</span>
          </div>
          {userData.phone && (
            <div className="flex items-center justify-between py-5">
              <span className="text-gray-700">Phone</span>
              <span className="text-gray-900 flex-1 text-right mr-6">{userData.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Business Information Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            Business Information
            {/* Google Sheets Icon */}
            <span title="Stored in Google Sheets" className="ml-2">
              <svg width="20" height="20" viewBox="0 0 48 48"><g><rect width="34" height="40" x="7" y="4" fill="#0F9D58" rx="3"/><rect width="26" height="32" x="11" y="8" fill="#FFF" rx="2"/><rect width="18" height="6" x="15" y="12" fill="#34A853"/><rect width="18" height="6" x="15" y="22" fill="#34A853"/><rect width="18" height="6" x="15" y="32" fill="#34A853"/></g></svg>
            </span>
          </h2>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="text-primary font-medium hover:underline">Edit</Button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-6">These details appear on your invoices and documents.</p>
        <div className="divide-y divide-gray-200 border-t border-b">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Company Name</span>
                <span className="text-gray-900 flex-1 text-right mr-6">{businessData.companyName || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Business Email</span>
                <span className="text-gray-900 flex-1 text-right mr-6">{businessData.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Phone Number</span>
                <span className="text-gray-900 flex-1 text-right mr-6">{businessData.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Address</span>
                <span className="text-gray-900 flex-1 text-right mr-6">{businessData.address || "—"}</span>
              </div>
            </>
          ) : (
            <form onSubmit={handleBusinessUpdate} className="space-y-6 px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    required
                    value={businessData.companyName}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={businessData.email}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Business St, Suite 100, City, State, ZIP"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
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
                  className="min-w-[120px]"
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

      {/* Logout & Delete Account Section */}
      <div className="mb-12">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Logout & Delete Account</h2>
        <p className="text-sm text-gray-400 mb-6">You can log out of your account or permanently delete your account and all associated data.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleLogout} className="text-primary font-medium">Logout</Button>
          <Button variant="destructive" onClick={handleDeleteAccount} className="font-medium">Delete Account</Button>
        </div>
      </div>

    </div>
  )
}

