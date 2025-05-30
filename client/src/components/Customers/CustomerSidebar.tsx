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
}

export function CustomerSidebar({ isOpen, onClose, onSubmit, isLoading }: CustomerSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:max-w-lg p-0 sm:p-6 overflow-y-auto"
        side="right"
      >
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xl font-semibold">Add New Customer</SheetTitle>
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
          <CustomerForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      </SheetContent>
    </Sheet>
  )
} 