"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, MapPin, Clock, Building, AlertCircle, Phone, Mail, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataTable } from "@/components/ui/data-table"
import BranchForm from "@/components/admin/BranchForm"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { branchService } from "../../services/branchService"

const AdminBranches = () => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingBranch, setViewingBranch] = useState(null)

  const [filters, setFilters] = useState({
    search: "",
    province: "all",
    city: "all",
    isActive: "all"
  })
  const [availableProvinces, setAvailableProvinces] = useState([])
  const fetchBranches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // First, fetch all branches without filters
      const allBranches = await branchService.getBranches({})
      const provinces = [...new Set(allBranches.map((b) => b.location?.province).filter(Boolean))]
      setAvailableProvinces(provinces)

      // Only apply filters if they are explicitly set
      const params = {}
      if (filters.search) params.name = filters.search
      if (filters.province && filters.province !== "all") params.location_province = filters.province

      const filteredData = await branchService.getBranches(params)
      let finalData = filteredData

      if (filters.isActive && filters.isActive !== "all") {
        const isActiveFilter = filters.isActive === "true"
        finalData = filteredData.filter((branch) => branch.isActive === isActiveFilter)
      }

      setBranches(finalData)
    } catch (err) {
      console.error("Failed to fetch branches:", err)
      setError("Failed to load branches. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters])
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const handleCreateBranch = () => {
    setEditingBranch(null)
    setShowFormModal(true)
  }

  const handleEditBranch = (branch) => {
    setEditingBranch(branch)
    setShowFormModal(true)
  }

  const handleViewBranch = (branch) => {
    setViewingBranch(branch)
    setShowViewModal(true)
  }

  const handleDeleteBranch = (branch) => {
    console.log("Delete button clicked for branch:", branch.name)
    setBranchToDelete(branch)
    setShowDeleteDialog(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id, formData)
      } else {
        await branchService.createBranch(formData)
      }
      setShowFormModal(false)
      fetchBranches()
    } catch (err) {
      console.error("Error saving branch:", err)
      setError(`Failed to save branch: ${err.response?.data?.message || err.message}`)
    }
  }

  const confirmDeleteBranch = async () => {
    if (!branchToDelete) return
    try {
      console.log("Deleting branch:", branchToDelete.name)
      await branchService.deleteBranch(branchToDelete._id)
      setShowDeleteDialog(false)
      setBranchToDelete(null)
      fetchBranches()
    } catch (err) {
      console.error("Error deleting branch:", err)
      setError(`Failed to delete branch: ${err.response?.data?.message || err.message}`)
      setShowDeleteDialog(false)
      setBranchToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    console.log("Delete cancelled")
    setShowDeleteDialog(false)
    setBranchToDelete(null)
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => <div className="font-medium text-red-600">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("location")
        return (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <div className="font-medium">{location?.province || "N/A"}</div>
                <div className="text-sm text-gray-500 max-w-[200px] truncate">{location?.address || "No address"}</div>
              </div>
            </div>
        )
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const contact = row.getValue("contact")
        return (
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                {contact?.phone || "N/A"}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                <span className="max-w-[150px] truncate">{contact?.email || "N/A"}</span>
              </div>
            </div>
        )
      },
    },
    {
      accessorKey: "operatingHours",
      header: "Hours",
      cell: ({ row }) => {
        const hours = row.getValue("operatingHours")
        return (
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {hours?.open || "09:00"} - {hours?.close || "23:00"}
            </div>
        )
      },
    },
    {
      accessorKey: "facilities",
      header: "Facilities",
      cell: ({ row }) => {
        const facilities = row.getValue("facilities") || []
        return (
            <div className="flex flex-wrap gap-1">
              {facilities.slice(0, 2).map((facility, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {facility}
                  </Badge>
              ))}
              {facilities.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{facilities.length - 2} more
                  </Badge>
              )}
            </div>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive")
        return (
            <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const branch = row.original
        return (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleViewBranch(branch)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEditBranch(branch)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDeleteBranch(branch)
                  }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
        )
      },
    },
  ]

  return (
      <div className="container mx-auto p-6">
        <Card className="mb-6 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center">
              <Building className="mr-3 h-8 w-8 text-red-600" />
              Branch Management
            </CardTitle>
            <Button
                onClick={handleCreateBranch}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Branch
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={filters.province} onValueChange={(value) => setFilters((prev) => ({ ...prev, province: value }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {availableProvinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                  value={filters.isActive}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, isActive: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading && branches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading branches...</p>
                </div>
            ) : branches.length > 0 ? (
                <DataTable columns={columns} data={branches} searchKey="name" searchPlaceholder="Search branches..." />
            ) : (
                <Card className="text-center py-10 border-dashed border-2 border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center">
                    <div className="text-gray-500 mb-4">
                      <Building className="mx-auto h-12 w-12" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
                    <p className="text-gray-500 mb-4">
                      {filters.search || filters.isActive !== "all" || filters.city !== "all"
                          ? "Try adjusting your filters to see more results."
                          : "Get started by adding your first branch."}
                    </p>
                    <Button onClick={handleCreateBranch} className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Branch
                    </Button>
                  </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>

        {showFormModal && (
            <BranchForm
                branch={editingBranch}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowFormModal(false)}
            />
        )}

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Branch Details</DialogTitle>
            </DialogHeader>
            {viewingBranch && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg font-semibold">{viewingBranch.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <Badge
                            variant={viewingBranch.isActive ? "default" : "secondary"}
                            className={viewingBranch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                        >
                          {viewingBranch.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p>{viewingBranch.location?.city || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Province</label>
                      <p>{viewingBranch.location?.province || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p>{viewingBranch.location?.address || "N/A"}</p>
                  </div>

                  {viewingBranch.location?.coordinates && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Latitude</label>
                          <p>{viewingBranch.location.coordinates.latitude || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Longitude</label>
                          <p>{viewingBranch.location.coordinates.longitude || "N/A"}</p>
                        </div>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p>{viewingBranch.contact?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p>{viewingBranch.contact?.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Opening Hours</label>
                      <p>
                        {viewingBranch.operatingHours?.open || "09:00"} - {viewingBranch.operatingHours?.close || "23:00"}
                      </p>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Facilities</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {viewingBranch.facilities && viewingBranch.facilities.length > 0 ? (
                          viewingBranch.facilities.map((facility, index) => (
                              <Badge key={index} variant="outline">
                                {facility}
                              </Badge>
                          ))
                      ) : (
                          <p className="text-gray-500">No facilities listed</p>
                      )}
                    </div>
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
            open={showDeleteDialog}
            onClose={handleCancelDelete}
            onConfirm={confirmDeleteBranch}
            title="Delete Branch"
            message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
        />
      </div>
  )
}

export default AdminBranches
