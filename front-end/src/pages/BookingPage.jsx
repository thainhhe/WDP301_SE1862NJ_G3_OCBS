import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Film,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { bookingService } from "../services/bookingService";
import { seatService } from "../services/seatService";
import { Modal } from "antd";
import CheckPayment from "../components/booking/CheckPayment";

const BookingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingStep, setBookingStep] = useState("payment");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [paymentCheckText, setPaymentCheckText] = useState("");

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      if (response.success) {
        setBooking(response.booking);
        if (response.booking.bookingStatus === "confirmed") {
          setBookingStep("confirmation");
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
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError("No booking ID provided.");
      setLoading(false);
    }
  }, [bookingId, fetchBookingDetails]);

  const generateQRCodeUrl = (amount, message) => {
    return `https://img.vietqr.io/image/ICB-105883688517-compact2.png?amount=${amount}&addInfo=${message}`;
  };

  const generateRandomText = (length) => {
    const allowedCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += allowedCharacters.charAt(
        Math.floor(Math.random() * allowedCharacters.length)
      );
    }
    return result;
  };

  const handleCheckout = () => {
    const randomText = generateRandomText(10);
    setPaymentCheckText(randomText);
    setQrCodeValue(generateQRCodeUrl(booking.totalAmount, randomText));
    setShowQRCode(true);
  };

  const handleBackToSeatSelection = async () => {
    try {
      // Release the reserved seats
      const seatIds = booking.seats.map(seat => seat._id);
      await seatService.releaseReservation(booking.showtime._id, seatIds);
      
      // Navigate back to seat selection
      navigate(`/seat-selection/${booking.showtime._id}`);
    } catch (error) {
      console.error("Error releasing seats:", error);
      // Still navigate back even if release fails
      navigate(`/seat-selection/${booking.showtime._id}`);
    }
  };

  const handlePaymentSuccess = useCallback(async () => {
    setPaymentLoading(true);
    setError(null);
    try {
      const updateResponse = await bookingService.updatePaymentStatus(
        bookingId,
        {
          paymentStatus: "completed",
          transactionId: paymentCheckText,
          paymentMethod: "bank_transfer",
        }
      );

      if (updateResponse.success) {
        setBooking(updateResponse.booking);
        setShowQRCode(false);
        setBookingStep("confirmation");
      } else {
        throw new Error(updateResponse.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi cập nhật thanh toán.");
    } finally {
      setPaymentLoading(false);
    }
  }, [bookingId, paymentCheckText]);

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

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
            <div className="text-red-500 mb-4">
              <Film className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to load booking
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/movies")} className="w-full">
              Browse Movies
            </Button>
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
            onClick={handleBackToSeatSelection}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Seat Selection
          </Button>

          <div className="flex items-center space-x-4">
            <Badge
              variant={bookingStep === "payment" ? "default" : "outline"}
              className={bookingStep === "payment" ? "bg-red-600" : ""}
            >
              1. Payment
            </Badge>
            <Badge
              variant={bookingStep === "confirmation" ? "default" : "outline"}
              className={bookingStep === "confirmation" ? "bg-green-600" : ""}
            >
              2. Confirmation
            </Badge>
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {booking.showtime.movie?.title}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(booking.showtime.startTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(booking.showtime.startTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      {booking.showtime.branch?.name} -{" "}
                      {booking.showtime.theater?.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Film className="w-4 h-4 mr-2" />
                    <span>{booking.showtime.movie?.duration} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {bookingStep === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Booking Summary
                </h4>
                
                {/* Seat Details */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Seats:</h5>
                  <div className="space-y-1">
                    {booking.seats.map((seat, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>• {seat.row}{seat.number} ({seat.type || 'Standard'})</span>
                        <span>{formatPrice(seat.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Combo Information */}
                {booking.combos && booking.combos.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Combos:</h5>
                    <div className="space-y-2">
                      {booking.combos.map((comboItem, index) => (
                        <div key={index} className="border border-gray-200 rounded p-2">
                          <div className="flex justify-between text-sm font-medium mb-1">
                            <span>• {comboItem.combo?.name || 'Combo'} x{comboItem.quantity}</span>
                            <span>{formatPrice(comboItem.price * comboItem.quantity)}</span>
                          </div>
                          {comboItem.combo?.items && comboItem.combo.items.length > 0 && (
                            <div className="text-xs text-gray-600 ml-4">
                              {comboItem.combo.items.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                  - {item.quantity} {item.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Summary Row */}
                <div className="space-y-2 text-sm font-medium pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Seat Total:</span>
                    <span>{formatPrice(booking.seats.reduce((sum, seat) => sum + (seat.price || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Combo Total:</span>
                    <span>{formatPrice(booking.combos ? booking.combos.reduce((sum, combo) => sum + (combo.price * combo.quantity), 0) : 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice((booking.seats.reduce((sum, seat) => sum + (seat.price || 0), 0)) + 
                      (booking.combos ? booking.combos.reduce((sum, combo) => sum + (combo.price * combo.quantity), 0) : 0))}</span>
                  </div>
                  {booking.voucher && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher: {booking.voucher.code}</span>
                      <span>-{formatPrice(booking.discountAmount || 0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Final Total */}
                <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p>Click the button below to generate a QR code for payment.</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToSeatSelection}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Seat Selection
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/profile`)}>
                    Cancel
                  </Button>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={paymentLoading}
                  size="lg"
                >
                  {paymentLoading ? "Processing..." : "Pay with QR Code"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {bookingStep === "confirmation" && (
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
                    <span className="font-mono">{booking._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{booking.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(booking.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booked At:</span>
                    <span>{new Date(booking.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
                
                {/* Seat Details */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Seats:</h5>
                  <div className="space-y-1">
                    {booking.seats.map((seat, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>• {seat.row}{seat.number} ({seat.type || 'Standard'})</span>
                        <span>{formatPrice(seat.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Combo Information */}
                {booking.combos && booking.combos.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Combos:</h5>
                    <div className="space-y-2">
                      {booking.combos.map((comboItem, index) => (
                        <div key={index} className="border border-gray-200 rounded p-2">
                          <div className="flex justify-between text-sm font-medium mb-1">
                            <span>• {comboItem.combo?.name || 'Combo'} x{comboItem.quantity}</span>
                            <span>{formatPrice(comboItem.price * comboItem.quantity)}</span>
                          </div>
                          {comboItem.combo?.items && comboItem.combo.items.length > 0 && (
                            <div className="text-xs text-gray-600 ml-4">
                              {comboItem.combo.items.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                  - {item.quantity} {item.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Summary Row */}
                <div className="space-y-2 text-sm font-medium pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Seat Total:</span>
                    <span>{formatPrice(booking.seats.reduce((sum, seat) => sum + (seat.price || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Combo Total:</span>
                    <span>{formatPrice(booking.combos ? booking.combos.reduce((sum, combo) => sum + (combo.price * combo.quantity), 0) : 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice((booking.seats.reduce((sum, seat) => sum + (seat.price || 0), 0)) + 
                      (booking.combos ? booking.combos.reduce((sum, combo) => sum + (combo.price * combo.quantity), 0) : 0))}</span>
                  </div>
                  {booking.voucher && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher: {booking.voucher.code}</span>
                      <span>-{formatPrice(booking.discountAmount || 0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Final Total */}
                <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total Paid:</span>
                  <span className="text-green-600">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
              </div>
              <div className="text-center pt-4">
                <Button onClick={() => navigate("/profile")} className="mr-4">
                  View My Bookings
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="mr-4">
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => navigate(`/seat-selection/${booking.showtime._id}`)}>
                  Book More Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Modal
          open={showQRCode}
          onCancel={() => setShowQRCode(false)}
          footer={null}
          maskClosable={false}
          closable={true}
          title="Scan QR code to pay"
        >
          <div className="text-center">
            <p className="mb-2">
              Please transfer the exact amount and content.
            </p>
            <p className="mb-2">
              Content:{" "}
              <strong className="text-red-600">{paymentCheckText}</strong>
            </p>
            <img
              src={qrCodeValue}
              alt="QR Code"
              style={{ maxWidth: "100%", margin: "auto", display: "block" }}
            />
            <CheckPayment
              totalMoney={booking?.totalAmount}
              txt={paymentCheckText}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookingPage;