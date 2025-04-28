"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "./ui/use-toast"
import { Toaster } from "./ui/toaster"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { Switch } from "./ui/switch"
import { Loader2, Upload, FileText, Eye, ArrowLeft, Trash2, Plus, Check, AlertCircle, FileUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import axios from "axios"

interface Template {
  id: string
  name: string
  description: string
  fileUrl: string
  isDefault: boolean
  createdAt: string
  thumbnailUrl?: string
}

export default function InvoiceTemplatePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    makeDefault: false,
    file: null as File | null,
    previewUrl: "",
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("http://localhost:5000/api/invoice-templates")
      setTemplates(response.data.templates || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to load invoice templates.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      })
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview URL for PDF files
    let previewUrl = ""
    if (file.type === "application/pdf") {
      previewUrl = URL.createObjectURL(file)
    }

    setNewTemplate({
      ...newTemplate,
      file,
      name: file.name.split(".")[0], // Set default name to filename without extension
      previewUrl,
    })
  }

  const handleUpload = async () => {
    if (!newTemplate.file || !newTemplate.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a template name and file.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", newTemplate.file)
      formData.append("name", newTemplate.name)
      formData.append("description", newTemplate.description)
      formData.append("makeDefault", newTemplate.makeDefault.toString())

      const response = await axios.post("http://localhost:5000/api/upload-invoice-template", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "Template Uploaded",
        description: "Your invoice template has been uploaded successfully.",
      })

      // Reset form and refresh templates
      setNewTemplate({
        name: "",
        description: "",
        makeDefault: false,
        file: null,
        previewUrl: "",
      })

      fetchTemplates()
      setActiveTab("existing")
    } catch (error) {
      console.error("Error uploading template:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your template.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleSetDefaultTemplate = async (templateId: string) => {
    try {
      setIsSaving(true)

      await axios.post("http://localhost:5000/api/set-default-template", {
        templateId,
      })

      // Update local state
      setTemplates((prev) =>
        prev.map((template) => ({
          ...template,
          isDefault: template.id === templateId,
        })),
      )

      toast({
        title: "Default Template Updated",
        description: "Your default invoice template has been updated.",
      })
    } catch (error) {
      console.error("Error setting default template:", error)
      toast({
        title: "Error",
        description: "Failed to set default template.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setIsSaving(true)

      await axios.delete(`http://localhost:5000/api/invoice-templates/${templateId}`)

      // Update local state
      setTemplates((prev) => prev.filter((template) => template.id !== templateId))
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }

      toast({
        title: "Template Deleted",
        description: "The invoice template has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleContinueToInvoice = () => {
    if (selectedTemplate) {
      navigate("/create-invoice", {
        state: { templateId: selectedTemplate.id },
      })
    } else {
      toast({
        title: "No Template Selected",
        description: "Please select a template to continue.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-12">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading invoice templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <Toaster />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Invoice Templates</h1>
        </div>

        <Button onClick={handleContinueToInvoice} disabled={!selectedTemplate}>
          Continue to Invoice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload New Template</TabsTrigger>
          <TabsTrigger value="existing">Existing Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Invoice Template</CardTitle>
              <CardDescription>Upload a PDF or Word document to use as your invoice template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Standard Invoice Template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Brief description of this template"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="make-default"
                    checked={newTemplate.makeDefault}
                    onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, makeDefault: checked })}
                  />
                  <Label htmlFor="make-default">Make this my default template</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Template File</Label>

                {!newTemplate.file ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileUp className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">PDF or Word document (max 5MB)</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{newTemplate.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(newTemplate.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewTemplate({ ...newTemplate, file: null, previewUrl: "" })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {newTemplate.previewUrl && (
                      <div className="mt-4">
                        <Label className="mb-2 block">Preview</Label>
                        <div className="border rounded h-[300px] overflow-hidden">
                          <iframe src={newTemplate.previewUrl} className="w-full h-full" title="Template Preview" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!newTemplate.file && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Template Requirements</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                      <li>Use PDF or Word format (.pdf, .doc, .docx)</li>
                      <li>
                        Include placeholders for dynamic content (e.g., {"{{invoice_number}}"}, {"{{customer_name}}"})
                      </li>
                      <li>Maximum file size: 5MB</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewTemplate({
                    name: "",
                    description: "",
                    makeDefault: false,
                    file: null,
                    previewUrl: "",
                  })
                }}
              >
                Clear
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !newTemplate.file || !newTemplate.name.trim()}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Template
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="existing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.length > 0 ? (
              <>
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id ? "ring-2 ring-primary" : "hover:shadow-md"
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-[160px] bg-muted rounded-t-lg overflow-hidden">
                        {template.thumbnailUrl ? (
                          <img
                            src={template.thumbnailUrl || "/placeholder.svg"}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        {template.isDefault && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Default
                          </div>
                        )}
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-2">
                              <Check className="h-6 w-6" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{template.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                          {template.description || "No description provided"}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(template.fileUrl, "_blank")
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <div className="flex gap-1">
                            {!template.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSetDefaultTemplate(template.id)
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Template Card */}
                <Card className="cursor-pointer hover:shadow-md border-dashed" onClick={() => setActiveTab("upload")}>
                  <CardContent className="flex flex-col items-center justify-center h-[280px] text-center p-6">
                    <div className="bg-muted rounded-full p-4 mb-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Add New Template</h3>
                    <p className="text-sm text-muted-foreground mt-2">Upload a custom invoice template</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Templates Found</h3>
                <p className="text-muted-foreground mt-1 mb-6">You haven't uploaded any invoice templates yet</p>
                <Button onClick={() => setActiveTab("upload")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Template
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

