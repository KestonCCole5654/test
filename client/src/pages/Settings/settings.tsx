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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Checkbox } from '../../components/ui/checkbox'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInvoices, setDeleteInvoices] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const sheetUrl = typeof window !== 'undefined' ? localStorage.getItem("defaultSheetUrl") : ""

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
    setIsDeleting(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Authentication required");
      await axios.delete("https://sheetbills-server.vercel.app/api/delete-account", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token
        },
        data: {
          deleteInvoices: deleteInvoices,
          sheetUrl: sheetUrl || undefined
        }
      });
      await supabase.auth.signOut();
      toast({ title: "Account Deleted", description: "Your account and all data have been deleted." });
      navigate("/login");
    } catch (error) {
      toast({ title: "Delete Failed", description: error instanceof Error ? error.message : "Failed to delete account.", variant: "destructive" });
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setDeletePhrase("")
      setDeleteInvoices(false)
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <LoadingSpinner />
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
          <h2 className="text-2xl font-normal text-gray-900 flex items-center gap-2">
            Business Information
            {/* Google Sheets Icon */}
            <span title="Stored in Google Sheets" className="ml-2">
              <svg width="20" height="20" viewBox="0 0 48 48"><g><rect width="34" height="40" x="7" y="4" fill="#0F9D58" rx="3" /><rect width="26" height="32" x="11" y="8" fill="#FFF" rx="2" /><rect width="18" height="6" x="15" y="12" fill="#34A853" /><rect width="18" height="6" x="15" y="22" fill="#34A853" /><rect width="18" height="6" x="15" y="32" fill="#34A853" /></g></svg>
            </span>
          </h2>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="border border-gray-300 text-white bg-green-800 hover:bg-green-900 shadow-none">Edit</Button>
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
                  variant="default"
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

      {/* Legal Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-cal-sans font-medium text-gray-900 mb-1 flex items-center gap-2">
          Legal
        </h2>
        <p className="text-sm font-cal-sans font-normal text-gray-400 mb-6">View our Terms of Service and Privacy Policy.</p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => window.open('/legal?tab=terms', '_blank')}
            className="font-cal-sans"
          >
            View Terms of Service
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/legal?tab=privacy', '_blank')}
            className="font-cal-sans"
          >
            View Privacy Policy
          </Button>
        </div>
      </div>

      {/* Logout & Delete Account Section */}
      <div className="mb-12">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Logout & Delete Account</h2>
        <p className="text-sm text-gray-400 mb-6">You can log out of your account or permanently delete your account and all associated data.</p>
        <div className="flex gap-4">
          <Button onClick={handleLogout} className="border border-gray-300 text-white bg-green-800 hover:bg-green-900 shadow-none">Logout</Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)} className="font-medium">Delete Account</Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-red-700 font-semibold">This action is irreversible. Your account and all associated data will be permanently deleted.</p>
            <Checkbox id="delete-invoices" checked={deleteInvoices} onCheckedChange={checked => setDeleteInvoices(checked === true)} />
            <label htmlFor="delete-invoices" className="ml-2 text-gray-700">Also delete all my invoices stored in Google Sheets</label>
            {sheetUrl && (
              <div className="mt-2">
                <span className="text-gray-700">Your SheetBills Invoices Sheet: </span>
                <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{sheetUrl}</a>
              </div>
            )}
            <div className="mt-4">
              <label htmlFor="delete-phrase" className="block text-gray-700 mb-1">Type <span className="font-bold">DELETE</span> to confirm:</label>
              <Input
                id="delete-phrase"
                value={deletePhrase}
                onChange={e => setDeletePhrase(e.target.value)}
                placeholder="DELETE"
                className="w-full"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletePhrase !== "DELETE" || isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

