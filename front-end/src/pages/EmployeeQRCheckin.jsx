import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { verifyTicket, checkInTicket } from "@/services/bookingService";

const EmployeeQRCheckin = () => {
  const [qrResult, setQrResult] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleScan = async (data) => {
    if (data && data.text !== qrResult) {
      setQrResult(data.text);
      setError("");
      setSuccess("");
      try {
        const res = await verifyTicket(data.text);
        if (res.data.valid) {
          setTicketInfo(res.data.ticket);
        } else {
          setTicketInfo(null);
          setError(res.data.message || "Vé không hợp lệ!");
        }
      } catch (err) {
        setTicketInfo(null);
        setError("Không thể xác thực vé!");
      }
    }
  };

  const handleError = (err) => {
    setError("Lỗi camera hoặc không thể truy cập camera!");
  };

  // ... giữ nguyên phần render như cũ, chỉ thay QrReader bằng QrScanner ...
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h2>Quét mã QR xác thực vé</h2>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%" }}
      />
      {/* ... phần còn lại giữ nguyên ... */}
    </div>
  );
};

export default EmployeeQRCheckin;