"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  Users,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  DollarSign,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import ShowtimeForm from "../../components/admin/ShowtimeForm"
import { showtimeService, movieService } from "../../services/showtimeService"

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingShowtime, setEditingShowtime] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showtimeToDelete, setShowtimeToDelete] = useState(null)
  const [selectedShowtimes, setSelectedShowtimes] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    movieId: "all",
    branchId: "all",
    theaterId: "all",
    date: "",
    search: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    branches: 0,
    movies: 0,
    theaters: 0,
    revenue: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    fetchData()
  }, [filters, pagination.page])

  // Enhanced fetchData with better error handling and loading states
  const fetchData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log("🔄 Fetching admin showtime data...")

      // Build search parameters
      const searchParams = {
        page: pagination.page,
        limit: 50,
        query: filters.search,
        movieId: filters.movieId !== "all" ? filters.movieId : undefined,
        branchId: filters.branchId !== "all" ? filters.branchId : undefined,
        theaterId: filters.theaterId !== "all" ? filters.theaterId : undefined,
        dateFrom: filters.date ? filters.date : undefined,
        dateTo: filters.date ? filters.date : undefined,
        sort: "-createdAt",
      }

      // Fetch data using enhanced CRUD operations
      const [showtimesResult, moviesResult, statsResult] = await Promise.allSettled([
        showtimeService.searchShowtimes(searchParams),
        movieService.getMovies({ limit: 100 }),
        showtimeService.getShowtimeStats(),
      ])

      // Handle showtimes data
      if (showtimesResult.status === "fulfilled") {
        const showtimesData = showtimesResult.value
        setShowtimes(showtimesData.showtimes || [])
        setPagination({
          page: showtimesData.page || 1,
          pages: showtimesData.pages || 1,
          total: showtimesData.total || 0,
          hasNext: showtimesData.hasNext || false,
          hasPrev: showtimesData.hasPrev || false,
        })
        console.log("✅ Showtimes loaded:", showtimesData.showtimes?.length || 0)
      } else {
        console.error("❌ Failed to load showtimes:", showtimesResult.reason)
        throw new Error("Failed to load showtimes")
      }

      // Handle movies data
      if (moviesResult.status === "fulfilled") {
        const moviesData = moviesResult.value
        const moviesList = Array.isArray(moviesData) ? moviesData : moviesData?.movies || moviesData?.data || []
        setMovies(moviesList)
        console.log("✅ Movies loaded:", moviesList.length)
      } else {
        console.warn("⚠️ Failed to load movies:", moviesResult.reason)
        setMovies([])
      }

      // Handle stats data
      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value)
        console.log("✅ Stats loaded:", statsResult.value)
      } else {
        console.warn("⚠️ Failed to load stats:", statsResult.reason)
      }
    } catch (error) {
      console.error("💥 Error fetching data:", error)
      setError("Failed to load data. Please try again.")
      setShowtimes([])
      setMovies([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Enhanced CRUD operations
  const handleCreateShowtime = () => {
    console.log("🆕 Opening create showtime form")
    setEditingShowtime(null)
    setShowForm(true)
  }

  const handleEditShowtime = async (showtime) => {
    try {
      console.log("✏️ Opening edit showtime form for:", showtime._id)

      // Fetch full showtime details for editing
      const fullShowtime = await showtimeService.getShowtimeById(showtime._id)
      setEditingShowtime(fullShowtime)
      setShowForm(true)
    } catch (error) {
      console.error("❌ Error loading showtime for edit:", error)
      setError("Failed to load showtime details for editing")
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleDeleteShowtime = (showtime) => {
    console.log("🗑️ Preparing to delete showtime:", showtime._id)
    setShowtimeToDelete(showtime)
    setShowDeleteDialog(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      console.log("💾 Submitting showtime form:", formData)
      setLoading(true)

      // Validate data before submission
      const validation = showtimeService.validateShowtimeData(formData)
      if (!validation.isValid) {
        setError("Please fix the form errors before submitting")
        return
      }

      if (editingShowtime) {
        // Update existing showtime
        await showtimeService.updateShowtime(editingShowtime._id, formData)
        setSuccess("Showtime updated successfully!")
        console.log("✅ Showtime updated successfully")
      } else {
        // Create new showtime
        await showtimeService.createShowtime(formData)
        setSuccess("Showtime created successfully!")
        console.log("✅ Showtime created successfully")
      }

      setShowForm(false)
      setEditingShowtime(null)
      await fetchData()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("❌ Error saving showtime:", error)
      setError(error.message || "Failed to save showtime")
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const confirmDeleteShowtime = async () => {
    try {
      console.log("🗑️ Deleting showtime:", showtimeToDelete._id)
      setLoading(true)

      await showtimeService.deleteShowtime(showtimeToDelete._id)
      setShowDeleteDialog(false)
      setShowtimeToDelete(null)
      setSuccess("Showtime deleted successfully!")
      console.log("✅ Showtime deleted successfully")

      await fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("❌ Error deleting showtime:", error)
      setError("Failed to delete showtime")
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) return

    try {
      console.log("🗑️ Bulk deleting showtimes:", selectedShowtimes)
      setLoading(true)

      await showtimeService.bulkDeleteShowtimes(selectedShowtimes)
      setSelectedShowtimes([])
      setSuccess(`${selectedShowtimes.length} showtime(s) deleted successfully!`)
      console.log("✅ Bulk delete completed")

      await fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("❌ Error bulk deleting showtimes:", error)
      setError("Failed to delete selected showtimes")
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectShowtime = (showtimeId) => {
    setSelectedShowtimes((prev) =>
        prev.includes(showtimeId) ? prev.filter((id) => id !== showtimeId) : [...prev, showtimeId],
    )
  }

  const handleSelectAll = () => {
    if (selectedShowtimes.length === showtimes.length) {
      setSelectedShowtimes([])
    } else {
      setSelectedShowtimes(showtimes.map((s) => s._id))
    }
  }

  const handleFilterChange = (key, value) => {
    console.log("🔍 Filter changed:", key, value)
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered")
    await fetchData(true)
  }, [])

  // Helper functions for database structure
  const getShowtimeStatus = (showtime) => {
    const now = new Date()
    const startTime = new Date(showtime.startTime)
    const endTime = new Date(showtime.endTime)

    if (showtime.seatsAvailable === 0) return "sold-out"
    if (now < startTime) return "scheduled"
    if (now >= startTime && now <= endTime) return "ongoing"
    if (now > endTime) return "completed"
    return "scheduled"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "sold-out":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getTotalSeats = (showtime) => {
    return showtime.seatsAvailable + showtime.seatsBooked
  }

  const getOccupancyRate = (showtime) => {
    const total = getTotalSeats(showtime)
    return total > 0 ? Math.round((showtime.seatsBooked / total) * 100) : 0
  }

  // Get unique branches and theaters for filters
  const uniqueBranches = [...new Set(showtimes.map((s) => s.branch?.name).filter(Boolean))]
  const uniqueTheaters = [...new Set(showtimes.map((s) => s.theater?.name).filter(Boolean))]

  if (loading && showtimes.length === 0) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading showtimes...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Showtime Management</h1>
            <p className="text-gray-600 mt-2">Manage movie showtimes and schedules</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreateShowtime} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Showtime
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckSquare className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
        )}

        {/* Error Alert */}
        {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
        )}

        {/* Bulk Actions */}
        {selectedShowtimes.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">{selectedShowtimes.length} showtime(s) selected</span>
                  <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Movie</label>
                <Select value={filters.movieId} onValueChange={(value) => handleFilterChange("movieId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All movies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All movies</SelectItem>
                    {movies.map((movie) => (
                        <SelectItem key={movie._id} value={movie._id}>
                          {movie.title}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <Select value={filters.branchId} onValueChange={(value) => handleFilterChange("branchId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All branches</SelectItem>
                    {uniqueBranches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theater</label>
                <Select value={filters.theaterId} onValueChange={(value) => handleFilterChange("theaterId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All theaters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All theaters</SelectItem>
                    {uniqueTheaters.map((theater) => (
                        <SelectItem key={theater} value={theater}>
                          {theater}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      placeholder="Search showtimes..."
                      className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Showtimes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total || pagination.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Shows</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.today ||
                        showtimes.filter((s) => {
                          const today = new Date().toDateString()
                          const showDate = new Date(s.startTime).toDateString()
                          return today === showDate
                        }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Branches</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.branches || uniqueBranches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Film className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Movies Showing</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.movies || new Set(showtimes.map((s) => s.movie?._id).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Select All Checkbox */}
        {showtimes.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center">
                <button onClick={handleSelectAll} className="mr-2">
                  {selectedShowtimes.length === showtimes.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <span className="text-sm text-gray-600">Select all showtimes on this page</span>
              </label>
            </div>
        )}

        {/* Showtimes Grid */}
        {showtimes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {showtimes.map((showtime) => {
                const status = getShowtimeStatus(showtime)
                const occupancyRate = getOccupancyRate(showtime)
                const isSelected = selectedShowtimes.includes(showtime._id)

                return (
                    <Card
                        key={showtime._id}
                        className={`relative hover:shadow-lg transition-shadow ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3 flex-1">
                            <button onClick={() => handleSelectShowtime(showtime._id)} className="mt-1">
                              {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                {showtime.movie?.title || "Unknown Movie"}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-600">
                                {showtime.movie?.duration || "N/A"} minutes
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={getStatusColor(status)}>
                              {status === "scheduled" && "Scheduled"}
                              {status === "ongoing" && "Ongoing"}
                              {status === "completed" && "Completed"}
                              {status === "sold-out" && "Sold Out"}
                            </Badge>
                            {showtime.isFirstShow && (
                                <Badge variant="outline" className="text-xs">
                                  First Show
                                </Badge>
                            )}
                            {showtime.isLastShow && (
                                <Badge variant="outline" className="text-xs">
                                  Last Show
                                </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {showtime.branch?.name || "Unknown Branch"}
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Film className="w-4 h-4 mr-2" />
                          {showtime.theater?.name || "Unknown Theater"}
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDateTime(showtime.startTime)} - {formatDateTime(showtime.endTime)}
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {showtime.seatsAvailable}/{getTotalSeats(showtime)} seats available ({occupancyRate}% booked)
                        </div>

                        {/* Price Information */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Ticket Prices:</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-medium">Standard</div>
                              <div className="text-green-600">{formatPrice(showtime.price?.standard || 0)}</div>
                            </div>
                            {showtime.price?.vip > 0 && (
                                <div className="text-center">
                                  <div className="font-medium">VIP</div>
                                  <div className="text-green-600">{formatPrice(showtime.price.vip)}</div>
                                </div>
                            )}
                            {showtime.price?.couple > 0 && (
                                <div className="text-center">
                                  <div className="font-medium">Couple</div>
                                  <div className="text-green-600">{formatPrice(showtime.price.couple)}</div>
                                </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs text-gray-500">{showtime.branch?.location?.city || "Unknown City"}</div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditShowtime(showtime)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteShowtime(showtime)}
                                className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </div>
        ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-500 mb-4">
                  <Clock className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No showtimes found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search ||
                  filters.movieId !== "all" ||
                  filters.branchId !== "all" ||
                  filters.theaterId !== "all" ||
                  filters.date
                      ? "Try adjusting your filters to see more results."
                      : "Get started by creating your first showtime."}
                </p>
                <Button onClick={handleCreateShowtime} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Showtime
                </Button>
              </CardContent>
            </Card>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
              >
                Previous
              </Button>

              {[...Array(pagination.pages)].map((_, index) => {
                const page = index + 1
                return (
                    <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
                        className={pagination.page === page ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      {page}
                    </Button>
                )
              })}

              <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
        )}

        {/* Showtime Form Modal */}
        {showForm && (
            <ShowtimeForm
                showtime={editingShowtime}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false)
                  setEditingShowtime(null)
                }}
            />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Showtime</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the showtime for "{showtimeToDelete?.movie?.title}" at{" "}
                {showtimeToDelete && formatDateTime(showtimeToDelete.startTime)}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteShowtime}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Loading Overlay */}
        {loading && showtimes.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
        )}
      </div>
  )
}

export default AdminShowtimes
