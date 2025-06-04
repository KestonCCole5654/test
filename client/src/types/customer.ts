export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company?: string
  notes?: string
  created_at: string
  status: "active" | "inactive"
  invoice_counts?: {
    paid: number
    unpaid: number
  }
  logo?: string
} 