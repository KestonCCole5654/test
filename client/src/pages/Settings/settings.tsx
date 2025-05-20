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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import supabase from "../../components/Auth/supabaseClient"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

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
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Profile Section */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Profile</h2>
        <p className="text-sm text-gray-400 mb-6">Manage your personal information and account details.</p>
        <div className="divide-y divide-gray-200 border-t border-b">
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Full name</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{userData.name || "—"}</span>
            <a href="#" className="text-primary font-medium hover:underline">Update</a>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Email address</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{userData.email || "—"}</span>
            <a href="#" className="text-primary font-medium hover:underline">Update</a>
          </div>
          {userData.phone && (
            <div className="flex items-center justify-between py-5">
              <span className="text-gray-700">Phone</span>
              <span className="text-gray-900 flex-1 text-right mr-6">{userData.phone}</span>
              <a href="#" className="text-primary font-medium hover:underline">Update</a>
            </div>
          )}
        </div>
      </div>

      {/* Business Information Section */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Business Information</h2>
        <p className="text-sm text-gray-400 mb-6">These details appear on your invoices and documents.</p>
        <div className="divide-y divide-gray-200 border-t border-b">
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Company Name</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{businessData.companyName || "—"}</span>
            <a href="#" className="text-primary font-medium hover:underline">Edit</a>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Business Email</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{businessData.email || "—"}</span>
            <a href="#" className="text-primary font-medium hover:underline">Edit</a>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Phone Number</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{businessData.phone || "—"}</span>
            <a href="#" className="text-primary font-medium hover:underline">Edit</a>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Address</span>
            <span className="text-gray-900 flex-1 text-right mr-6">{businessData.address || "—"}</span>
            <a href="#" className="text-primary font-medium hover:underline">Edit</a>
          </div>
        </div>
      </div>

      {/* Add more sections here as needed, following the same concept */}
    </div>
  )
}

