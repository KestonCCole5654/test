"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "./ui/use-toast"
import { Toaster } from "./ui/toaster"
import { Loader2, Edit, Save, X, Info, Calendar, Mail, User } from "lucide-react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Alert, AlertDescription } from "./ui/alert"
import supabase from "./Auth/supabaseClient"

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
    addressLine1: "",
    addressLine2: "",
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
      const businessResponse = await axios.get("https://sheetbills-server.vercel.app/api/business-details", { headers });
      if (businessResponse.data.businessDetails) {
        setBusinessData({
          companyName: businessResponse.data.businessDetails["Company Name"] || "",
          email: businessResponse.data.businessDetails["Business Email"] || "",
          phone: businessResponse.data.businessDetails["Phone Number"] || "",
          addressLine1: businessResponse.data.businessDetails["Address Line 1"] || "",
          addressLine2: businessResponse.data.businessDetails["Address Line 2"] || "",
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

      const response = await axios.put(
        "https://sheetbills-server.vercel.app/api/update-business-details", // Correct endpoint
        {
          companyName: businessData.companyName,
          email: businessData.email,
          phone: businessData.phone,
          addressLine1: businessData.addressLine1,
          addressLine2: businessData.addressLine2
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
        setIsEditing(false);
        fetchData(); // Refresh the data
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

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Account & Business Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4">
      {/* Premium Welcome Header for Settings */}
      <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 py-10 shadow-lg rounded-b-3xl mb-10">
        <div className="container max-w-3xl mx-auto flex flex-col items-center justify-center">
          <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg mb-4">
            {userData.avatarUrl ? (
              <AvatarImage src={userData.avatarUrl} alt={userData.name} />
            ) : (
              <AvatarFallback className="text-2xl">
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{userData.name || "—"}</span>
            <span className="bg-gradient-to-tr from-yellow-400 to-yellow-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md font-semibold border-2 border-white">
              PRO
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 text-center">
            Account & Business Settings
          </h1>
          <p className="text-lg text-emerald-50 text-center max-w-2xl">
            Manage your account, business profile, and billing details all in one place. Keep your information up to date for a seamless SheetBills experience.
          </p>
        </div>
      </div>

      {/* User Information Card */}
      <Card className="mb-8 shadow-lg border border-emerald-100">
        <CardHeader className="flex  mb-6 flex-row items-center justify-between bg-emerald-50 rounded-t-lg">
          <div>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>These details are used to identify you and your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 mt-6 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">Full Name</dt>
              <dd className="font-medium">{userData.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">Email</dt>
              <dd className="font-medium">{userData.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">Account Created</dt>
              <dd>{formatDate(userData.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">Last Login</dt>
              <dd>{userData.lastLogin ? formatDate(userData.lastLogin) : "—"}</dd>
            </div>
            {userData.phone && (
              <div>
                <dt className="text-sm text-muted-foreground flex items-center gap-1">Phone</dt>
                <dd>{userData.phone}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Business Information Card */}
      <Card className="shadow-lg border mb-6 border-emerald-100">
        <CardHeader className="flex  mb-6 flex-row items-center justify-between bg-emerald-50 rounded-t-lg">
          <div>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>These details appear on your invoices and documents</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" className="text-white" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button variant="outline" size="sm" className=" text-white" onClick={() => {
              setIsEditing(false);
              fetchData();
            }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Company Name</dt>
                <dd className="font-medium">{businessData.companyName || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Business Email</dt>
                <dd className="font-medium">{businessData.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone Number</dt>
                <dd>{businessData.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Address</dt>
                <dd>{businessData.addressLine1 || "—"}</dd>
                <dd>{businessData.addressLine2 || ""}</dd>
              </div>
            </dl>
          ) : (
            <form onSubmit={handleBusinessUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    required
                    value={businessData.companyName}
                    onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
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
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={businessData.addressLine1}
                    onChange={(e) => setBusinessData({ ...businessData, addressLine1: e.target.value })}
                    placeholder="123 Business St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={businessData.addressLine2}
                    onChange={(e) => setBusinessData({ ...businessData, addressLine2: e.target.value })}
                    placeholder="Suite 100, City, State, ZIP"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-600 text-white"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingBusiness}
                  className="min-w-[120px] bg-green-600 text-white hover:bg-green-700"
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
        </CardContent>
      </Card>
    </div>
  )
}

