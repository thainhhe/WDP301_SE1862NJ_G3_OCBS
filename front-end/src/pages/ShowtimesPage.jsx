"use client";

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  Star,
  DollarSign,
  Filter,
  Search,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { showtimeService, branchService } from "../services/showtimeService";
import { movieService } from "../services/movieService";

const ShowtimesPage = () => {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movieId");

  const [showtimes, setShowtimes] = useState([]);
  const [movie, setMovie] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    branchId: "all",
    date: "",
    time: "all",
    search: "",
  });
  const [groupedShowtimes, setGroupedShowtimes] = useState({});

  useEffect(() => {
    fetchData();
  }, [movieId, filters]);

  useEffect(() => {
    console.log("Grouping showtimes:", showtimes);

    if (!showtimes || showtimes.length === 0) {
      setGroupedShowtimes({});
      return;
    }

    // Group showtimes by date and branch
    const grouped = {};

    showtimes.forEach((showtime) => {
      // Ensure we have valid showtime data
      if (!showtime || !showtime.startTime) {
        console.warn("Invalid showtime data:", showtime);
        return;
      }

      const date = new Date(showtime.startTime).toDateString();
      const branchId = showtime.branch?._id || "unknown";
      const branchName = showtime.branch?.name || "Unknown Cinema";

      console.log("Processing showtime:", {
        id: showtime._id,
        date,
        branchId,
        branchName,
        startTime: showtime.startTime,
      });

      if (!grouped[date]) {
        grouped[date] = {};
      }

      if (!grouped[date][branchId]) {
        grouped[date][branchId] = {
          branch: showtime.branch || { _id: branchId, name: branchName },
          showtimes: [],
        };
      }

      grouped[date][branchId].showtimes.push(showtime);
    });

    // Sort showtimes within each group by time
    Object.keys(grouped).forEach((date) => {
      Object.keys(grouped[date]).forEach((branchId) => {
        grouped[date][branchId].showtimes.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
      });
    });

    console.log("Grouped showtimes:", grouped);
    setGroupedShowtimes(grouped);
  }, [showtimes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Starting data fetch with movieId:",
        movieId,
        "filters:",
        filters
      );

      // Build query parameters for showtimes
      const showtimeParams = {
        limit: 100, // Increase limit to get more results
      };

      // Add movieId if provided
      if (movieId) {
        showtimeParams.movie = movieId;
      }

      // Add branch filter
      if (filters.branchId && filters.branchId !== "all") {
        showtimeParams.branch = filters.branchId;
      }

      // Add search filter
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
      } else {
        // If no date filter, only show future showtimes
        showtimeParams.startTimeAfter = new Date().toISOString();
      }

      // Filter by time of day if specified
      if (filters.time !== "all" && filters.time) {
        const now = new Date();
        const today = filters.date ? new Date(filters.date) : new Date();
        const baseDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        switch (filters.time) {
          case "morning":
            if (!filters.date) {
              showtimeParams.startTimeAfter = new Date(
                baseDate.getTime() + 6 * 60 * 60 * 1000
              ).toISOString();
            }
            showtimeParams.startTimeBefore = new Date(
              baseDate.getTime() + 12 * 60 * 60 * 1000
            ).toISOString();
            break;
          case "afternoon":
            showtimeParams.startTimeAfter = new Date(
              baseDate.getTime() + 12 * 60 * 60 * 1000
            ).toISOString();
            showtimeParams.startTimeBefore = new Date(
              baseDate.getTime() + 18 * 60 * 60 * 1000
            ).toISOString();
            break;
          case "evening":
            showtimeParams.startTimeAfter = new Date(
              baseDate.getTime() + 18 * 60 * 60 * 1000
            ).toISOString();
            showtimeParams.startTimeBefore = new Date(
              baseDate.getTime() + 24 * 60 * 60 * 1000
            ).toISOString();
            break;
        }
      }

      console.log("Fetching showtimes with params:", showtimeParams);

      // Fetch data in parallel
      const promises = [
        showtimeService.getShowtimes(showtimeParams),
        branchService.getBranches({ limit: 100 }),
      ];

      // Add movie fetch if movieId is provided
      if (movieId) {
        promises.push(movieService.getMovieById(movieId));
      }

      const results = await Promise.all(promises);
      const [showtimesData, branchesData, movieData] = results;

      console.log("Raw API responses:", {
        showtimesData,
        branchesData,
        movieData,
      });

      // Handle different possible response structures
      let fetchedShowtimes = [];
      if (showtimesData) {
        if (Array.isArray(showtimesData)) {
          fetchedShowtimes = showtimesData;
        } else if (
          showtimesData.showtimes &&
          Array.isArray(showtimesData.showtimes)
        ) {
          fetchedShowtimes = showtimesData.showtimes;
        } else if (showtimesData.data && Array.isArray(showtimesData.data)) {
          fetchedShowtimes = showtimesData.data;
        } else if (
          showtimesData.results &&
          Array.isArray(showtimesData.results)
        ) {
          fetchedShowtimes = showtimesData.results;
        }
      }

      let fetchedBranches = [];
      if (branchesData) {
        if (Array.isArray(branchesData)) {
          fetchedBranches = branchesData;
        } else if (
          branchesData.branches &&
          Array.isArray(branchesData.branches)
        ) {
          fetchedBranches = branchesData.branches;
        } else if (branchesData.data && Array.isArray(branchesData.data)) {
          fetchedBranches = branchesData.data;
        } else if (
          branchesData.results &&
          Array.isArray(branchesData.results)
        ) {
          fetchedBranches = branchesData.results;
        }
      }

      console.log("Processed data:", {
        showtimes: fetchedShowtimes,
        branches: fetchedBranches,
        movie: movieData,
      });

      // Set the fetched data
      setShowtimes(fetchedShowtimes);
      setBranches(fetchedBranches);

      if (movieId && movieData) {
        setMovie(movieData);
      }

      // Log final state
      console.log("Final showtimes count:", fetchedShowtimes.length);
      console.log("Final branches count:", fetchedBranches.length);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Failed to load showtimes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    console.log("Filter changed:", key, value);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getAvailabilityColor = (available, total) => {
    if (total === 0) return "text-gray-600";
    const percentage = (available / total) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityText = (available, total) => {
    if (available === 0) return "Sold Out";
    if (available <= 5) return "Few Left";
    return "Available";
  };

  const calculateAvailableSeats = (showtime) => {
    // Calculate available seats based on theater capacity and booked seats
    const totalSeats = showtime.theater?.capacity || 0;
    const bookedSeats = showtime.bookedSeats || 0;
    return Math.max(0, totalSeats - bookedSeats);
  };

  const handleBookNow = (showtime) => {
    // Navigate to booking page with showtime ID
    window.location.href = `/seat-selection/${showtime._id}`;
  };

  const getImageUrl = (posterPath) => {
    if (!posterPath) return "/placeholder.svg?height=400&width=300";

    // If it's already a full URL, return as is
    if (posterPath.startsWith("http")) {
      return posterPath;
    }

    // If it's a relative path, prepend the backend URL
    const cleanPath = posterPath.replace(/^\/+/, "");
    return `http://localhost:5000/${cleanPath}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  console.log("Rendering with:", {
    showtimesCount: showtimes.length,
    groupedShowtimesKeys: Object.keys(groupedShowtimes),
    branchesCount: branches.length,
    movie: movie?.title,
  });

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
                    e.target.src = "/placeholder.svg?height=400&width=300";
                  }}
                />
              </div>
              <div className="md:w-2/3 lg:w-3/4 p-6">
                <div className="flex flex-wrap items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {movie.title}
                    </h1>
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
                    {movie.status === "now-showing"
                      ? "Now Showing"
                      : movie.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre?.map((genre, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {movie.description}
                </p>

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
                      <a
                        href={movie.trailer}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Movie Showtimes
            </h1>
            <p className="text-gray-600">
              Find and book tickets for all current movies
            </p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Showtimes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cinema Branch
                </label>
                <Select
                  value={filters.branchId}
                  onValueChange={(value) =>
                    handleFilterChange("branchId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}{" "}
                        {branch.location?.city && `- ${branch.location.city}`}
                      </SelectItem>
                    ))}
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
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <Select
                  value={filters.time}
                  onValueChange={(value) => handleFilterChange("time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All times" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All times</SelectItem>
                    <SelectItem value="morning">
                      Morning (6AM - 12PM)
                    </SelectItem>
                    <SelectItem value="afternoon">
                      Afternoon (12PM - 6PM)
                    </SelectItem>
                    <SelectItem value="evening">
                      Evening (6PM - 12AM)
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Search cinema..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Debug Information
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Showtimes fetched: {showtimes.length}</p>
                <p>Branches fetched: {branches.length}</p>
                <p>Grouped dates: {Object.keys(groupedShowtimes).length}</p>
                <p>Movie ID: {movieId || "None"}</p>
                <p>Active filters: {JSON.stringify(filters)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Showtimes */}
        {Object.keys(groupedShowtimes).length > 0 ? (
          <div className="space-y-8">
            {Object.keys(groupedShowtimes)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <div key={date}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-2" />
                    {formatDate(date)}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </h2>

                  <div className="space-y-6">
                    {Object.values(groupedShowtimes[date]).map((branchData) => (
                      <Card
                        key={branchData.branch?._id || "unknown"}
                        className="overflow-hidden"
                      >
                        <CardHeader className="bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl text-gray-900">
                                {branchData.branch?.name || "Unknown Cinema"}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {branchData.branch?.location?.address ||
                                  branchData.branch?.location?.city ||
                                  "Location not available"}
                              </CardDescription>
                              {branchData.branch?.location?.phone && (
                                <CardDescription className="mt-1">
                                  📞 {branchData.branch.location.phone}
                                </CardDescription>
                              )}
                            </div>
                            <Badge variant="outline">
                              {branchData.showtimes.length} show
                              {branchData.showtimes.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {branchData.showtimes.map((showtime) => {
                              const availableSeats =
                                calculateAvailableSeats(showtime);
                              const totalSeats =
                                showtime.theater?.capacity || 0;
                              const availabilityColor = getAvailabilityColor(
                                availableSeats,
                                totalSeats
                              );
                              const availabilityText = getAvailabilityText(
                                availableSeats,
                                totalSeats
                              );

                              return (
                                <Card
                                  key={showtime._id}
                                  className="border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                  <CardContent className="p-4">
                                    {/* Movie title if not filtered by specific movie */}
                                    {!movieId && showtime.movie && (
                                      <div className="mb-2">
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                          {showtime.movie.title}
                                        </h4>
                                      </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                          <Clock className="w-4 h-4 text-gray-500" />
                                          <span className="font-semibold text-lg">
                                            {formatTime(showtime.startTime)}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {showtime.theater?.name ||
                                            "Unknown Theater"}
                                          {showtime.theater?.type &&
                                            ` (${showtime.theater.type})`}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div
                                          className={`text-sm font-medium ${availabilityColor}`}
                                        >
                                          {availabilityText}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {availableSeats}/{totalSeats} seats
                                        </div>
                                      </div>
                                    </div>

                                    {/* Special Features */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {showtime.is3D && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-blue-50 text-blue-700"
                                        >
                                          3D
                                        </Badge>
                                      )}
                                      {showtime.isSpecialShowing && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-purple-50 text-purple-700"
                                        >
                                          Special
                                        </Badge>
                                      )}
                                      {showtime.subtitles && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-green-50 text-green-700"
                                        >
                                          Subtitles
                                        </Badge>
                                      )}
                                      {showtime.theater?.type === "IMAX" && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-red-50 text-red-700"
                                        >
                                          IMAX
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Pricing */}
                                    {showtime.price && (
                                      <div className="mb-4">
                                        <div className="flex items-center mb-2">
                                          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Prices:
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                          <div className="text-center">
                                            <div className="text-gray-600">
                                              Standard
                                            </div>
                                            <div className="font-semibold text-green-600">
                                              {formatPrice(
                                                showtime.price.standard || 0
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-gray-600">
                                              VIP
                                            </div>
                                            <div className="font-semibold text-green-600">
                                              {formatPrice(
                                                showtime.price.vip || 0
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-gray-600">
                                              Couple
                                            </div>
                                            <div className="font-semibold text-green-600">
                                              {formatPrice(
                                                showtime.price.couple || 0
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {showtime.notes && (
                                      <div className="text-xs text-gray-600 mb-3 italic">
                                        {showtime.notes}
                                      </div>
                                    )}

                                    {/* Book Button */}
                                    <Button
                                      className="w-full bg-red-600 hover:bg-red-700"
                                      onClick={() => handleBookNow(showtime)}
                                      disabled={availableSeats === 0}
                                    >
                                      {availableSeats === 0
                                        ? "Sold Out"
                                        : "Select Seats"}
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <Clock className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No showtimes available
              </h3>
              <p className="text-gray-500 mb-4">
                {movieId
                  ? "No showtimes found for this movie. Try adjusting your filters or check back later."
                  : "No showtimes found. Try adjusting your filters or check back later."}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Showing {showtimes.length} showtimes from {branches.length}{" "}
                  branches
                </p>
                {showtimes.length > 0 && (
                  <p className="text-sm text-gray-400">
                    Check console for debugging information
                  </p>
                )}
              </div>
              <Button variant="outline" asChild className="mt-4">
                <Link to="/movies">Browse Movies</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShowtimesPage;
