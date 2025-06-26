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
import { bookingService, paymentService } from "../services/bookingService";

const BookingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingStep, setBookingStep] = useState("payment");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError("No booking ID provided.");
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      if (response.success) {
        setBooking(response.booking);
        if (response.booking.bookingStatus === 'confirmed') {
          setBookingStep('confirmation');
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError(err.response?.data?.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setPaymentLoading(true);
    setError(null);
    try {
      const paymentResult = await paymentService.processPayment({
        bookingId: booking._id,
        totalAmount: booking.totalAmount,
        paymentMethod: "credit_card",
      });

      const updateResponse = await bookingService.updatePaymentStatus(booking._id, {
        paymentStatus: "completed",
        transactionId: paymentResult.transactionId,
        paymentMethod: "credit_card",
      });

      if (updateResponse.success) {
        setBooking(updateResponse.booking);
        setBookingStep("confirmation");
      } else {
        throw new Error(updateResponse.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  const formatPrice = (price) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  const getImageUrl = (posterPath) => {
    if (!posterPath) return "/placeholder.svg?height=400&width=300";
    if (posterPath.startsWith("http")) return posterPath;
    const cleanPath = posterPath.replace(/^\/+/, "");
    return `http://localhost:5000/${cleanPath}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !booking) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4"><Film className="h-12 w-12 mx-auto" /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load booking</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate("/movies")} className="w-full">Browse Movies</Button>
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
                onClick={() => navigate(`/seat-selection/${booking.showtime._id}`)}
                className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Seat Selection
            </Button>

            <div className="flex items-center space-x-4">
              <Badge variant={bookingStep === "payment" ? "default" : "outline"} className={bookingStep === "payment" ? "bg-red-600" : ""}>1. Payment</Badge>
              <Badge variant={bookingStep === "confirmation" ? "default" : "outline"} className={bookingStep === "confirmation" ? "bg-green-600" : ""}>2. Confirmation</Badge>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                      src={getImageUrl(booking.showtime.movie?.poster)}
                      alt={booking.showtime.movie?.title}
                      className="w-24 h-36 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{booking.showtime.movie?.title}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /><span>{formatDate(booking.showtime.startTime)}</span></div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /><span>{formatTime(booking.showtime.startTime)}</span></div>
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /><span>{booking.showtime.branch?.name} - {booking.showtime.theater?.name}</span></div>
                    <div className="flex items-center"><Film className="w-4 h-4 mr-2" /><span>{booking.showtime.movie?.duration} minutes</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
          )}

          {bookingStep === "payment" && (
              <Card>
                <CardHeader><CardTitle className="flex items-center"><CreditCard className="w-5 h-5 mr-2" />Payment Information</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {booking.seats.map((seat, index) => (
                          <Badge key={index} variant="secondary">{seat.row}{seat.number}</Badge>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">{formatPrice(booking.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Payment Details</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 text-sm mb-3">🎬 <strong>Demo Payment</strong> - This is a demonstration. No real payment will be processed.</p>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Card Number:</span><span className="font-mono">**** **** **** 1234</span></div>
                        <div className="flex justify-between"><span>Expiry:</span><span className="font-mono">12/25</span></div>
                        <div className="flex justify-between"><span>CVV:</span><span className="font-mono">***</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant="outline" onClick={() => navigate(`/profile`)}>Cancel Payment</Button>
                    <Button onClick={handleProcessPayment} className="bg-green-600 hover:bg-green-700" disabled={paymentLoading} size="lg">
                      {paymentLoading ? "Processing..." : `Pay ${formatPrice(booking.totalAmount)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}

          {bookingStep === "confirmation" && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader><CardTitle className="flex items-center text-green-800"><CheckCircle className="w-5 h-5 mr-2" />Booking Confirmed!</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Booking ID:</span><span className="font-mono">{booking._id}</span></div>
                      <div className="flex justify-between"><span>Transaction ID:</span><span className="font-mono">{booking.transactionId}</span></div>
                      <div className="flex justify-between"><span>Total Paid:</span><span className="font-semibold text-green-600">{formatPrice(booking.totalAmount)}</span></div>
                      <div className="flex justify-between"><span>Booked At:</span><span>{new Date(booking.createdAt).toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Your Seats</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {booking.seats.map((seat, index) => (
                          <Badge key={index} variant="outline" className="justify-center">{seat.row}{seat.number}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <Button onClick={() => navigate("/profile")} className="mr-4">View My Bookings</Button>
                    <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  );
};

export default BookingPage;