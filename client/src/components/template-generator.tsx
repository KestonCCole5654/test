"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { FontFamilyPicker } from "./ui/font-family-picker"
import { toast } from "./ui/use-toast"
import { Loader2, Save, ArrowLeft, Image, Layout, Palette, Type, Sparkles, Wand2, Bot, Lightbulb, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import supabase from "./Auth/supabaseClient"

interface TemplateSettings {
  name: string
  description: string
  fontFamily: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  logoUrl: string
  layout: "modern" | "classic" | "minimal"
  headerText: string
  footerText: string
  showTax: boolean
  showDiscount: boolean
  showNotes: boolean
}

export default function TemplateGenerator() {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    name: "",
    description: "",
    fontFamily: "Inter",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    backgroundColor: "#ffffff",
    logoUrl: "",
    layout: "modern",
    headerText: "Invoice",
    footerText: "Thank you for your business!",
    showTax: true,
    showDiscount: true,
    showNotes: true
  })

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.match(/image.*/)) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file.",
          variant: "destructive",
        })
        return
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setUploadedImage(previewUrl)

      toast({
        title: "Image Uploaded",
        description: "Your design inspiration has been uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Implement save functionality
      toast({
        title: "Template Saved",
        description: "Your invoice template has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      // TODO: Implement AI generation functionality
      toast({
        title: "Coming Soon!",
        description: "AI-powered template generation will be available soon.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Feature not yet available.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* Premium Welcome Header */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-600 to-emerald-400 py-10 shadow-lg rounded-b-3xl">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-6">
           
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                {user?.user_metadata?.avatar_url ? (
                  <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
                ) : (
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="absolute bottom-0 right-0 bg-gradient-to-tr from-yellow-400 to-yellow-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md font-semibold border-2 border-white">
                PRO
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white drop-shadow-lg flex items-center gap-2">
                AI Template Generator
                <span className="ml-2 animate-bounce text-yellow-300 text-2xl">✨</span>
              </h2>
              <p className="text-slate-100 mt-2 text-lg font-medium">
                Create stunning invoice templates with AI
              </p>
            </div>
          </div>
          
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Upcoming Feature Alert */}
        <Alert className="mb-8 bg-yellow-50 border-yellow-200">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This is an upcoming feature! Our AI-powered template generator will be available soon. Stay tuned for updates.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Generation Card */}
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-green-600" />
                Generate with AI
              </CardTitle>
              <CardDescription>
                Let our AI create a custom template based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Describe your ideal invoice template and let our AI do the rest. 
                  Specify colors, layout, and style preferences.
                </p>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadedImage ? (
                          <div className="relative w-full h-full">
                            <img
                              src={uploadedImage}
                              alt="Uploaded design"
                              className="w-full h-full object-contain rounded-lg"
                            />
                            <button
                              onClick={() => setUploadedImage(null)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                          </>
                        )}
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-purple-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Template
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI Preview
              </CardTitle>
              <CardDescription>
                See how AI can transform your invoice design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[1/1.414] bg-gradient-to-br from-gray-50 to-gray-100 border rounded-lg shadow-lg p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Bot className="h-12 w-12 mx-auto text-green-600" />
                  <p className="text-gray-500">
                    AI-generated preview will be available soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 