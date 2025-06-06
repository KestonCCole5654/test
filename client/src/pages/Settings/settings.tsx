"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { useToast } from "../../components/ui/use-toast"
import {
  Loader2,
  Edit,
  Save,
  X,
  User,
  Building2,
  Upload,
  ExternalLink,
  LogOut,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
} from "lucide-react"
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
import LogoUpload from "../../components/LogoUpload"
import { useUser } from "@supabase/auth-helpers-react"
import { supabase } from "../../lib/supabase"
import { useBrandLogo } from "../../hooks/useBrandLogo"

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
  const [deleteInvoices, setDeleteInvoices] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const sheetUrl = typeof window !== "undefined" ? localStorage.getItem("defaultSheetUrl") : ""
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [showLogoUpload, setShowLogoUpload] = useState(false)
  const [removingLogo, setRemovingLogo] = useState(false)
  const user = useUser()

  // Brand logo for business (using business email domain)
  const businessDomain = businessData.email?.split("@")[1] || ""
  const businessLogo = useBrandLogo(businessDomain)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session) {
        navigate("/sign-in")
        return
      }

      // Configure headers with both tokens
      const headers = {
        Authorization: `Bearer ${session.provider_token}`,
        "X-Supabase-Token": session.access_token,
      }

      // Fetch user data
      const userResponse = await axios.get("https://sheetbills-server.vercel.app/api/user", { headers })
      if (userResponse.data.user) {
        setUserData({
          name: userResponse.data.user.name,
          email: userResponse.data.user.email,
          avatarUrl: userResponse.data.user.avatarUrl,
          createdAt: userResponse.data.user.createdAt,
          lastLogin: userResponse.data.user.lastLogin,
          accountType: userResponse.data.user.accountType,
          phone: userResponse.data.user.phone,
        })
      }

      // Fetch business details
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected")
      }
      const businessResponse = await axios.get("https://sheetbills-server.vercel.app/api/business-details", {
        headers,
        params: { sheetUrl },
      })
      if (businessResponse.data.businessDetails) {
        setBusinessData({
          companyName: businessResponse.data.businessDetails["Company Name"] || "",
          email: businessResponse.data.businessDetails["Business Email"] || "",
          phone: businessResponse.data.businessDetails["Phone Number"] || "",
          address: businessResponse.data.businessDetails["Address"] || "",
        })
      }
    } catch (error) {
      console.error("Fetch error:", {
        error: axios.isAxiosError(error) ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
      })

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/sign-in")
        return
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const fetchDataWrapper = async () => {
      try {
        await fetchData()
      } catch (error) {
        if (isMounted) {
          console.error("Data fetch error:", error)
        }
      }
    }

    if (isMounted) {
      fetchDataWrapper()
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  // Fetch logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return
        const { data, error } = await supabase.from("user_business_settings").select("logo_url").single()
        if (!error && data?.logo_url) {
          setLogoUrl(data.logo_url)
        }
      } catch (err) {
        // Ignore
      }
    }
    fetchLogo()
  }, [supabase])

  const handleBusinessUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsUpdatingBusiness(true)

      // Get session and tokens
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error("Authentication required")
      }

      // Get the current sheet URL from localStorage
      const currentSheetUrl = localStorage.getItem("defaultSheetUrl")
      if (!currentSheetUrl) {
        throw new Error("No invoice spreadsheet selected")
      }

      const response = await axios.put(
        "https://sheetbills-server.vercel.app/api/update-business-details",
        {
          companyName: businessData.companyName,
          email: businessData.email,
          phone: businessData.phone,
          address: businessData.address,
          sheetUrl: currentSheetUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
          },
        },
      )

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Business details updated successfully",
        })
        await fetchData()
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Update Failed",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to update business details"
          : "Network error",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingBusiness(false)
    }
  }

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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast({ title: "Logged out", description: "You have been logged out successfully." })
      navigate("/login")
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "Failed to log out.",
        variant: "destructive",
      })
    }
  }

  // Remove logo handler
  const handleRemoveLogo = async () => {
    if (!logoUrl || !user?.id) return
    setRemovingLogo(true)
    try {
      // Extract the file path from the logo URL
      const urlParts = logoUrl.split("/")
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user.id}/${fileName}`

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage.from("company-logos").remove([filePath])
      if (storageError) throw storageError

      // Remove from user_business_settings
      const { error: dbError } = await supabase
        .from("user_business_settings")
        .update({ logo_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id)
      if (dbError) throw dbError

      // Remove from Google Sheet business details
      if (sheetUrl) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.provider_token) {
          await axios.put(
            "https://sheetbills-server.vercel.app/api/update-business-details",
            {
              logo: "",
              sheetUrl: sheetUrl,
            },
            {
              headers: {
                Authorization: `Bearer ${session.provider_token}`,
                "X-Supabase-Token": session.access_token,
              },
            },
          )
        }
      }

      setLogoUrl(null)
      setShowLogoUpload(true)
      toast({ title: "Logo removed", description: "You can now upload a new logo." })
    } catch (err) {
      toast({
        title: "Failed to remove logo",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setRemovingLogo(false)
    }
  }

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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb className="mb-4">
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

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-muted-foreground">Manage your account and business information</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatarUrl || "/placeholder.svg"} alt={userData.name} />
                  <AvatarFallback className="text-lg">
                    {userData.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Account Profile
                    <Badge variant="secondary" className="text-xs">
                      {userData.accountType || "Free Beta User"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Your personal account information and preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-sm text-muted-foreground">{userData.name || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{userData.email || "—"}</p>
                    </div>
                  </div>

                  {userData.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Phone Number</p>
                        <p className="text-sm text-muted-foreground">{userData.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(userData.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-sm text-muted-foreground">
                        {userData.lastLogin ? formatDate(userData.lastLogin) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Manage your business details for invoicing</CardDescription>
                  </div>
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
            </CardHeader>
            <CardContent>
              {/* Logo Section */}
              <div className="mb-6 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Company Logo</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your company logo to be displayed on all your invoices.
                </p>

                {logoUrl && !showLogoUpload ? (
                  <div className="flex items-center gap-4">
                    <div className="p-2 border rounded-lg bg-white">
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Company Logo"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveLogo} disabled={removingLogo}>
                      {removingLogo ? "Removing..." : "Change Logo"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <LogoUpload
                      onLogoUploaded={(url) => {
                        setLogoUrl(url)
                        setShowLogoUpload(false)
                      }}
                      showPreview={false}
                    />
                    {logoUrl && (
                      <Button variant="outline" size="sm" onClick={() => setShowLogoUpload(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Business Details */}
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        {businessLogo && (
                          <img
                            src={businessLogo || "/placeholder.svg"}
                            alt="Brand Logo"
                            className="h-6 w-6 rounded-full bg-white border"
                          />
                        )}
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Company Name</p>
                        <p className="text-sm text-muted-foreground">{businessData.companyName || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Business Email</p>
                        <p className="text-sm text-muted-foreground">{businessData.email || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Phone Number</p>
                        <p className="text-sm text-muted-foreground">{businessData.phone || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{businessData.address || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBusinessUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company Name *
                      </Label>
                      <Input
                        id="companyName"
                        required
                        value={businessData.companyName}
                        onChange={(e) => setBusinessData((prev) => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Business Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={businessData.email}
                        onChange={(e) => setBusinessData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={businessData.phone}
                        onChange={(e) => setBusinessData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={businessData.address}
                        onChange={(e) => setBusinessData((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Business St, Suite 100, City, State, ZIP"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdatingBusiness} className="min-w-[120px]">
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

          {/* Legal & Privacy Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Legal & Privacy</CardTitle>
                  <CardDescription>Review our terms of service and privacy policy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Terms of Service</p>
                      <p className="text-sm text-muted-foreground">Review our terms and conditions</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href="/legal?tab=terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Privacy Policy</p>
                      <p className="text-sm text-muted-foreground">How we protect your data</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href="/legal?tab=privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account session and data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Sign Out</p>
                    <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
