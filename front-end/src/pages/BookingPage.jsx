"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Film,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomerSeatSelection from "@/components/booking/CustomerSeatSelection";
import { showtimeService } from "../services/showtimeService";
import { bookingService, paymentService } from "../services/bookingService";
import socketService from "../services/socketService";

const BookingPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingStep, setBookingStep] = useState("seat-selection"); // seat-selection, payment, confirmation
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [paymentTimer, setPaymentTimer] = useState(null);

  useEffect(() => {
    if (showtimeId) {
      fetchShowtimeDetails();
    }

    return () => {
      // Cleanup on unmount
      if (paymentSession && selectedSeats.length > 0) {
        socketService.releaseSeats(
          showtimeId,
          selectedSeats.map((s) => s._id)
        );
      }
    };
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

  const handleSeatSelectionChange = (seats) => {
    setSelectedSeats(seats);
  };

  const handlePriceChange = (price) => {
    setTotalPrice(price);
  };

  const handleBookSeats = () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    // Navigate to payment step
    setBookingStep("payment");

    // Initiate payment via WebSocket
    const seatIds = selectedSeats.map((s) => s._id);
    socketService.initiatePayment(showtimeId, seatIds);
  };

  const handlePaymentInitiated = (paymentData) => {
    setPaymentSession(paymentData);
    setPaymentTimer(300); // 5 minutes

    // Start countdown
    const interval = setInterval(() => {
      setPaymentTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError("Payment timeout. Your reservation has expired.");
          setBookingStep("seat-selection");
          setSelectedSeats([]);
          setPaymentSession(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleProcessPayment = async () => {
    if (!paymentSession) {
      setError("No active payment session");
      return;
    }

    try {
      setPaymentLoading(true);
      setError(null);

      // Process payment
      const paymentResult = await paymentService.processPayment({
        showtimeId,
        seatIds: selectedSeats.map((s) => s._id),
        totalAmount: totalPrice,
        paymentMethod: "credit_card",
      });

      // Create booking
      const bookingData = {
        showtimeId,
        seats: selectedSeats.map((seat) => ({
          seatId: seat._id,
          row: seat.row,
          number: seat.number,
          type: seat.type,
          price: seat.availability?.price || 0,
        })),
        totalAmount: totalPrice,
        paymentMethod: "credit_card",
        transactionId: paymentResult.transactionId,
      };

      const booking = await bookingService.createBooking(bookingData);

      // Complete payment via WebSocket
      socketService.completePayment(
        showtimeId,
        selectedSeats.map((s) => s._id),
        {
          bookingId: booking._id,
          paymentId: paymentResult.paymentId,
          transactionId: paymentResult.transactionId,
        }
      );

      setBookingResult({
        ...booking,
        ...paymentResult,
      });
      setBookingStep("confirmation");
      setPaymentSession(null);
      setPaymentTimer(null);
    } catch (error) {
      setError(error.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelPayment = () => {
    if (selectedSeats.length > 0) {
      const seatIds = selectedSeats.map((s) => s._id);
      socketService.releaseSeats(showtimeId, seatIds);
    }

    setBookingStep("seat-selection");
    setPaymentSession(null);
    setPaymentTimer(null);
    setSelectedSeats([]);
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

  const formatTimer = (seconds) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/showtimes")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Showtimes
          </Button>

          <div className="flex items-center space-x-4">
            <Badge
              variant={bookingStep === "seat-selection" ? "default" : "outline"}
              className={bookingStep === "seat-selection" ? "bg-red-600" : ""}
            >
              1. Select Seats
            </Badge>
            <Badge
              variant={bookingStep === "payment" ? "default" : "outline"}
              className={bookingStep === "payment" ? "bg-red-600" : ""}
            >
              2. Payment
            </Badge>
            <Badge
              variant={bookingStep === "confirmation" ? "default" : "outline"}
              className={bookingStep === "confirmation" ? "bg-green-600" : ""}
            >
              3. Confirmation
            </Badge>
          </div>
        </div>

        {/* Payment Timer */}
        {paymentTimer && paymentTimer > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Payment must be completed in {formatTimer(paymentTimer)} or your
              reservation will expire.
            </AlertDescription>
          </Alert>
        )}

        {/* Showtime Information */}
        {showtime && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Movie Poster */}
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

                {/* Movie & Showtime Details */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {showtime.movie?.title || "Unknown Movie"}
                      </h1>

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

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Booking Steps */}
        {bookingStep === "seat-selection" && (
          <div className="space-y-6">
            <CustomerSeatSelection
              showtimeId={showtimeId}
              onSeatSelectionChange={handleSeatSelectionChange}
              onPriceChange={handlePriceChange}
              onPaymentInitiated={handlePaymentInitiated}
              maxSeats={8}
            />

            {/* Book Seats Button */}
            {selectedSeats.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedSeats.length} seat(s) selected
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                    <Button
                      onClick={handleBookSeats}
                      className="bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      Book Seats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {bookingStep === "payment" && (
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Seats Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Selected Seats
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {selectedSeats.map((seat) => (
                      <div key={seat._id} className="flex justify-between">
                        <span>
                          {seat.row}
                          {seat.number} ({seat.type})
                        </span>
                        <span className="font-medium">
                          {formatPrice(seat.availability?.price || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Payment Form (Demo) */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Payment Details</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 text-sm mb-3">
                      🎬 <strong>Demo Payment</strong> - This is a
                      demonstration. No real payment will be processed.
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Card Number:</span>
                        <span className="font-mono">**** **** **** 1234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiry:</span>
                        <span className="font-mono">12/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CVV:</span>
                        <span className="font-mono">***</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="outline" onClick={handleCancelPayment}>
                    Cancel Payment
                  </Button>
                  <Button
                    onClick={handleProcessPayment}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={paymentLoading}
                    size="lg"
                  >
                    {paymentLoading
                      ? "Processing..."
                      : `Pay ${formatPrice(totalPrice)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {bookingStep === "confirmation" && bookingResult && (
          <div className="space-y-6">
            {/* Booking Confirmation */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Booking Confirmed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Booking Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Booking ID:</span>
                      <span className="font-mono">{bookingResult._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment ID:</span>
                      <span className="font-mono">
                        {bookingResult.paymentId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(bookingResult.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Booked At:</span>
                      <span>
                        {new Date(bookingResult.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Your Seats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {bookingResult.seats.map((seat, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="justify-center"
                      >
                        {seat.row}
                        {seat.number}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button onClick={() => navigate("/profile")} className="mr-4">
                    View My Bookings
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
