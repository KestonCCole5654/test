"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { Toaster } from "./ui/toaster"
import {
  FileSpreadsheet,
  Loader2,
  ExternalLink,
  RefreshCw,
  Trash2,
  Search,
  Plus,
  CheckCircle,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { useNavigate } from "react-router-dom"
import supabase from "./Auth/supabaseClient"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import axios from "axios"

interface SheetData {
  id: string
  name: string
  createdAt: string
  description: string
  sheetUrl: string
  isDefault: boolean
}

type SortField = "name" | "createdAt" | "description" | "isDefault"
type SortDirection = "asc" | "desc"

export default function GoogleSheetsTable() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isCreatingSheet, setIsCreatingSheet] = useState(false)
  const [isLoadingSheets, setIsLoadingSheets] = useState(false)
  const [isDeletingSheet, setIsDeletingSheet] = useState<string | null>(null)
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null)
  const [sheetName, setSheetName] = useState("New Google Sheet")
  const [description, setDescription] = useState("")
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const fetchSheets = async () => {
    if (!supabase) return

    try {
      setIsLoadingSheets(true)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData?.session?.provider_token) {
        throw new Error("Missing Google authentication credentials")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/sheets", {
        headers: {
          Authorization: `Bearer ${sessionData.session.provider_token}`,
          "X-Supabase-Token": sessionData.session.access_token,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setSheets(data.sheets || [])
    } catch (error) {
      console.error("Sheets fetch error:", error)
      toast({
        title: "Loading Failed",
        description: error instanceof Error ? error.message : "Failed to load sheets",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSheets(false)
    }
  }

  // Filter sheets based on search query
  const filteredSheets = sheets
    .filter((sheet) => sheet.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Handle sorting
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleCreateSheet = async () => {
    try {
      setIsCreatingSheet(true)

      // Get Supabase session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error("Authentication required - Please sign in")
      }

      if (!session.provider_token) {
        throw new Error("Google authentication required - Reconnect your Google account")
      }

      // Create sheet with basic parameters
      const response = await axios.post(
        "https://sheetbills-server.vercel.app/api/create-sheet",
        {
          name: sheetName,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
            "Content-Type": "application/json",
          },
        },
      )

      toast({ title: "Sheet Created", description: "New Google Sheet created successfully" })
      fetchSheets()
      setSheetName("New Spreadsheet")
      setDescription("")
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Sheet creation error:", error)
      toast({
        title: "Creation Failed",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || error.message
          : error instanceof Error
            ? error.message
            : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreatingSheet(false)
    }
  }

  const handleDeleteSheet = async (sheetUrl: string, sheetName: string) => {
    try {
      setIsDeletingSheet(sheetUrl)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData?.session) {
        throw new Error("Session retrieval failed")
      }

      const session = sessionData.session

      const response = await fetch(`https://sheetbills-server.vercel.app/api/sheets/${encodeURIComponent(sheetUrl)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Delete failed")
      }

      setSheets((prev) => prev.filter((sheet) => sheet.sheetUrl !== sheetUrl))
      toast({ title: "Success", description: `"${sheetName}" moved to trash` })
    } catch (error) {
      console.error("Error deleting sheet:", error)
      toast({
        title: "Error",
        description: `Failed to delete: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsDeletingSheet(null)
    }
  }

  const handleSetDefaultSheet = async (sheetUrl: string, sheetName: string, sheetType?: string) => {
    try {
      // Prevent setting business sheets as default
      if (sheetType === "business" || sheetName.toLowerCase().includes("business")) {
        toast({
          title: "Not Allowed",
          description: "Business sheets cannot be set as default for invoices. Please select an invoice sheet instead.",
          variant: "destructive",
        })
        return
      }

      setIsSettingDefault(sheetUrl)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Authentication required")
      }

      // Check if Google OAuth token exists
      if (!session.provider_token) {
        toast({
          title: "Google Authentication Required",
          description: "You need to connect your Google account to use Google Sheets. Please sign in with Google.",
          variant: "destructive",
        })
        return
      }

      // Set the default sheet
      const response = await axios.put(
        "https://sheetbills-server.vercel.app/api/sheets/set-default",
        {
          sheetUrl,
          sheetType: "invoice", // Explicitly set type to ensure it's an invoice sheet
        },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`, // Google OAuth token
            "X-Supabase-Token": session.access_token, // Supabase token
            "X-Google-Token": session.provider_token, // Explicitly provide Google token
          },
        },
      )

      setSheets((prev) =>
        prev.map((sheet) => ({
          ...sheet,
          isDefault: sheet.sheetUrl === sheetUrl,
        })),
      )

      // Persist to localStorage
      localStorage.setItem("defaultSheetUrl", sheetUrl)
      localStorage.setItem("defaultSheetName", sheetName)
      localStorage.setItem("defaultSheetType", "invoice") // Explicitly store the type

      toast({ title: "Success", description: `"${sheetName}" is now the default sheet` })
    } catch (error) {
      console.error("Error setting default:", error)

      // Special error handling for no Google Sheets
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast({
          title: "No Google Sheets Found",
          description: "You need to create a Google Sheet to save your invoices.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description:
            axios.isAxiosError(error) && error.response?.data?.error
              ? error.response.data.error
              : "Failed to set default sheet",
          variant: "destructive",
        })
      }
    } finally {
      setIsSettingDefault(null)
    }
  }

  useEffect(() => {
    // Only run this when sheets actually exist
    if (sheets.length > 0) {
      // Retrieve default sheet URL from localStorage
      const defaultSheetUrl = localStorage.getItem("defaultSheetUrl")

      // First check if we need to update at all - is there a default sheet marked already?
      const hasDefaultAlready = sheets.some((sheet) => sheet.isDefault)

      // Only update if there's a default URL in storage AND no default is currently set
      if (defaultSheetUrl && !hasDefaultAlready) {
        // Set the default sheet in the UI
        setSheets((prev) =>
          prev.map((sheet) => ({
            ...sheet,
            isDefault: sheet.sheetUrl === defaultSheetUrl,
          })),
        )
      }
    }
  }, [sheets]) // Add sheets as a dependency

  // Load sheets on component mount
  useEffect(() => {
    const loadSheets = async () => {
      try {
        // First fetch the sheets without modifying them
        await fetchSheets()

        // Only after sheets are fully loaded, apply the default settings
        const defaultSheetUrl = localStorage.getItem("defaultSheetUrl")

        if (defaultSheetUrl) {
          // Use a functional update to safely modify state
          setSheets((prev) => {
            // Only update if we actually have sheets to prevent unnecessary renders
            if (prev.length === 0) return prev

            // Check if the default sheet exists in the loaded sheets
            const defaultSheetExists = prev.some((sheet) => sheet.sheetUrl === defaultSheetUrl)
            if (!defaultSheetExists) return prev

            // Update the sheets with the default flag
            return prev.map((sheet) => ({
              ...sheet,
              isDefault: sheet.sheetUrl === defaultSheetUrl,
            }))
          })
        }
      } catch (error) {
        console.error("Error loading sheets:", error)
      }
    }

    loadSheets()
  }, []) // Empty dependency array to run only once on mount

  // Helper function to check if a sheet is a business details sheet
  const isBusinessDetailsSheet = (sheet: SheetData) => {
    const nameOrDesc = (sheet.name + " " + sheet.description).toLowerCase()
    return (
      nameOrDesc.includes("business detail") ||
      nameOrDesc.includes("business info") ||
      nameOrDesc.includes("company detail") ||
      nameOrDesc.includes("company info")
    )
  }

  return (
    <div className="container max-w-7xl mt-8 py-6">
      <Toaster />

      <div className="flex justify-between items-center mb-6">
        <div className="mb-8">
          <h1 className="md:text-3xl text-2xl font-bold text-center md:text-left">
            Manage your <span className="text-green-600  md:text-3xl  text-md  font-bold ">{"Google Sheets"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the Google Sheets Page, here you can access create and manipluate your Google Sheets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchSheets} disabled={isLoadingSheets} className="gap-1.5">
            {isLoadingSheets ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Sheet
          </Button>
        </div>
      </div>

      {/* Default Sheet Information Section */}
      <div className="mb-8 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
           
          </div>
          <div>
            <h3 className="text-lg font-medium mb-1">Default Sheet</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Setting a sheet as default means it will be used automatically for all your invoices. When you create or
              manage invoices, they will be stored in this sheet.
            </p>

            {sheets.some((sheet) => sheet.isDefault) ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Current default: </span>
                  <span className="font-medium">{sheets.find((sheet) => sheet.isDefault)?.name || "Unknown"}</span>
                </div>
               
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                >
                  No Default Set
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Select "Set as Default" on any sheet to make it your default.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        {isLoadingSheets ? (
          <div className="text-center py-8 border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading sheets...</p>
          </div>
        ) : filteredSheets.length > 0 ? (
          <div className=" overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                    Sheet Name <ArrowUpDown className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Created <ArrowUpDown className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("description")} className="cursor-pointer">
                    Description <ArrowUpDown className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("isDefault")} className="cursor-pointer">
                    Status <ArrowUpDown className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSheets.map((sheet) => (
                  <TableRow key={sheet.id} className={sheet.isDefault ? "bg-green-50/50 dark:bg-green-950/20" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-md">{sheet.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">{new Date(sheet.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sheet.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {sheet.isDefault ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                        >
                          Default
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        >
                          Standard
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(sheet.sheetUrl, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Sheet
                          </DropdownMenuItem>

                          {!isBusinessDetailsSheet(sheet) && !sheet.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefaultSheet(sheet.sheetUrl, sheet.name)}
                              disabled={isSettingDefault === sheet.sheetUrl}
                            >
                              {isSettingDefault === sheet.sheetUrl ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Setting...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Set as Default
                                </>
                              )}
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleDeleteSheet(sheet.sheetUrl, sheet.name)}
                            disabled={isDeletingSheet === sheet.sheetUrl}
                            className="text-red-600"
                          >
                            {isDeletingSheet === sheet.sheetUrl ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">
              {searchQuery ? `No sheets match "${searchQuery}"` : "No Google Sheets connected"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          {filteredSheets.length} {filteredSheets.length === 1 ? "sheet" : "sheets"} connected
        </div>
      </div>

      {/* Create Sheet Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Google Sheet</DialogTitle>
            <DialogDescription>Create a new Google Sheet to integrate with your application.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-sheet-name">Sheet Name</Label>
              <Input
                id="modal-sheet-name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Enter sheet name"
                disabled={isCreatingSheet}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-description">Description (Optional)</Label>
              <Textarea
                id="modal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                disabled={isCreatingSheet}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreatingSheet}>
              Cancel
            </Button>
            <Button onClick={handleCreateSheet} disabled={isCreatingSheet || !sheetName.trim()}>
              {isCreatingSheet ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sheet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

