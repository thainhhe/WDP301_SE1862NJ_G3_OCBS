"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ShowtimeForm from "../../components/admin/ShowtimeForm";
import { showtimeService, movieService } from "../../services/showtimeService";

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);
  const [selectedShowtimes, setSelectedShowtimes] = useState([]);
  const [filters, setFilters] = useState({
    movieId: "all",
    branchId: "all",
    theaterId: "all",
    date: "",
    search: "",
    status: "all",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    branches: 0,
    movies: 0,
  });

  // Mock data for development/testing
  const mockShowtimes = [
    {
      _id: "1",
      movie: { _id: "movie1", title: "Avengers: Endgame", duration: 181 },
      branch: {
        _id: "branch1",
        name: "Downtown Cinema",
        location: { city: "New York" },
      },
      theater: { _id: "theater1", name: "Theater 1", capacity: 150 },
      startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 86400000 + 10860000).toISOString(), // Tomorrow + 3 hours
      price: { standard: 12.5, vip: 18.75, couple: 27.5 },
      seatsAvailable: 120,
      seatsBooked: 30,
      status: "scheduled",
      is3D: false,
      isSpecialShowing: false,
      subtitles: true,
      notes: "Regular showing",
    },
    {
      _id: "2",
      movie: { _id: "movie2", title: "Spider-Man: No Way Home", duration: 148 },
      branch: {
        _id: "branch2",
        name: "Mall Cinema",
        location: { city: "Los Angeles" },
      },
      theater: { _id: "theater2", name: "IMAX Theater", capacity: 200 },
      startTime: new Date().toISOString(), // Now (ongoing)
      endTime: new Date(Date.now() + 8880000).toISOString(), // Now + 2.5 hours
      price: { standard: 15.0, vip: 22.5, couple: 33.0 },
      seatsAvailable: 50,
      seatsBooked: 150,
      status: "ongoing",
      is3D: true,
      isSpecialShowing: true,
      subtitles: false,
      notes: "IMAX 3D Experience",
    },
  ];

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const showtimeParams = {
        page: pagination.page,
        limit: 50,
      };

      // Add filters
      if (filters.movieId && filters.movieId !== "all") {
        showtimeParams.movie = filters.movieId;
      }
      if (filters.branchId && filters.branchId !== "all") {
        showtimeParams.branch = filters.branchId;
      }
      if (filters.theaterId && filters.theaterId !== "all") {
        showtimeParams.theater = filters.theaterId;
      }
      if (filters.status && filters.status !== "all") {
        showtimeParams.status = filters.status;
      }
      if (filters.search && filters.search.trim()) {
        showtimeParams.search = filters.search.trim();
      }

      // Filter by specific date if provided
      if (filters.date) {
        const selectedDate = new Date(filters.date);
        const startOfDay = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        showtimeParams.startTimeAfter = startOfDay.toISOString();
        showtimeParams.startTimeBefore = endOfDay.toISOString();
      }

      console.log("Fetching admin data with params:", showtimeParams);

      // Try to fetch real data first
      try {
        const [showtimesData, moviesData, statsData] = await Promise.all([
          showtimeService.getShowtimes(showtimeParams),
          movieService.getMovies({ limit: 100 }),
          showtimeService.getShowtimeStats().catch(() => ({})),
        ]);

        console.log("Admin data fetched:", { showtimesData, moviesData });

        // Handle different response structures
        const fetchedShowtimes = Array.isArray(showtimesData)
          ? showtimesData
          : showtimesData?.showtimes || showtimesData?.data || [];

        const fetchedMovies = Array.isArray(moviesData)
          ? moviesData
          : moviesData?.movies || moviesData?.data || [];

        console.log("Processed data:", { fetchedShowtimes, fetchedMovies });

        setShowtimes(fetchedShowtimes);
        setMovies(fetchedMovies);

        // Update pagination
        if (
          showtimesData &&
          typeof showtimesData === "object" &&
          !Array.isArray(showtimesData)
        ) {
          setPagination({
            page: showtimesData.page || 1,
            pages: showtimesData.pages || 1,
            total: showtimesData.total || fetchedShowtimes.length,
          });
        }

        // Update stats
        setStats({
          total: fetchedShowtimes.length,
          today: fetchedShowtimes.filter((s) => {
            const today = new Date().toDateString();
            const showDate = new Date(s.startTime).toDateString();
            return today === showDate;
          }).length,
          branches: new Set(
            fetchedShowtimes.map((s) => s.branch?._id).filter(Boolean)
          ).size,
          movies: new Set(
            fetchedShowtimes.map((s) => s.movie?._id).filter(Boolean)
          ).size,
          ...statsData,
        });
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError);
        // Use mock data when API is not available
        setShowtimes(mockShowtimes);
        setMovies([
          { _id: "movie1", title: "Avengers: Endgame", duration: 181 },
          { _id: "movie2", title: "Spider-Man: No Way Home", duration: 148 },
          { _id: "movie3", title: "The Batman", duration: 176 },
        ]);
        setStats({
          total: mockShowtimes.length,
          today: mockShowtimes.filter((s) => {
            const today = new Date().toDateString();
            const showDate = new Date(s.startTime).toDateString();
            return today === showDate;
          }).length,
          branches: new Set(mockShowtimes.map((s) => s.branch._id)).size,
          movies: new Set(mockShowtimes.map((s) => s.movie._id)).size,
        });
        setPagination({
          page: 1,
          pages: 1,
          total: mockShowtimes.length,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShowtime = () => {
    setEditingShowtime(null);
    setShowForm(true);
  };

  const handleEditShowtime = (showtime) => {
    setEditingShowtime(showtime);
    setShowForm(true);
  };

  const handleDeleteShowtime = (showtime) => {
    setShowtimeToDelete(showtime);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log("Form submitted with data:", formData);

      if (editingShowtime) {
        await showtimeService.updateShowtime(editingShowtime._id, formData);
        setSuccess("Showtime updated successfully!");
      } else {
        await showtimeService.createShowtime(formData);
        setSuccess("Showtime created successfully!");
      }

      setShowForm(false);
      setEditingShowtime(null);
      await fetchData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving showtime:", error);
      setError(error.message || "Failed to save showtime");
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDeleteShowtime = async () => {
    try {
      await showtimeService.deleteShowtime(showtimeToDelete._id);
      setShowDeleteDialog(false);
      setShowtimeToDelete(null);
      setSuccess("Showtime deleted successfully!");
      await fetchData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Failed to delete showtime");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) return;

    try {
      await showtimeService.bulkDeleteShowtimes(selectedShowtimes);
      setSelectedShowtimes([]);
      setSuccess(
        `${selectedShowtimes.length} showtime(s) deleted successfully!`
      );
      await fetchData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Failed to delete selected showtimes");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSelectShowtime = (showtimeId) => {
    setSelectedShowtimes((prev) =>
      prev.includes(showtimeId)
        ? prev.filter((id) => id !== showtimeId)
        : [...prev, showtimeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedShowtimes.length === showtimes.length) {
      setSelectedShowtimes([]);
    } else {
      setSelectedShowtimes(showtimes.map((s) => s._id));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRefresh = useCallback(async () => {
    await fetchData();
  }, []);

  // Helper functions for your database structure
  const getShowtimeStatus = (showtime) => {
    const now = new Date();
    const startTime = new Date(showtime.startTime);
    const endTime = new Date(showtime.endTime);

    if (showtime.seatsAvailable === 0) return "sold-out";
    if (now < startTime) return "scheduled";
    if (now >= startTime && now <= endTime) return "ongoing";
    if (now > endTime) return "completed";
    return "scheduled";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "sold-out":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getTotalSeats = (showtime) => {
    return showtime.seatsAvailable + showtime.seatsBooked;
  };

  const getOccupancyRate = (showtime) => {
    const total = getTotalSeats(showtime);
    return total > 0 ? Math.round((showtime.seatsBooked / total) * 100) : 0;
  };

  // Get unique branches and theaters for filters
  const uniqueBranches = [
    ...new Set(showtimes.map((s) => s.branch?.name).filter(Boolean)),
  ];
  const uniqueTheaters = [
    ...new Set(showtimes.map((s) => s.theater?.name).filter(Boolean)),
  ];

  if (loading && showtimes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading showtimes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Showtime Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage movie showtimes and schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleCreateShowtime}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Showtime
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckSquare className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
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
              <span className="text-sm font-medium text-blue-800">
                {selectedShowtimes.length} showtime(s) selected
              </span>
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="sm"
              >
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movie
              </label>
              <Select
                value={filters.movieId}
                onValueChange={(value) => handleFilterChange("movieId", value)}
              >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <Select
                value={filters.branchId}
                onValueChange={(value) => handleFilterChange("branchId", value)}
              >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theater
              </label>
              <Select
                value={filters.theaterId}
                onValueChange={(value) =>
                  handleFilterChange("theaterId", value)
                }
              >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
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
                <p className="text-sm font-medium text-gray-600">
                  Total Showtimes
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.total || pagination.total}
                </p>
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
                <p className="text-sm font-medium text-gray-600">
                  Today's Shows
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.today ||
                    showtimes.filter((s) => {
                      const today = new Date().toDateString();
                      const showDate = new Date(s.startTime).toDateString();
                      return today === showDate;
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
                <p className="text-sm font-medium text-gray-600">
                  Active Branches
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.branches || uniqueBranches.length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">
                  Movies Showing
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.movies ||
                    new Set(showtimes.map((s) => s.movie?._id).filter(Boolean))
                      .size}
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
            <span className="text-sm text-gray-600">
              Select all showtimes on this page
            </span>
          </label>
        </div>
      )}

      {/* Showtimes Grid */}
      {showtimes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {showtimes.map((showtime) => {
            const status = getShowtimeStatus(showtime);
            const occupancyRate = getOccupancyRate(showtime);
            const isSelected = selectedShowtimes.includes(showtime._id);

            return (
              <Card
                key={showtime._id}
                className={`relative hover:shadow-lg transition-shadow ${
                  isSelected ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleSelectShowtime(showtime._id)}
                        className="mt-1"
                      >
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
                    {formatDateTime(showtime.startTime)} -{" "}
                    {formatDateTime(showtime.endTime)}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {showtime.seatsAvailable}/{getTotalSeats(showtime)} seats
                    available ({occupancyRate}% booked)
                  </div>

                  {/* Price Information */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        Ticket Prices:
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium">Standard</div>
                        <div className="text-green-600">
                          {formatPrice(showtime.price?.standard || 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">VIP</div>
                        <div className="text-green-600">
                          {formatPrice(showtime.price?.vip || 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Couple</div>
                        <div className="text-green-600">
                          {formatPrice(showtime.price?.couple || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500">
                      {showtime.branch?.location?.city || "Unknown City"}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditShowtime(showtime)}
                      >
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
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <Clock className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No showtimes found
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search ||
              filters.movieId !== "all" ||
              filters.branchId !== "all" ||
              filters.theaterId !== "all" ||
              filters.date
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first showtime."}
            </p>
            <Button
              onClick={handleCreateShowtime}
              className="bg-red-600 hover:bg-red-700"
            >
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
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
          >
            Previous
          </Button>

          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;
            return (
              <Button
                key={page}
                variant={pagination.page === page ? "default" : "outline"}
                onClick={() => setPagination((prev) => ({ ...prev, page }))}
                className={
                  pagination.page === page ? "bg-red-600 hover:bg-red-700" : ""
                }
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
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
            setShowForm(false);
            setEditingShowtime(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Showtime</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the showtime for "
              {showtimeToDelete?.movie?.title}" at{" "}
              {showtimeToDelete && formatDateTime(showtimeToDelete.startTime)}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
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
  );
};

export default AdminShowtimes;
