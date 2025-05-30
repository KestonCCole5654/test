import React from "react"
import { useNavigate } from "react-router-dom"
import { CustomerForm } from "../../components/Customers/CustomerForm"
import { Button } from "../../components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewCustomerPage() {
  const navigate = useNavigate()

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Implement customer creation logic
      console.log("Creating customer:", data)
      // After successful creation, navigate back to customers list
      navigate("/customers")
    } catch (error) {
      console.error("Error creating customer:", error)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/customers")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Add New Customer</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CustomerForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
} 