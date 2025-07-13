import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ComboSelector from "../components/booking/ComboSelector";
import VoucherInput from "../components/booking/VoucherInput";
import { bookingService } from "../services/bookingService";
import { X } from "lucide-react";

function formatVND(amount) {
  return amount?.toLocaleString("en-US") + " VND";
}

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
              <div className="flex justify-between mb-2 text-base">
                <span>Seat Total:</span>
                <span>{formatVND(totalPrice)}</span>
              </div>
              <div className="flex justify-between mb-2 text-base">
                <span>Combo Total:</span>
                <span>{formatVND(comboTotal)}</span>
              </div>
              <div className="flex flex-col gap-1 mb-2 text-base">
                <div className="flex justify-between">
                  <span>Voucher Discount:</span>
                  <span className="text-green-700 font-semibold">-{formatVND(discountAmount)}</span>
                </div>
                {voucher && (
                  <div className="text-xs text-gray-500 mt-1">
                    {voucher.discountType === "percentage"
                      ? `Discount ${voucher.discountValue}%${voucher.maxDiscount > 0 ? ` (max ${formatVND(voucher.maxDiscount)})` : ""}`
                      : `Discount ${formatVND(voucher.discountValue)}${voucher.maxDiscount > 0 ? ` (max ${formatVND(voucher.maxDiscount)})` : ""}`}
                    {voucher.minPurchase > 0 ? ` | Min order: ${formatVND(voucher.minPurchase)}` : ""}
                  </div>
                )}
              </div>
              {/* Combo details summary */}
              {combos.length > 0 && (
                <div className="mt-2 mb-2">
                  <div className="font-semibold text-sm mb-1">Combo Details:</div>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {combos.map((c, idx) => (
                      <li key={c._id + idx} className="flex items-center gap-2">
                        <span className="font-medium">x{c.quantity} </span>
                        {c.name ? c.name + ': ' : ''}
                        {c.items && c.items.length > 0
                          ? c.items.map((item, i) => `${item.quantity} ${item.name}${i < c.items.length - 1 ? ', ' : ''}`).join('')
                          : ''}
                        <button
                          className="ml-2 text-gray-400 hover:text-red-600 focus:outline-none"
                          title="Remove this combo"
                          onClick={() => handleRemoveCombo(c._id)}
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mb-2">
                <VoucherInput voucher={voucher} setVoucher={setVoucher} setError={setVoucherError} combos={combos} seatTotal={totalPrice} />
                {voucherError && <div className="text-red-500 text-sm mt-2">{voucherError}</div>}
              </div>
              <div className="flex justify-between mt-4 text-lg font-bold border-t pt-3">
                <span>Final Total:</span>
                <span className="text-rose-700">{formatVND(finalTotal)}</span>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex justify-end mt-6">
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