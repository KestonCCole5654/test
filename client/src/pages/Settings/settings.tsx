import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../components/ui/use-toast";
import {
  Loader2,
  Edit,
  Save,
  X,
} from "lucide-react";
import axios from "axios";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { LoadingSpinner } from "../../components/ui/loadingSpinner";
import LogoUpload from "../../components/LogoUpload";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../../lib/supabase";
import { useBrandLogo } from "../../hooks/useBrandLogo";

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  accountType?: string;
  phone?: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    avatarUrl: "",
    createdAt: "",
    lastLogin: "",
    accountType: "Free Beta User",
    phone: "",
  });
  const [businessData, setBusinessData] = useState({
    companyName: "",
    phone: "",
    address: "",
    email: "",
  });
  const [isUpdatingBusiness, setIsUpdatingBusiness] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  //const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInvoices, setDeleteInvoices] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const sheetUrl =
    typeof window !== "undefined"
      ? localStorage.getItem("defaultSheetUrl")
      : "";
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const user = useUser();

  // Brand logo for business (using business email domain)
  const businessDomain = businessData.email?.split("@")[1] || "";
  const businessLogo = useBrandLogo(businessDomain);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate("/sign-in");
        return;
      }

      // Configure headers with both tokens
      const headers = {
        Authorization: `Bearer ${session.provider_token}`,
        "X-Supabase-Token": session.access_token,
      };

      // Fetch user data
      const userResponse = await axios.get(
        "https://sheetbills-server.vercel.app/api/user",
        { headers }
      );
      if (userResponse.data.user) {
        setUserData({
          name: userResponse.data.user.name,
          email: userResponse.data.user.email,
          avatarUrl: userResponse.data.user.avatarUrl,
          createdAt: userResponse.data.user.createdAt,
          lastLogin: userResponse.data.user.lastLogin,
          accountType: userResponse.data.user.accountType,
          phone: userResponse.data.user.phone,
        });
      }

      // Fetch business details
      // Always pass the current invoice spreadsheet URL as sheetUrl
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected");
      }
      const businessResponse = await axios.get(
        "https://sheetbills-server.vercel.app/api/business-details",
        {
          headers,
          params: { sheetUrl },
        }
      );
      if (businessResponse.data.businessDetails) {
        setBusinessData({
          companyName:
            businessResponse.data.businessDetails["Company Name"] || "",
          email: businessResponse.data.businessDetails["Business Email"] || "",
          phone: businessResponse.data.businessDetails["Phone Number"] || "",
          address: businessResponse.data.businessDetails["Address"] || "",
        });
      }
    } catch (error) {
      console.error("Fetch error:", {
        error: axios.isAxiosError(error) ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
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

  // Fetch logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase
          .from("user_business_settings")
          .select("logo_url")
          .single();
        if (!error && data?.logo_url) {
          setLogoUrl(data.logo_url);
        }
      } catch (err) {
        // Ignore
      }
    };
    fetchLogo();
  }, [supabase]);

  const handleBusinessUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdatingBusiness(true);

      // Get session and tokens
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

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
          sheetUrl: currentSheetUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
          },
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
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description:
          error instanceof Error ? error.message : "Failed to log out.",
        variant: "destructive",
      });
    }
  };


  // Remove logo handler
  const handleRemoveLogo = async () => {
    if (!logoUrl || !user?.id) return;
    setRemovingLogo(true);
    try {
      // Extract the file path from the logo URL
      const urlParts = logoUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("company-logos")
        .remove([filePath]);
      if (storageError) throw storageError;

      // Remove from user_business_settings
      const { error: dbError } = await supabase
        .from("user_business_settings")
        .update({ logo_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (dbError) throw dbError;

      // Remove from Google Sheet business details
      if (sheetUrl) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
            }
          );
        }
      }

      setLogoUrl(null);
      setShowLogoUpload(true);
      toast({
        title: "Logo removed",
        description: "You can now upload a new logo.",
      });
    } catch (err) {
      toast({
        title: "Failed to remove logo",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setRemovingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col justify-center items-center gap-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-onest max-w-7xl mx-auto mt-4 px-4">
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
      <div className="mb-12 pl-8 pr-8">
        <h2 className="text-2xl font-onest font-medium text-gray-900 mb-1 flex items-center gap-2">
          Account Profile
          {/* Google Icon */}
        </h2>
        <p className="text-sm font-onest font-normal text-gray-400 mb-6">
          Manage your personal information and account details.
        </p>
        <div className="divide-y divide-gray-200 border-t border-b">
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Full Name</span>
            <span className="text-gray-900 flex-1 text-right mr-6">
              {userData.name || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Email</span>
            <span className="text-gray-900 flex-1 text-right mr-6">
              {userData.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Account Created</span>
            <span className="text-gray-900 flex-1 text-right mr-6">
              {formatDate(userData.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Last Login</span>
            <span className="text-gray-900 flex-1 text-right mr-6">
              {userData.lastLogin ? formatDate(userData.lastLogin) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-gray-700">Account Type</span>
            <span className="text-gray-900 flex-1 text-right mr-6">
              {userData.accountType || "—"}
            </span>
          </div>
          {userData.phone && (
            <div className="flex items-center justify-between py-5">
              <span className="text-gray-700">Phone</span>
              <span className="text-gray-900 flex-1 text-right mr-6">
                {userData.phone}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Business Information Section */}
      <div className="mb-12 pl-8 pr-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-normal">Business Details</h2>
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

        {/* Logo Upload Section */}
        <div className="mb-6 pb-4">
          <h3 className="text-lg font-medium mb-4">Company Logo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload your company logo to be displayed on all your invoices. The
            logo will be automatically included in every invoice you create.
          </p>
          {logoUrl && !showLogoUpload ? (
            <div className="flex flex-col  items-center gap-4">
              <img
                src={logoUrl}
                alt="Company Logo"
                className="h-24 w-auto object-contain border rounded-lg shadow-sm bg-white"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRemoveLogo}
                  disabled={removingLogo}
                >
                  {removingLogo ? "Removing..." : "Change Logo"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col font-onest items-center gap-2">
              <LogoUpload
                onLogoUploaded={(url) => {
                  setLogoUrl(url);
                  setShowLogoUpload(false);
                }}
                showPreview={false}
              />
              {logoUrl && (
                <Button
                  variant="outline"
                  onClick={() => setShowLogoUpload(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200 border-t border-b">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700 flex items-center gap-3">
                  {businessLogo && (
                    <img
                      src={businessLogo}
                      alt="Brand Logo"
                      className="h-8 w-8 rounded-full bg-white border border-gray-200"
                    />
                  )}
                  Company Name
                </span>
                <span className="text-gray-900 flex-1 text-right mr-6">
                  {businessData.companyName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Business Email</span>
                <span className="text-gray-900 flex-1 text-right mr-6">
                  {businessData.email || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Phone Number</span>
                <span className="text-gray-900 flex-1 text-right mr-6">
                  {businessData.phone || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-5">
                <span className="text-gray-700">Address</span>
                <span className="text-gray-900 flex-1 text-right mr-6">
                  {businessData.address || "—"}
                </span>
              </div>
            </>
          ) : (
            <form
              onSubmit={handleBusinessUpdate}
              className="space-y-6 px-4 py-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="flex items-center gap-3"
                  >
                    {businessLogo && (
                      <img
                        src={businessLogo}
                        alt="Brand Logo"
                        className="h-8 w-8 rounded-full bg-white border border-gray-200"
                      />
                    )}
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    required
                    value={businessData.companyName}
                    onChange={(e) =>
                      setBusinessData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setBusinessData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={businessData.phone}
                    onChange={(e) =>
                      setBusinessData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={businessData.address}
                    onChange={(e) =>
                      setBusinessData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
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

      {/* Terms & Privacy Policy Section */}
      <div className="mb-12 pl-8 pr-8">
        <h2 className="text-2xl font-onest font-medium text-gray-900 mb-1 flex items-center gap-2">
          Terms & Privacy Policy
        </h2>
        <p className="text-sm font-onest font-normal text-gray-400 mb-6">
          View our Terms of Service and Privacy Policy.
        </p>
        <div className="divide-y divide-gray-200 border-t border-b">
          <div className="py-5">
            <a
              href="/legal?tab=terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 font-medium hover:underline"
            >
              Terms of Service
            </a>
          </div>
          <div className="py-5">
            <a
              href="/legal?tab=privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 font-medium hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* Logout & Delete Account Section */}
      <div className="mb-12 pl-8 pr-8">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Logout</h2>
        <p className="text-sm text-gray-400 mb-6">
          You can log out of your account or permanently delete your account and
          all associated data.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={handleLogout}
            className="border border-gray-300 text-white bg-green-800 hover:bg-green-900 shadow-none"
          >
            Logout
          </Button>
          {/* <Button variant="destructive" onClick={() => setShowDeleteModal(true)} className="font-medium">Delete Account</Button> */}
        </div>
      </div>
    </div>
  );
}
