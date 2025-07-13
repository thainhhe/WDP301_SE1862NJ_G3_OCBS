"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Search, Monitor, AlertCircle, Users, Eye, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TheaterForm from "@/components/admin/TheaterForm"
import SeatLayoutViewer from "@/components/admin/SeatLayoutViewer"
import { theaterService } from "@/services/theaterService"
import { theaterService as seatService } from "@/services/seatService"

const TheaterManagement = () => {
    const [theaters, setTheaters] = useState([])
    const [seatLayouts, setSeatLayouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showSeatLayoutModal, setShowSeatLayoutModal] = useState(false)
    const [editingTheater, setEditingTheater] = useState(null)
    const [theaterToDelete, setTheaterToDelete] = useState(null)
    const [selectedTheaterLayout, setSelectedTheaterLayout] = useState(null)

    // Filter states
    const [filters, setFilters] = useState({
        search: "",
    })

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Fetch seat layouts
    const fetchSeatLayouts = useCallback(async () => {
        try {
            const data = await seatService.getSeatLayouts()
            setSeatLayouts(data || [])
        } catch (err) {
            console.error("Failed to fetch seat layouts:", err)
        }
    }, [])

    // Fetch theaters
    const fetchTheaters = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = {
                name: filters.search || undefined,
            }
            const data = await theaterService.getTheaters(params)
            setTheaters(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch theaters:", err)
            setError("Failed to load theaters. Please try again.")
            setTheaters([])
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchSeatLayouts()
        fetchTheaters()
    }, [fetchSeatLayouts, fetchTheaters])

    // Clear messages after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [success])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setCurrentPage(1)
    }

    // Handle theater actions
    const handleCreateTheater = () => {
        setEditingTheater(null)
        setShowFormModal(true)
    }

    const handleEditTheater = (theater) => {
        setEditingTheater(theater)
        setShowFormModal(true)
    }

    const handleDeleteTheater = (theater) => {
        setTheaterToDelete(theater)
        setShowDeleteDialog(true)
    }

    const handleViewSeatLayout = (theater) => {
        setSelectedTheaterLayout(theater)
        setShowSeatLayoutModal(true)
    }

    // Form submission
    const handleFormSubmit = async (formData) => {
        try {
            setError(null)

            const theaterData = {
                name: formData.name,
                capacity: Number(formData.capacity),
                seatLayout: formData.seatLayout,
            }

            if (editingTheater) {
                await theaterService.updateTheater(editingTheater._id, theaterData)
                setSuccess("Theater updated successfully!")
            } else {
                await theaterService.createTheater(theaterData)
                setSuccess("Theater created successfully!")
            }

            setShowFormModal(false)
            fetchTheaters()
        } catch (err) {
            console.error("Error saving theater:", err)
            setError(`Failed to save theater: ${err.message}`)
        }
    }

    // Delete confirmation
    const confirmDeleteTheater = async () => {
        if (!theaterToDelete) return

        try {
            setError(null)
            await theaterService.deleteTheater(theaterToDelete._id)
            setSuccess("Theater deleted successfully!")
            setShowDeleteDialog(false)
            setTheaterToDelete(null)
            fetchTheaters()
        } catch (err) {
            console.error("Error deleting theater:", err)
            setError(`Failed to delete theater: ${err.message}`)
        }
    }

    // Filter theaters
    const filteredTheaters = theaters.filter((theater) => {
        const matchesSearch = theater.name.toLowerCase().includes(filters.search.toLowerCase())
        return matchesSearch
    })

    // Pagination
    const totalPages = Math.ceil(filteredTheaters.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedTheaters = filteredTheaters.slice(startIndex, startIndex + itemsPerPage)

    // Get seat layout name
    const getSeatLayoutName = (seatLayoutId) => {
        const layout = seatLayouts.find((l) => l._id === seatLayoutId)
        return layout ? layout.name : "N/A"
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-red-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-3xl font-bold text-gray-800 flex items-center">
                            <Monitor className="mr-3 h-8 w-8 text-red-600" />
                            Theater Management
                        </CardTitle>
                        <p className="text-gray-600 mt-2">Manage theaters and their seating configurations</p>
                    </div>
                    <Button
                        onClick={handleCreateTheater}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center shadow-md"
                        size="lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Theater
                    </Button>
                </CardHeader>
            </Card>

            {/* Alerts */}
            {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Monitor className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Theaters</p>
                                <p className="text-2xl font-bold text-gray-900">{theaters.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {theaters.reduce((sum, theater) => sum + (theater.capacity || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Settings className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Seat Layouts</p>
                                <p className="text-2xl font-bold text-gray-900">{seatLayouts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search theaters by name..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theater Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p className="mt-4 text-gray-600">Loading theaters...</p>
                        </div>
                    ) : filteredTheaters.length === 0 ? (
                        <div className="text-center py-12">
                            <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No theaters found</h3>
                            <p className="text-gray-500 mb-4">
                                {filters.search
                                    ? "Try adjusting your search to see more results."
                                    : "Get started by adding your first theater."}
                            </p>
                            <Button onClick={handleCreateTheater} className="bg-red-600 hover:bg-red-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Theater
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">Theater Name</TableHead>
                                        <TableHead className="font-semibold">Capacity</TableHead>
                                        <TableHead className="font-semibold">Seat Layout</TableHead>
                                        <TableHead className="font-semibold">Created</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTheaters.map((theater) => (
                                        <TableRow key={theater._id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="font-medium text-red-600">{theater.name}</div>
                                                <div className="text-sm text-gray-500">ID: {theater._id}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                    {theater.capacity} seats
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {theater.seatLayout ? (
                                                    <div className="flex items-center">
                                                        <Settings className="w-4 h-4 mr-2 text-green-600" />
                                                        <span className="text-green-600">
                              {typeof theater.seatLayout === "object"
                                  ? theater.seatLayout.name
                                  : getSeatLayoutName(theater.seatLayout)}
                            </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                                                        <span className="text-orange-500">Not configured</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {theater.createdAt ? new Date(theater.createdAt).toLocaleDateString() : "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {theater.seatLayout && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewSeatLayout(theater)}
                                                            title="View Seat Layout"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditTheater(theater)}
                                                        title="Edit Theater"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteTheater(theater)}
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Delete Theater"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-gray-700">
                                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTheaters.length)} of{" "}
                                        {filteredTheaters.length} theaters
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="flex items-center px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Theater Form Modal */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{editingTheater ? "Edit Theater" : "Create New Theater"}</DialogTitle>
                        <DialogDescription>
                            {editingTheater ? "Update the theater details below." : "Fill in the details to create a new theater."}
                        </DialogDescription>
                    </DialogHeader>
                    <TheaterForm
                        theater={editingTheater}
                        seatLayouts={seatLayouts}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowFormModal(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Seat Layout Viewer Modal */}
            <Dialog open={showSeatLayoutModal} onOpenChange={setShowSeatLayoutModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Seat Layout - {selectedTheaterLayout?.name}</DialogTitle>
                        <DialogDescription>View the seating arrangement and layout details for this theater.</DialogDescription>
                    </DialogHeader>
                    {selectedTheaterLayout && (
                        <SeatLayoutViewer
                            layout={
                                typeof selectedTheaterLayout.seatLayout === "object"
                                    ? selectedTheaterLayout.seatLayout
                                    : seatLayouts.find((l) => l._id === selectedTheaterLayout.seatLayout)
                            }
                        />
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSeatLayoutModal(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl text-red-600">Delete Theater</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the theater "{theaterToDelete?.name}"? This action cannot be undone and
                            will permanently remove all associated data including showtimes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteTheater} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Theater
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TheaterManagement
