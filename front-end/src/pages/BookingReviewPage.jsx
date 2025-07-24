import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ComboSelector from "../components/booking/ComboSelector";
import VoucherInput from "../components/booking/VoucherInput";
import { bookingService } from "../services/bookingService";
import { seatService } from "../services/seatService";
import { formatVND } from "../utils/currencyUtils";
import { X, ArrowLeft } from "lucide-react";

// Using the utility function from currencyUtils.js instead

const BookingReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showtimeId, selectedSeats, totalPrice } = location.state || {};

  const [combos, setCombos] = useState([]);
  const [voucher, setVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate combo total
  const comboTotal = useMemo(() => combos.reduce((sum, c) => sum + (c.price * c.quantity), 0), [combos]);
  // Calculate discountAmount as backend logic
  const discountAmount = useMemo(() => {
    if (!voucher) return 0;
    const subtotal = (totalPrice || 0) + comboTotal;
    if (voucher.discountType === "percentage") {
      let discount = Math.floor(subtotal * voucher.discountValue / 100);
      if (voucher.maxDiscount > 0) discount = Math.min(discount, voucher.maxDiscount);
      return discount;
    } else if (voucher.discountType === "fixed") {
      let discount = voucher.discountValue;
      if (voucher.maxDiscount > 0) discount = Math.min(discount, voucher.maxDiscount);
      return discount;
    }
    return 0;
  }, [voucher, totalPrice, comboTotal]);
  // Final total
  const finalTotal = useMemo(() => Math.max((totalPrice || 0) + comboTotal - discountAmount, 0), [totalPrice, comboTotal, discountAmount]);

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const bookingResponse = await bookingService.createBooking({
        showtimeId,
        seatIds: selectedSeats.map((s) => s._id),
        combos: combos.map(c => ({ combo: c._id, quantity: c.quantity })),
        voucherId: voucher?._id,
      });
      if (bookingResponse.success) {
        navigate(`/booking/${bookingResponse.booking._id}`);
      } else {
        throw new Error(bookingResponse.message || "Could not create booking record.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Remove combo by _id
  const handleRemoveCombo = (comboId) => {
    setCombos(prev => prev.filter(c => c._id !== comboId));
  };

  // Handle back to seat selection
  const handleBackToSeatSelection = async () => {
    try {
      // Release the reserved seats
      await seatService.releaseReservation(showtimeId, selectedSeats.map(s => s._id));
      
      // Navigate back to seat selection
      navigate(`/seat-selection/${showtimeId}`);
    } catch (error) {
      console.error("Error releasing seats:", error);
      // Still navigate back even if release fails
      navigate(`/seat-selection/${showtimeId}`);
    }
  };

  if (!showtimeId || !selectedSeats) {
    return <div className="p-8 text-center">Missing booking information. Please select seats again.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-0 py-8 w-full">
        <Card className="mb-8 shadow-lg border border-gray-200 w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-rose-700">Booking Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Seats</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                {selectedSeats.map((seat, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg border shadow-sm px-3 py-2">
                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
                      {seat.row}{seat.number}
                    </Badge>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${seat.type === 'vip' ? 'bg-yellow-100 text-yellow-700' : seat.type === 'couple' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>{seat.type?.toUpperCase() || 'STANDARD'}</span>
                    <span className="ml-auto text-sm font-medium text-blue-700">
                      {typeof seat.price === 'number' ? seat.price.toLocaleString() + ' VND' : '0 VND'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <ComboSelector combos={combos} setCombos={setCombos} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border mb-4 w-full">
              {/* Seat Details */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Seat Details:</h5>
                <div className="space-y-1">
                  {selectedSeats.map((seat, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>• {seat.row}{seat.number} ({seat.type || 'Standard'})</span>
                      <span>{formatVND(seat.price || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Combo Details */}
              {combos.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Combo Details:</h5>
                  <div className="space-y-2">
                    {combos.map((combo, index) => (
                      <div key={index} className="border border-gray-200 rounded p-2">
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span>• {combo.name || 'Combo'} x{combo.quantity}</span>
                          <span>{formatVND(combo.price * combo.quantity)}</span>
                        </div>
                        {combo.items && combo.items.length > 0 && (
                          <div className="text-xs text-gray-600 ml-4">
                            {combo.items.map((item, itemIndex) => (
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
                  <span>{formatVND(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combo Total:</span>
                  <span>{formatVND(comboTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatVND(totalPrice + comboTotal)}</span>
                </div>
                {voucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher: {voucher.code}</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <VoucherInput voucher={voucher} setVoucher={setVoucher} setError={setVoucherError} combos={combos} seatTotal={totalPrice} />
                {voucherError && <div className="text-red-500 text-sm mt-2">{voucherError}</div>}
              </div>
              {/* Final Total */}
              <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-lg">
                <span>Final Total:</span>
                <span className="text-rose-700">{formatVND(finalTotal)}</span>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={handleBackToSeatSelection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Seat Selection
              </Button>
              <Button onClick={handleConfirmBooking} disabled={loading} className="bg-rose-600 hover:bg-rose-700 px-8 py-2 text-lg font-semibold rounded shadow">
                {loading ? <LoadingSpinner size={20} /> : "Book Ticket"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingReviewPage; 