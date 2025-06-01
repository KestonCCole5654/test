"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Loader2, Send } from "lucide-react"
import { toast } from "../../components/ui/use-toast"
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

export default function ContactPage() {
  const navigate = useNavigate()
  const supabase = useSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [sentData, setSentData] = useState({ subject: "", message: "", email: "" })
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    email: "",
  })

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email! }))
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      const response = await fetch("https://sheetbills-server.vercel.app/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          userName: user?.user_metadata?.full_name || user?.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setSentData(formData)
      setShowSummary(true)

      setFormData({
        subject: "",
        message: "",
        email: user?.email || "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSummary) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-normal  mb-4">Message Sent!</h2>
          <p className="mb-2">Thank you for contacting us. Our support team will get back to you soon.</p>
          <Button className="mt-6 border border-gray-300 text-white bg-green-800 hover:bg-green-900 shadow-none"  onClick={() => setShowSummary(false)}>
            Send Another Message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-medium">Contact Us</CardTitle>
              <CardDescription className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!user?.email}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="What's this about?"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="Describe your issue or question in detail..."
                    className="min-h-[200px]"
                  />
                </div>
                <Button
                  variant="outline"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-medium">Support Information</CardTitle>
              <CardDescription className="text-gray-600">
                For general inquiries and support, email us at support@sheetbills.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-700 font-medium mb-2">
                We typically respond to all inquiries within 24-48 hours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 