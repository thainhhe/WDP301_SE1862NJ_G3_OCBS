"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Film } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomerSeatSelection from "@/components/booking/CustomerSeatSelection";
import { showtimeService } from "../services/showtimeService";
import { bookingService } from "../services/bookingService";
import { seatService } from "../services/seatService";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socketService";

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showtimeId) {
      fetchShowtimeDetails();
    }
  }, [showtimeId]);

  const fetchShowtimeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await showtimeService.getShowtimeById(showtimeId);
      setShowtime(data);
    } catch (error) {
      console.error("Error fetching showtime details:", error);
      setError("Failed to load showtime details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Thêm useEffect này để quản lý kết nối WebSocket
  useEffect(() => {
    // Chỉ kết nối nếu có showtimeId
    if (showtimeId) {
      const token = localStorage.getItem("token");
      socketService.connect(token);
      socketService.joinShowtime(showtimeId);
    }
    // Dọn dẹp kết nối khi component bị hủy
    return () => {
      if (showtimeId) {
        socketService.leaveShowtime(showtimeId);
        // Không ngắt kết nối hoàn toàn để có thể dùng ở trang sau
      }
    };
  }, [showtimeId]);

  const handleBookSeats = async () => {
    try {
      if (!user) {
        setError("Please log in to book tickets.");
        return;
      }

      if (selectedSeats.length === 0) {
        setError("Please select at least one seat.");
        return;
      }

      // 1. Reserve seats first
      await seatService.reserveSeats(
        showtimeId,
        selectedSeats.map((s) => s._id),
        user._id
      );

      socketService.initiatePayment(
        showtimeId,
        selectedSeats.map((s) => s._id)
      );

      // 2. Chuyển hướng sang trang review đặt vé
      // Đảm bảo mỗi seat có trường price
      const seatsWithPrice = selectedSeats.map((s) => ({
        ...s,
        price: s.price !== undefined ? s.price : s.availability?.price || 0,
      }));
      navigate("/booking-review", {
        state: {
          showtimeId,
          selectedSeats: seatsWithPrice,
          totalPrice,
        },
      });
    } catch (err) {
      console.error("Error during booking initiation:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      setError(errorMessage);

      // Attempt to release seats if reservation succeeded but booking failed
      try {
        await seatService.releaseReservation(
          showtimeId,
          selectedSeats.map((s) => s._id)
        );
      } catch (releaseError) {
        console.error(
          "Failed to auto-release seats after error:",
          releaseError
        );
      }
    }
  };

  const handleSeatSelectionChange = (seats) => {
    setSelectedSeats(seats);
  };

  const handlePriceChange = (price) => {
    setTotalPrice(price);
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
        year: "numeric",
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getImageUrl = (posterPath) => {
    if (!posterPath) return "/placeholder.svg?height=400&width=300";
    if (posterPath.startsWith("http")) return posterPath;
    const cleanPath = posterPath.replace(/^\/+/, "");
    return `http://localhost:5000/${cleanPath}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !showtime) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Film className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to load showtime
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchShowtimeDetails} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/showtimes")}
                className="w-full"
              >
                Back to Showtimes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/showtimes")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Showtimes
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">
            Select Your Seats
          </h1>
        </div>

        {showtime && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Showtime Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={
                      getImageUrl(showtime.movie?.poster) || "/placeholder.svg"
                    }
                    alt={showtime.movie?.title}
                    className="w-24 h-36 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=144&width=96";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        {showtime.movie?.title || "Unknown Movie"}
                      </h2>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(showtime.startTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(showtime.startTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>
                            {showtime.branch?.name} - {showtime.theater?.name}
                          </span>
                        </div>
                        {showtime.movie?.duration && (
                          <div className="flex items-center">
                            <Film className="w-4 h-4 mr-2" />
                            <span>{showtime.movie.duration} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Ticket Prices
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Standard:</span>
                          <span className="font-medium">
                            {formatPrice(showtime.price?.standard || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VIP:</span>
                          <span className="font-medium">
                            {formatPrice(showtime.price?.vip || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Couple:</span>
                          <span className="font-medium">
                            {formatPrice(showtime.price?.couple || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <CustomerSeatSelection
          showtimeId={showtimeId}
          onSeatSelectionChange={handleSeatSelectionChange}
          onPriceChange={handlePriceChange}
          maxSeats={8}
        />

        {selectedSeats.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  You have selected {selectedSeats.length} seat(s)
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  {formatPrice(totalPrice)}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Seats:{" "}
                  {selectedSeats
                    .map((seat) => `${seat.row}${seat.number}`)
                    .join(", ")}
                </p>

                <Button
                  onClick={handleBookSeats}
                  className="bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionPage;
