"use client";

import { useState, useEffect } from "react";
import {
  movieService,
  branchService,
  theaterService,
} from "../../services/showtimeService";

const ShowtimeForm = ({ showtime, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    movieId: "",
    branchId: "",
    theaterId: "",
    date: "",
    time: "",
    price: "",
    totalSeats: "",
    status: "scheduled",
    is3D: false,
    isSpecialShowing: false,
    subtitles: false,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    movies: false,
    branches: false,
    theaters: false,
  });
  const [dataErrors, setDataErrors] = useState({
    movies: null,
    branches: null,
    theaters: null,
  });

  // Time slots
  const timeSlots = [
    "09:00",
    "10:30",
    "12:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
    "19:30",
    "21:00",
    "22:30",
  ];

  // Load initial data with better error handling
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingStates((prev) => ({
          ...prev,
          initial: true,
          movies: true,
          branches: true,
        }));
        setDataErrors({ movies: null, branches: null, theaters: null });

        console.log("🔄 Loading initial data...");

        // Load movies and branches in parallel
        const [moviesResult, branchesResult] = await Promise.allSettled([
          movieService.getMovies({ limit: 100 }),
          branchService.getBranches({ limit: 100 }),
        ]);

        // Handle movies data
        if (moviesResult.status === "fulfilled") {
          const moviesData = moviesResult.value;
          console.log("✅ Movies loaded:", moviesData);

          if (
            moviesData &&
            (moviesData.movies || moviesData.data || Array.isArray(moviesData))
          ) {
            const moviesList =
              moviesData.movies || moviesData.data || moviesData;
            setMovies(Array.isArray(moviesList) ? moviesList : []);
            console.log(`📽️ Set ${moviesList.length} movies`);
          } else {
            throw new Error("Invalid movies data structure");
          }
        } else {
          console.error("❌ Failed to load movies:", moviesResult.reason);
          setDataErrors((prev) => ({
            ...prev,
            movies: "Failed to load movies",
          }));
          setMovies([]);
        }

        // Handle branches data
        if (branchesResult.status === "fulfilled") {
          const branchesData = branchesResult.value;
          console.log("✅ Branches loaded:", branchesData);

          if (
            branchesData &&
            (branchesData.branches ||
              branchesData.data ||
              Array.isArray(branchesData))
          ) {
            const branchesList =
              branchesData.branches || branchesData.data || branchesData;
            setBranches(Array.isArray(branchesList) ? branchesList : []);
            console.log(`🏢 Set ${branchesList.length} branches`);
          } else {
            throw new Error("Invalid branches data structure");
          }
        } else {
          console.error("❌ Failed to load branches:", branchesResult.reason);
          setDataErrors((prev) => ({
            ...prev,
            branches: "Failed to load branches",
          }));
          setBranches([]);
        }
      } catch (error) {
        console.error("💥 Critical error loading initial data:", error);
        setDataErrors({
          movies: "Failed to load movies",
          branches: "Failed to load branches",
          theaters: null,
        });
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          initial: false,
          movies: false,
          branches: false,
        }));
      }
    };

    loadInitialData();
  }, []);

  // Load theaters when branch changes with better error handling
  useEffect(() => {
    const loadTheaters = async () => {
      if (!formData.branchId) {
        setTheaters([]);
        return;
      }

      try {
        setLoadingStates((prev) => ({ ...prev, theaters: true }));
        setDataErrors((prev) => ({ ...prev, theaters: null }));

        console.log("🔄 Loading theaters for branch:", formData.branchId);

        const theatersData = await theaterService.getTheaters(
          formData.branchId
        );
        console.log("✅ Theaters loaded:", theatersData);

        if (
          theatersData &&
          (theatersData.theaters ||
            theatersData.data ||
            Array.isArray(theatersData))
        ) {
          const theatersList =
            theatersData.theaters || theatersData.data || theatersData;
          setTheaters(Array.isArray(theatersList) ? theatersList : []);
          console.log(`🎭 Set ${theatersList.length} theaters`);
        } else {
          throw new Error("Invalid theaters data structure");
        }
      } catch (error) {
        console.error("❌ Error loading theaters:", error);
        setDataErrors((prev) => ({
          ...prev,
          theaters: "Failed to load theaters for this branch",
        }));
        setTheaters([]);
      } finally {
        setLoadingStates((prev) => ({ ...prev, theaters: false }));
      }
    };

    loadTheaters();
  }, [formData.branchId]);

  // Populate form data when editing
  useEffect(() => {
    if (showtime) {
      console.log("📝 Editing showtime:", showtime);
      setFormData({
        movieId: showtime.movie?._id || "",
        branchId: showtime.branch?._id || "",
        theaterId: showtime.theater?._id || "",
        date: showtime.startTime
          ? new Date(showtime.startTime).toISOString().split("T")[0]
          : "",
        time: showtime.startTime
          ? new Date(showtime.startTime).toTimeString().slice(0, 5)
          : "",
        price: showtime.price?.standard || showtime.price || "",
        totalSeats: showtime.theater?.capacity || showtime.totalSeats || "",
        status: showtime.status || "scheduled",
        is3D: showtime.is3D || false,
        isSpecialShowing: showtime.isSpecialShowing || false,
        subtitles: showtime.subtitles || false,
        notes: showtime.notes || "",
      });
    } else {
      // Create mode - set default values
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      setFormData((prev) => ({
        ...prev,
        date: tomorrow.toISOString().split("T")[0],
        time: "18:00",
        status: "scheduled",
      }));
    }
  }, [showtime]);

  // Auto-fill seats when theater is selected
  useEffect(() => {
    if (formData.theaterId && !showtime) {
      const selectedTheater = theaters.find(
        (t) => t._id === formData.theaterId
      );
      if (selectedTheater && selectedTheater.capacity) {
        setFormData((prev) => ({
          ...prev,
          totalSeats: selectedTheater.capacity.toString(),
        }));
      }
    }
  }, [formData.theaterId, theaters, showtime]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.movieId) newErrors.movieId = "Movie is required";
    if (!formData.branchId) newErrors.branchId = "Branch is required";
    if (!formData.theaterId) newErrors.theaterId = "Theater is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.totalSeats) newErrors.totalSeats = "Total seats is required";

    // Validation rules
    if (
      formData.price &&
      (isNaN(formData.price) || Number.parseFloat(formData.price) <= 0)
    ) {
      newErrors.price = "Price must be a positive number";
    }

    if (
      formData.totalSeats &&
      (isNaN(formData.totalSeats) || Number.parseInt(formData.totalSeats) <= 0)
    ) {
      newErrors.totalSeats = "Total seats must be a positive number";
    }

    // Date validation
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    // Time validation for today's date
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();

      if (selectedDateTime <= now) {
        newErrors.time = "Time must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const selectedMovie = movies.find((m) => m._id === formData.movieId);

      const submitData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        totalSeats: Number.parseInt(formData.totalSeats),
        duration: selectedMovie?.duration || 120,
        movieTitle: selectedMovie?.title || "",
      };

      console.log("📤 Submitting showtime data:", submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error("💥 Form submission error:", error);
      setErrors({ submit: "Failed to save showtime. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMovie = () => movies.find((m) => m._id === formData.movieId);
  const getSelectedBranch = () =>
    branches.find((b) => b._id === formData.branchId);
  const getSelectedTheater = () =>
    theaters.find((t) => t._id === formData.theaterId);

  // Loading spinner component
  const LoadingSpinner = ({ size = "sm" }) => (
    <div
      className={`animate-spin rounded-full border-b-2 border-red-600 ${
        size === "sm" ? "h-4 w-4" : "h-8 w-8"
      }`}
    ></div>
  );

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
  );

  // Data status indicator
  const DataStatusIndicator = ({ loading, error, dataCount, label }) => (
    <div className="flex items-center space-x-2 text-xs">
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="text-blue-600">Loading {label}...</span>
        </>
      ) : error ? (
        <>
          <svg
            className="w-4 h-4 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-600">{error}</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-green-600">
            {dataCount} {label} loaded
          </span>
        </>
      )}
    </div>
  );

  if (loadingStates.initial) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Loading Form Data
            </h3>
            <p className="mt-2 text-gray-600">
              Please wait while we fetch the required information...
            </p>

            {/* Loading progress indicators */}
            <div className="mt-6 space-y-3">
              <DataStatusIndicator
                loading={loadingStates.movies}
                error={dataErrors.movies}
                dataCount={movies.length}
                label="movies"
              />
              <DataStatusIndicator
                loading={loadingStates.branches}
                error={dataErrors.branches}
                dataCount={branches.length}
                label="branches"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {showtime ? "Edit Showtime" : "Create New Showtime"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {showtime
                  ? "Update the showtime details below"
                  : "Fill in the details to create a new showtime"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Data Status Overview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Data Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DataStatusIndicator
                loading={loadingStates.movies}
                error={dataErrors.movies}
                dataCount={movies.length}
                label="movies"
              />
              <DataStatusIndicator
                loading={loadingStates.branches}
                error={dataErrors.branches}
                dataCount={branches.length}
                label="branches"
              />
              <DataStatusIndicator
                loading={loadingStates.theaters}
                error={dataErrors.theaters}
                dataCount={theaters.length}
                label="theaters"
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Movie Selection Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
                    errors.movieId
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${
                    loadingStates.movies || dataErrors.movies
                      ? "bg-gray-100"
                      : ""
                  }`}
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
                      {movie.title}{" "}
                      {movie.duration ? `(${movie.duration}min)` : ""}
                    </option>
                  ))}
                </select>
                {errors.movieId && <ErrorMessage message={errors.movieId} />}
                {dataErrors.movies && (
                  <ErrorMessage message={dataErrors.movies} />
                )}

                {/* Enhanced Movie Preview */}
                {getSelectedMovie() && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
                    <div className="flex items-start space-x-4">
                      {getSelectedMovie().poster && (
                        <img
                          src={getSelectedMovie().poster || "/placeholder.svg"}
                          alt={getSelectedMovie().title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {getSelectedMovie().title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                          {getSelectedMovie().genre && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {Array.isArray(getSelectedMovie().genre)
                                ? getSelectedMovie().genre.join(", ")
                                : getSelectedMovie().genre}
                            </span>
                          )}
                          {getSelectedMovie().rating && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {getSelectedMovie().rating}
                            </span>
                          )}
                          {getSelectedMovie().duration && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {getSelectedMovie().duration} minutes
                            </span>
                          )}
                        </div>
                        {getSelectedMovie().description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {getSelectedMovie().description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Location & Theater
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
                    disabled={loadingStates.branches || dataErrors.branches}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                      errors.branchId
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${
                      loadingStates.branches || dataErrors.branches
                        ? "bg-gray-100"
                        : ""
                    }`}
                  >
                    <option value="">
                      {loadingStates.branches
                        ? "Loading branches..."
                        : dataErrors.branches
                        ? "Failed to load branches"
                        : "Select branch"}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name} -{" "}
                        {branch.location?.city || "Unknown City"}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && (
                    <ErrorMessage message={errors.branchId} />
                  )}
                  {dataErrors.branches && (
                    <ErrorMessage message={dataErrors.branches} />
                  )}
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
                        errors.theaterId
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${
                        !formData.branchId || loadingStates.theaters
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      <option value="">
                        {!formData.branchId
                          ? "Select branch first"
                          : loadingStates.theaters
                          ? "Loading theaters..."
                          : dataErrors.theaters
                          ? "Failed to load theaters"
                          : "Select theater"}
                      </option>
                      {theaters.map((theater) => (
                        <option key={theater._id} value={theater._id}>
                          {theater.name} ({theater.capacity} seats)
                        </option>
                      ))}
                    </select>
                    {loadingStates.theaters && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                  {errors.theaterId && (
                    <ErrorMessage message={errors.theaterId} />
                  )}
                  {dataErrors.theaters && (
                    <ErrorMessage message={dataErrors.theaters} />
                  )}
                  {!formData.branchId && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Please select a branch first
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Schedule & Pricing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      errors.date
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
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
                      errors.time
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Ticket Price ($){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="12.50"
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                        errors.price
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.price && <ErrorMessage message={errors.price} />}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    placeholder="150"
                    min="1"
                    readOnly={!!getSelectedTheater()}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                      errors.totalSeats
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${getSelectedTheater() ? "bg-gray-100" : ""}`}
                  />
                  {errors.totalSeats && (
                    <ErrorMessage message={errors.totalSeats} />
                  )}
                  {getSelectedTheater() && (
                    <p className="mt-1 text-xs text-green-600 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Auto-filled from selected theater capacity
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Settings & Features
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Special Features
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "is3D", label: "3D Showing", icon: "🎬" },
                      {
                        name: "isSpecialShowing",
                        label: "Special Showing",
                        icon: "⭐",
                      },
                      { name: "subtitles", label: "Subtitles", icon: "💬" },
                    ].map((feature) => (
                      <label
                        key={feature.name}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          name={feature.name}
                          checked={formData[feature.name]}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                        />
                        <span className="mr-2">{feature.icon}</span>
                        <span className="text-sm text-gray-700">
                          {feature.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any special notes or announcements..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Actions */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">
                      {showtime ? "Updating..." : "Creating..."}
                    </span>
                  </div>
                ) : showtime ? (
                  "Update Showtime"
                ) : (
                  "Create Showtime"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowtimeForm;
