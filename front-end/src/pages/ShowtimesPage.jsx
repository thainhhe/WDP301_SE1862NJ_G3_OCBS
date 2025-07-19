"use client"

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  Star,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { showtimeService, branchService } from "../services/showtimeService"
import { movieService } from "../services/movieService"
import { formatVND } from "../utils/currencyUtils"

const ShowtimesPage = () => {
  const [searchParams] = useSearchParams()
  const movieId = searchParams.get("movieId")

  const [showtimes, setShowtimes] = useState([])
  const [movie, setMovie] = useState(null)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [filters, setFilters] = useState({
    branchId: "all",
    time: "all",
    search: "",
  })
  const [groupedShowtimes, setGroupedShowtimes] = useState({})
  const [availableDates, setAvailableDates] = useState([])

  // Generate next 7 days for quick selection
  const getNext7Days = () => {
    const days = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push({
        date: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        fullLabel: date.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        isToday: i === 0,
        isTomorrow: i === 1,
      })
    }
    return days
  }

  const quickDays = getNext7Days()

  useEffect(() => {
    fetchData()
  }, [movieId, selectedDate, filters])

  useEffect(() => {
    if (!showtimes || showtimes.length === 0) {
      setGroupedShowtimes({})
      return
    }

    // Group showtimes by branch for the selected date
    const grouped = {}

    showtimes.forEach((showtime) => {
      if (!showtime || !showtime.startTime) return

      const showtimeDate = new Date(showtime.startTime).toDateString()
      const selectedDateObj = new Date(selectedDate).toDateString()

      // Only include showtimes for the selected date
      if (showtimeDate !== selectedDateObj) return

      const branchId = showtime.branch?._id || "unknown"
      const branchName = showtime.branch?.name || "Unknown Cinema"

      if (!grouped[branchId]) {
        grouped[branchId] = {
          branch: showtime.branch || { _id: branchId, name: branchName },
          showtimes: [],
        }
      }

      grouped[branchId].showtimes.push(showtime)
    })

    // Sort showtimes within each branch by time
    Object.keys(grouped).forEach((branchId) => {
      grouped[branchId].showtimes.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    })

    setGroupedShowtimes(grouped)
  }, [showtimes, selectedDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters for showtimes
      const showtimeParams = {
        limit: 200,
        // Always filter from current time forward to prevent past showtimes
        startTimeAfter: new Date().toISOString(),
      }

      // Add movieId if provided
      if (movieId) {
        showtimeParams.movie = movieId
      }

      // Add branch filter
      if (filters.branchId && filters.branchId !== "all") {
        showtimeParams.branch = filters.branchId
      }

      // Add search filter
      if (filters.search && filters.search.trim()) {
        showtimeParams.search = filters.search.trim()
      }

      // Filter by specific date
      const selectedDateObj = new Date(selectedDate)
      const startOfDay = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      // Only apply date filter if it's not today, or if it's today, make sure we don't show past times
      if (selectedDate === new Date().toISOString().split("T")[0]) {
        // For today, use current time as start
        showtimeParams.startTimeAfter = new Date().toISOString()
      } else {
        // For future dates, use start of day
        showtimeParams.startTimeAfter = startOfDay.toISOString()
      }
      showtimeParams.startTimeBefore = endOfDay.toISOString()

      // Filter by time of day if specified
      if (filters.time !== "all" && filters.time) {
        const baseDate = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate())
        const now = new Date()

        switch (filters.time) {
          case "morning":
            const morningStart = new Date(baseDate.getTime() + 6 * 60 * 60 * 1000)
            const morningEnd = new Date(baseDate.getTime() + 12 * 60 * 60 * 1000)

            // If it's today and current time is past morning start, use current time
            if (selectedDate === new Date().toISOString().split("T")[0] && now > morningStart) {
              showtimeParams.startTimeAfter = now.toISOString()
            } else {
              showtimeParams.startTimeAfter = morningStart.toISOString()
            }
            showtimeParams.startTimeBefore = morningEnd.toISOString()
            break
          case "afternoon":
            const afternoonStart = new Date(baseDate.getTime() + 12 * 60 * 60 * 1000)
            const afternoonEnd = new Date(baseDate.getTime() + 18 * 60 * 60 * 1000)

            if (selectedDate === new Date().toISOString().split("T")[0] && now > afternoonStart) {
              showtimeParams.startTimeAfter = now.toISOString()
            } else {
              showtimeParams.startTimeAfter = afternoonStart.toISOString()
            }
            showtimeParams.startTimeBefore = afternoonEnd.toISOString()
            break
          case "evening":
            const eveningStart = new Date(baseDate.getTime() + 18 * 60 * 60 * 1000)
            const eveningEnd = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)

            if (selectedDate === new Date().toISOString().split("T")[0] && now > eveningStart) {
              showtimeParams.startTimeAfter = now.toISOString()
            } else {
              showtimeParams.startTimeAfter = eveningStart.toISOString()
            }
            showtimeParams.startTimeBefore = eveningEnd.toISOString()
            break
        }
      }

      // Fetch data in parallel
      const promises = [showtimeService.getShowtimes(showtimeParams), branchService.getBranches({ limit: 100 })]

      // Add movie fetch if movieId is provided
      if (movieId) {
        promises.push(movieService.getMovieById(movieId))
      }

      const results = await Promise.all(promises)
      const [showtimesData, branchesData, movieData] = results

      // Handle different possible response structures
      let fetchedShowtimes = []
      if (showtimesData) {
        if (Array.isArray(showtimesData)) {
          fetchedShowtimes = showtimesData
        } else if (showtimesData.showtimes && Array.isArray(showtimesData.showtimes)) {
          fetchedShowtimes = showtimesData.showtimes
        } else if (showtimesData.data && Array.isArray(showtimesData.data)) {
          fetchedShowtimes = showtimesData.data
        } else if (showtimesData.results && Array.isArray(showtimesData.results)) {
          fetchedShowtimes = showtimesData.results
        }
      }

      let fetchedBranches = []
      if (branchesData) {
        if (Array.isArray(branchesData)) {
          fetchedBranches = branchesData
        } else if (branchesData.branches && Array.isArray(branchesData.branches)) {
          fetchedBranches = branchesData.branches
        } else if (branchesData.data && Array.isArray(branchesData.data)) {
          fetchedBranches = branchesData.data
        } else if (branchesData.results && Array.isArray(branchesData.results)) {
          fetchedBranches = branchesData.results
        }
      }

      // Filter out past showtimes on client side as additional safety
      const now = new Date()
      const futureShowtimes = fetchedShowtimes.filter((showtime) => {
        const showtimeStart = new Date(showtime.startTime)
        return showtimeStart > now
      })

      // Set the fetched data
      setShowtimes(futureShowtimes)
      setBranches(fetchedBranches)

      if (movieId && movieData) {
        setMovie(movieData)
      }

      // Extract available dates from showtimes for date navigation
      const dates = [
        ...new Set(futureShowtimes.map((showtime) => new Date(showtime.startTime).toISOString().split("T")[0])),
      ].sort()
      setAvailableDates(dates)
    } catch (error) {
      setError(`Failed to load showtimes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + direction)

    // Don't allow navigation to past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    newDate.setHours(0, 0, 0, 0)

    if (newDate >= today) {
      setSelectedDate(newDate.toISOString().split("T")[0])
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatPrice = formatVND

  const getAvailabilityColor = (available, total) => {
    if (total === 0) return "text-gray-600"
    const percentage = (available / total) * 100
    if (percentage > 50) return "text-green-600"
    if (percentage > 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getAvailabilityText = (available, total) => {
    if (available === 0) return "Sold Out"
    if (available <= 5) return "Few Left"
    return "Available"
  }

  const isShowtimePast = (startTime) => {
    return new Date(startTime) <= new Date()
  }

  const handleBookNow = (showtime) => {
    // Double check that showtime is not in the past
    if (isShowtimePast(showtime.startTime)) {
      alert("This showtime has already started and cannot be booked.")
      return
    }

    // Navigate to booking page with showtime ID
    window.location.href = `/seat-selection/${showtime._id}`
  }

  const getImageUrl = (posterPath) => {
    if (!posterPath) return "/placeholder.svg?height=400&width=300"

    // If it's already a full URL, return as is
    if (posterPath.startsWith("http")) {
      return posterPath
    }

    // If it's a relative path, prepend the backend URL
    const cleanPath = posterPath.replace(/^\/+/, "")
    return `http://localhost:5000/${cleanPath}`
  }

  const getSelectedDateInfo = () => {
    const selectedDateObj = new Date(selectedDate)
    return {
      label: selectedDateObj.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      fullLabel: selectedDateObj.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const selectedDateInfo = getSelectedDateInfo()

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Movie Header */}
          {movie && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="md:flex">
                  <div className="md:w-1/3 lg:w-1/4">
                    <img
                        src={getImageUrl(movie.poster) || "/placeholder.svg"}
                        alt={movie.title}
                        className="w-full h-64 md:h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=400&width=300"
                        }}
                    />
                  </div>
                  <div className="md:w-2/3 lg:w-3/4 p-6">
                    <div className="flex flex-wrap items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {movie.duration} min
                      </span>
                          <span>{movie.language}</span>
                          {movie.hotness && (
                              <span className="flex items-center text-yellow-600">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                                {movie.hotness}/10
                        </span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {movie.status === "now-showing" ? "Now Showing" : movie.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genre?.map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                      ))}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">{movie.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Director:</span>
                        <span className="ml-2 text-gray-600">{movie.director}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Cast:</span>
                        <span className="ml-2 text-gray-600">
                      {movie.cast?.slice(0, 3).join(", ")}
                          {movie.cast?.length > 3 && "..."}
                    </span>
                      </div>
                    </div>

                    {movie.trailer && (
                        <div className="mt-4">
                          <Button variant="outline" asChild>
                            <a href={movie.trailer} target="_blank" rel="noopener noreferrer">
                              <Film className="w-4 h-4 mr-2" />
                              Watch Trailer
                            </a>
                          </Button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* Page Title for non-movie specific showtimes */}
          {!movie && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Movie Showtimes</h1>
                <p className="text-gray-600">Find and book tickets for all current movies</p>
              </div>
          )}

          {/* Enhanced Date Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Select Date & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quick Date Selection</label>
                <div className="flex flex-wrap gap-2">
                  {quickDays.map((day) => (
                      <Button
                          key={day.date}
                          variant={selectedDate === day.date ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDateChange(day.date)}
                          className={`${
                              selectedDate === day.date
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          } ${day.isToday ? "ring-2 ring-red-200" : ""}`}
                      >
                        {day.label}
                      </Button>
                  ))}
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate(-1)}
                    disabled={selectedDate === new Date().toISOString().split("T")[0]}
                    className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Day
                </Button>

                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{selectedDateInfo.fullLabel}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(selectedDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => navigateDate(1)} className="flex items-center gap-2">
                  Next Day
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Custom Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or select a specific date</label>
                <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="max-w-xs"
                />
              </div>

              {/* Other Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cinema Branch</label>
                  <Select value={filters.branchId} onValueChange={(value) => handleFilterChange("branchId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All branches</SelectItem>
                      {branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch._id}>
                            {branch.name} {branch.location?.city && `- ${branch.location.city}`}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                  <Select value={filters.time} onValueChange={(value) => handleFilterChange("time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All times" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All times</SelectItem>
                      <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                      <SelectItem value="evening">Evening (6PM - 12AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Cinema</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        placeholder="Search cinema..."
                        className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
          )}

          {/* Showtimes for Selected Date */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              {selectedDateInfo.fullLabel}
            </h2>
            <p className="text-gray-600 mb-6">
              {Object.keys(groupedShowtimes).length > 0
                  ? `${Object.values(groupedShowtimes).reduce((total, branch) => total + branch.showtimes.length, 0)} showtimes available`
                  : "No showtimes available for this date"}
            </p>
          </div>

          {/* Showtimes Display */}
          {Object.keys(groupedShowtimes).length > 0 ? (
              <div className="space-y-6">
                {Object.values(groupedShowtimes).map((branchData) => (
                    <Card key={branchData.branch?._id || "unknown"} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-red-600" />
                              {branchData.branch?.name || "Unknown Cinema"}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-2">
                        <span className="text-gray-600">
                          {branchData.branch?.location?.address ||
                              branchData.branch?.location?.city ||
                              "Location not available"}
                        </span>
                            </CardDescription>
                            {branchData.branch?.contact?.phone && (
                                <CardDescription className="mt-1 text-sm">📞 {branchData.branch.contact.phone}</CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {branchData.showtimes.length} show{branchData.showtimes.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {branchData.showtimes.map((showtime) => {
                            const isPast = isShowtimePast(showtime.startTime)

                            return (
                                <Card
                                    key={showtime._id}
                                    className={`border transition-all duration-200 hover:shadow-lg ${
                                        isPast ? "opacity-50 bg-gray-50" : "border-gray-200 hover:border-red-300"
                                    }`}
                                >
                                  <CardContent className="p-4">
                                    {/* Movie title if not filtered by specific movie */}
                                    {!movieId && showtime.movie && (
                                        <div className="mb-3">
                                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                            {showtime.movie.title}
                                          </h4>
                                          {showtime.movie.genre && (
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {showtime.movie.genre.slice(0, 2).map((genre, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                      {genre}
                                                    </Badge>
                                                ))}
                                              </div>
                                          )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                          <Clock className="w-4 h-4 text-gray-500" />
                                          <span className={`font-bold text-lg ${isPast ? "text-gray-500" : "text-gray-900"}`}>
                                    {formatTime(showtime.startTime)}
                                  </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {showtime.theater?.name || "Unknown Theater"}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className={`text-sm font-medium ${isPast ? "text-gray-500" : "text-gray-900"}`}>
                                          {isPast ? "Past" : "Available"}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Special Features */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {showtime.isFirstShow && (
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                            First Show
                                          </Badge>
                                      )}
                                      {showtime.isLastShow && (
                                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                            Last Show
                                          </Badge>
                                      )}
                                      {isPast && (
                                          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                            Past Showtime
                                          </Badge>
                                      )}
                                    </div>

                                    {/* Pricing */}
                                    {showtime.price && (
                                        <div className="mb-4">
                                          <div className="flex items-center mb-2">
                                            <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Prices:</span>
                                          </div>
                                          <div className="grid grid-cols-3 gap-1 text-xs">
                                            <div className="text-center">
                                              <div className="font-medium text-gray-600">Standard</div>
                                              <div className="text-green-600 font-semibold">
                                                {formatPrice(showtime.price.standard || 0)}
                                              </div>
                                            </div>
                                            {showtime.price.vip > 0 && (
                                                <div className="text-center">
                                                  <div className="font-medium text-gray-600">VIP</div>
                                                  <div className="text-green-600 font-semibold">
                                                    {formatPrice(showtime.price.vip)}
                                                  </div>
                                                </div>
                                            )}
                                            {showtime.price.couple > 0 && (
                                                <div className="text-center">
                                                  <div className="font-medium text-gray-600">Couple</div>
                                                  <div className="text-green-600 font-semibold">
                                                    {formatPrice(showtime.price.couple)}
                                                  </div>
                                                </div>
                                            )}
                                          </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleBookNow(showtime)}
                                        disabled={isPast}
                                        className={`w-full ${
                                            isPast
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-red-600 hover:bg-red-700"
                                        }`}
                                    >
                                      {isPast ? "Showtime Passed" : "Book Now"}
                                    </Button>
                                  </CardContent>
                                </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
          ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-500 mb-4">
                    <Clock className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No showtimes found</h3>
                  <p className="text-gray-500 mb-4">
                    {filters.branchId !== "all" || filters.time !== "all" || filters.search
                        ? "Try adjusting your filters to see more results."
                        : movie
                            ? `No showtimes are available for "${movie.title}" on ${selectedDateInfo.fullLabel.toLowerCase()}.`
                            : `No showtimes are available for ${selectedDateInfo.fullLabel.toLowerCase()}.`}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {selectedDate !== new Date().toISOString().split("T")[0] && (
                        <Button onClick={() => handleDateChange(new Date().toISOString().split("T")[0])} variant="outline">
                          View Today's Showtimes
                        </Button>
                    )}
                    {!movie && (
                        <Button asChild variant="outline">
                          <Link to="/movies">Browse Movies</Link>
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  )
}

export default ShowtimesPage
