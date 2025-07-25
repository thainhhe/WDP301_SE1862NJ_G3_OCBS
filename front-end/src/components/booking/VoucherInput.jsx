import { useState } from "react";
import { voucherService } from "../../services/voucherService";
import { Button } from "@/components/ui/button";

const VoucherInput = ({ voucher, setVoucher, setError, combos, seatTotal }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const res = await voucherService.getVoucherByCode(input);
      if (!res || !res.isActive) throw new Error("Voucher is invalid or expired.");
      const startDate = new Date(res.startDate);
      const endDate = new Date(res.endDate);
      if (startDate > now || endDate < now) throw new Error("Voucher is invalid or expired.");
      const comboTotal = combos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
      const subtotal = (seatTotal || 0) + comboTotal;
      if (res.minPurchase && subtotal < res.minPurchase) {
        throw new Error(`Minimum order to apply this voucher is ${res.minPurchase.toLocaleString()} VND`);
      }
      setVoucher(res);
    } catch (err) {
      setVoucher(null);
      setError(err.message || "Voucher not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Enter voucher code..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <Button size="sm" onClick={handleApply} disabled={loading || !input}>Apply</Button>
      </div>
      {voucher && (
        <div className="text-green-600 text-sm mt-2">Applied: {voucher.code} - {voucher.discountType === "percentage" ? `Discount ${voucher.discountValue}%` : `Discount ${voucher.discountValue.toLocaleString()} VND`}</div>
      )}
    </div>
  );
};

export default VoucherInput;
