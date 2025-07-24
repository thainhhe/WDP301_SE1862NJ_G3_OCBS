"use client"

import { useState, useEffect } from "react"
import { movieService, branchService, theaterService } from "../../services/showtimeService"
import { Button } from "@/components/ui/button"

const ShowtimeForm = ({ showtime, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    movieId: "",
    branchId: "",
    theaterId: "",
    date: "",
    time: "",
    standardPrice: "",
    vipPrice: "",
    couplePrice: "",
    isFirstShow: false,
    isLastShow: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [movies, setMovies] = useState([])
  const [branches, setBranches] = useState([])
  const [theaters, setTheaters] = useState([])
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    movies: false,
    branches: false,
    theaters: false,
  })
  const [dataErrors, setDataErrors] = useState({
    movies: null,
    branches: null,
    theaters: null,
  })

  // Time slots
  const timeSlots = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00", "22:30"]

  // Load initial data with better error handling
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingStates((prev) => ({
          ...prev,
          initial: true,
          movies: true,
          branches: true,
        }))
        setDataErrors({ movies: null, branches: null, theaters: null })

        console.log("🔄 Loading initial data...")

        // Load movies and branches in parallel
        const [moviesResult, branchesResult] = await Promise.allSettled([
          movieService.getMovies({ limit: 100 }),
          branchService.getBranches({ limit: 100 }),
        ])

        // Handle movies data
        if (moviesResult.status === "fulfilled") {
          const moviesData = moviesResult.value
          console.log("✅ Movies loaded:", moviesData)

          if (moviesData && (moviesData.movies || moviesData.data || Array.isArray(moviesData))) {
            const moviesList = moviesData.movies || moviesData.data || moviesData
            setMovies(Array.isArray(moviesList) ? moviesList : [])
            console.log(`📽️ Set ${moviesList.length} movies`)
          } else {
            throw new Error("Invalid movies data structure")
          }
        } else {
          console.error("❌ Failed to load movies:", moviesResult.reason)
          setDataErrors((prev) => ({
            ...prev,
            movies: "Failed to load movies",
          }))
          setMovies([])
        }

        // Handle branches data
        if (branchesResult.status === "fulfilled") {
          const branchesData = branchesResult.value
          console.log("✅ Branches loaded:", branchesData)

          if (branchesData && (branchesData.branches || branchesData.data || Array.isArray(branchesData))) {
            const branchesList = branchesData.branches || branchesData.data || branchesData
            setBranches(Array.isArray(branchesList) ? branchesList : [])
            console.log(`🏢 Set ${branchesList.length} branches`)
          } else {
            throw new Error("Invalid branches data structure")
          }
        } else {
          console.error("❌ Failed to load branches:", branchesResult.reason)
          setDataErrors((prev) => ({
            ...prev,
            branches: "Failed to load branches",
          }))
          setBranches([])
        }
      } catch (error) {
        console.error("💥 Critical error loading initial data:", error)
        setDataErrors({
          movies: "Failed to load movies",
          branches: "Failed to load branches",
          theaters: null,
        })
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          initial: false,
          movies: false,
          branches: false,
        }))
      }
    }

    loadInitialData()
  }, [])

  // Load theaters when branch changes
  useEffect(() => {
    const loadTheaters = async () => {
      if (!formData.branchId) {
        setTheaters([])
        setDataErrors((prev) => ({ ...prev, theaters: null }))
        return
      }

      try {
        setLoadingStates((prev) => ({ ...prev, theaters: true }))
        setDataErrors((prev) => ({ ...prev, theaters: null }))

        console.log("🔄 Loading theaters for branch:", formData.branchId)

        const theatersData = await theaterService.getTheaters(formData.branchId)
        console.log("✅ Theaters loaded:", theatersData)

        if (theatersData && theatersData.theaters) {
          const theatersList = theatersData.theaters
          setTheaters(Array.isArray(theatersList) ? theatersList : [])
          console.log(`🎭 Set ${theatersList.length} theaters for branch ${formData.branchId}`)

          // Clear theater selection if current theater is not in the new list
          if (formData.theaterId && !theatersList.find((t) => t._id === formData.theaterId)) {
            setFormData((prev) => ({ ...prev, theaterId: "" }))
          }
        } else {
          console.log("ℹ️ No theaters found for branch:", formData.branchId)
          setTheaters([])
          setFormData((prev) => ({ ...prev, theaterId: "" }))
        }
      } catch (error) {
        console.error("❌ Error loading theaters:", error)
        setDataErrors((prev) => ({
          ...prev,
          theaters: error.message || "Failed to load theaters for this branch",
        }))
        setTheaters([])
        setFormData((prev) => ({ ...prev, theaterId: "" }))
      } finally {
        setLoadingStates((prev) => ({ ...prev, theaters: false }))
      }
    }

    loadTheaters()
  }, [formData.branchId])

  // Populate form data when editing
  useEffect(() => {
    if (showtime) {
      console.log("📝 Editing showtime:", showtime)
      setFormData({
        movieId: showtime.movie?._id || "",
        branchId: showtime.branch?._id || "",
        theaterId: showtime.theater?._id || "",
        date: showtime.startTime ? new Date(showtime.startTime).toISOString().split("T")[0] : "",
        time: showtime.startTime ? new Date(showtime.startTime).toTimeString().slice(0, 5) : "",
        standardPrice: showtime.price?.standard || "",
        vipPrice: showtime.price?.vip || "",
        couplePrice: showtime.price?.couple || "",
        isFirstShow: showtime.isFirstShow || false,
        isLastShow: showtime.isLastShow || false,
      })
    } else {
      // Create mode - set default values
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      setFormData((prev) => ({
        ...prev,
        date: tomorrow.toISOString().split("T")[0],
        time: "18:00",
      }))
    }
  }, [showtime])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.movieId) newErrors.movieId = "Movie is required"
    if (!formData.branchId) newErrors.branchId = "Branch is required"
    if (!formData.theaterId) newErrors.theaterId = "Theater is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.standardPrice) newErrors.standardPrice = "Standard price is required"

    // Validation rules
    if (formData.standardPrice && (isNaN(formData.standardPrice) || Number.parseFloat(formData.standardPrice) <= 0)) {
      newErrors.standardPrice = "Standard price must be a positive number"
    }

    if (formData.vipPrice && (isNaN(formData.vipPrice) || Number.parseFloat(formData.vipPrice) <= 0)) {
      newErrors.vipPrice = "VIP price must be a positive number"
    }

    if (formData.couplePrice && (isNaN(formData.couplePrice) || Number.parseFloat(formData.couplePrice) <= 0)) {
      newErrors.couplePrice = "Couple price must be a positive number"
    }

    // Date validation
    if (formData.date) {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past"
      }
    }

    // Time validation for today's date
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`)
      const now = new Date()

      if (selectedDateTime <= now) {
        newErrors.time = "Time must be in the future"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const selectedMovie = movies.find((m) => m._id === formData.movieId)

      const submitData = {
        ...formData,
        standardPrice: Number.parseFloat(formData.standardPrice),
        vipPrice: formData.vipPrice ? Number.parseFloat(formData.vipPrice) : 0,
        couplePrice: formData.couplePrice ? Number.parseFloat(formData.couplePrice) : 0,
        duration: selectedMovie?.duration || 120,
        movieTitle: selectedMovie?.title || "",
      }

      console.log("📤 Submitting showtime data:", submitData)
      await onSubmit(submitData)
    } catch (error) {
      console.error("💥 Form submission error:", error)
      setErrors({ submit: "Failed to save showtime. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedMovie = () => movies.find((m) => m._id === formData.movieId)
  const getSelectedBranch = () => branches.find((b) => b._id === formData.branchId)
  const getSelectedTheater = () => theaters.find((t) => t._id === formData.theaterId)

  // Loading spinner component
  const LoadingSpinner = ({ size = "sm" }) => (
      <div
          className={`animate-spin rounded-full border-b-2 border-red-600 ${size === "sm" ? "h-4 w-4" : "h-8 w-8"}`}
      ></div>
  )

  // Error message component
  const ErrorMessage = ({ message }) => (
      <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
      </div>
  )

  if (loadingStates.initial) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading form data...</p>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{showtime ? "Edit Showtime" : "Add New Showtime"}</h2>
              <p className="text-gray-600 mt-2">
                {showtime ? "Update showtime details and settings" : "Create a new movie showtime schedule"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCancel} variant="outline" size="sm" className="border-gray-300 bg-transparent">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Alert */}
            {errors.submit && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
                    </div>
                  </div>
                </div>
            )}

            <div className="space-y-8">
              {/* Movie Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  Movie Selection
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movie <span className="text-red-500">*</span>
                  </label>
                  <select
                      name="movieId"
                      value={formData.movieId}
                      onChange={handleInputChange}
                      disabled={loadingStates.movies || dataErrors.movies}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                          errors.movieId ? "border-red-500 bg-red-50" : "border-gray-300"
                      } ${loadingStates.movies || dataErrors.movies ? "bg-gray-100" : ""}`}
                  >
                    <option value="">
                      {loadingStates.movies
                          ? "Loading movies..."
                          : dataErrors.movies
                              ? "Failed to load movies"
                              : "Select a movie"}
                    </option>
                    {movies.map((movie) => (
                        <option key={movie._id} value={movie._id}>
                          {movie.title} {movie.duration ? `(${movie.duration}min)` : ""}
                        </option>
                    ))}
                  </select>
                  {errors.movieId && <ErrorMessage message={errors.movieId} />}
                  {dataErrors.movies && <ErrorMessage message={dataErrors.movies} />}
                </div>
              </div>

              {/* Location & Schedule */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                    />
                  </svg>
                  Location & Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                            errors.branchId ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name} - {branch.location?.city || "Unknown City"}
                          </option>
                      ))}
                    </select>
                    {errors.branchId && <ErrorMessage message={errors.branchId} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theater <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                          name="theaterId"
                          value={formData.theaterId}
                          onChange={handleInputChange}
                          disabled={!formData.branchId || loadingStates.theaters}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                              errors.theaterId ? "border-red-500 bg-red-50" : "border-gray-300"
                          } ${!formData.branchId || loadingStates.theaters ? "bg-gray-100" : ""}`}
                      >
                        <option value="">
                          {!formData.branchId
                              ? "Select branch first"
                              : loadingStates.theaters
                                  ? "Loading theaters..."
                                  : dataErrors.theaters
                                      ? "Failed to load theaters"
                                      : theaters.length === 0
                                          ? "No theaters available"
                                          : "Select theater"}
                        </option>
                        {theaters.map((theater) => (
                            <option key={theater._id} value={theater._id}>
                              {theater.name}
                            </option>
                        ))}
                      </select>
                      {loadingStates.theaters && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <LoadingSpinner size="sm" />
                          </div>
                      )}
                    </div>
                    {errors.theaterId && <ErrorMessage message={errors.theaterId} />}
                    {dataErrors.theaters && <ErrorMessage message={dataErrors.theaters} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                            errors.date ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                    />
                    {errors.date && <ErrorMessage message={errors.date} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                            errors.time ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </option>
                      ))}
                    </select>
                    {errors.time && <ErrorMessage message={errors.time} />}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Ticket Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Price (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₫</span>
                      <input
                          type="number"
                          name="standardPrice"
                          value={formData.standardPrice}
                          onChange={handleInputChange}
                          placeholder="125000"
                          step="1000"
                          min="0"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                              errors.standardPrice ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                      />
                    </div>
                    {errors.standardPrice && <ErrorMessage message={errors.standardPrice} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VIP Price (VND)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₫</span>
                      <input
                          type="number"
                          name="vipPrice"
                          value={formData.vipPrice}
                          onChange={handleInputChange}
                          placeholder="187500"
                          step="1000"
                          min="0"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                              errors.vipPrice ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                      />
                    </div>
                    {errors.vipPrice && <ErrorMessage message={errors.vipPrice} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couple Price (VND)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₫</span>
                      <input
                          type="number"
                          name="couplePrice"
                          value={formData.couplePrice}
                          onChange={handleInputChange}
                          placeholder="275000"
                          step="1000"
                          min="0"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                              errors.couplePrice ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                      />
                    </div>
                    {errors.couplePrice && <ErrorMessage message={errors.couplePrice} />}
                  </div>
                </div>
              </div>

              {/* Special Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                    />
                  </svg>
                  Special Settings
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                        type="checkbox"
                        name="isFirstShow"
                        checked={formData.isFirstShow}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                    />
                    <span className="mr-2">🌅</span>
                    <span className="text-sm text-gray-700">First Show of the Day</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                        type="checkbox"
                        name="isLastShow"
                        checked={formData.isLastShow}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                    />
                    <span className="mr-2">🌙</span>
                    <span className="text-sm text-gray-700">Last Show of the Day</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8 bg-gray-50 -mx-6 px-6 py-6 rounded-b-lg">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex items-center space-x-4">
                <Button type="button" onClick={onCancel} variant="outline" className="px-6 py-3 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-8 py-3 bg-red-600 hover:bg-red-700">
                  {loading ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{showtime ? "Updating..." : "Creating..."}</span>
                      </div>
                  ) : showtime ? (
                      "Update Showtime"
                  ) : (
                      "Create Showtime"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
  )
}

export default ShowtimeForm
