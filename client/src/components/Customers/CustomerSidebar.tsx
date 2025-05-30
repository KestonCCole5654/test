import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet"
import { CustomerForm } from "./CustomerForm"
import { X } from "lucide-react"
import { Button } from "../ui/button"

interface CustomerSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
  mode?: "create" | "edit"
  initialData?: any
}

export function CustomerSidebar({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading,
  mode = "create",
  initialData
}: CustomerSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:max-w-lg p-0 sm:p-6 overflow-y-auto"
        side="right"
      >
        <div className="bg-white border-b px-6 py-4">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xl font-normal">
              {mode === "create" ? "New Customer" : "Edit Customer"}
            </SheetTitle>

            <p className="text-sm text-gray-500">
              {mode === "create" 
                ? "Enter your customer's details below. This will be used to create a new customer record."
                : "Update your customer's information below."}
            </p>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
        </div>
        <div className="px-6 py-4">
          <CustomerForm 
            onSubmit={onSubmit} 
            isLoading={isLoading} 
            mode={mode}
            initialData={initialData}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
} 