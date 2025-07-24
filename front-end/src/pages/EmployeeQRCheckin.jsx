import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { verifyTicket, checkInTicket } from "@/services/bookingService";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const EmployeeQRCheckin = () => {
  const [qrResult, setQrResult] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const handleScan = async (data) => {
    if (data && data.text !== qrResult) {
      setQrResult(data.text);
      setError("");
      setSuccess("");
      try {
        const res = await verifyTicket(data.text);
        if (res.data.valid) {
          setTicketInfo(res.data.ticket);
          setOpenDialog(true);
        } else {
          if (res.data.ticket) {
            setTicketInfo(res.data.ticket);
            setError(res.data.message || "Vé không hợp lệ!");
            setOpenDialog(true);
          } else {
            setTicketInfo(null);
            setError(res.data.message || "Vé không hợp lệ!");
          }
        }
      } catch (err) {
        // Xử lý lỗi 400 từ backend (lấy thông tin từ error.response.data)
        const data = err.response?.data;
        if (data && data.ticket) {
          setTicketInfo(data.ticket);
          setError(data.message || "Vé không hợp lệ!");
          setOpenDialog(true);
        } else {
          setTicketInfo(null);
          setError(data?.message || "Không thể xác thực vé!");
        }
      }
    }
  };

  const handleError = (err) => {
    setError("Lỗi camera hoặc không thể truy cập camera!");
  };

  const handleConfirmCheckin = async () => {
    if (!ticketInfo) return;
    try {
      const res = await checkInTicket(ticketInfo.bookingId);
      if (res.data.success) {
        setTicketInfo({ ...ticketInfo, checkedIn: true });
        setSuccess("Xác nhận check-in thành công!");
        setError("");
        // Phát custom event để thông báo cho trang danh sách vé
        window.dispatchEvent(new CustomEvent('bookingCheckedIn', { detail: { bookingId: ticketInfo.bookingId } }));
      } else {
        setError(res.data.message || "Không thể xác nhận check-in!");
        setSuccess("");
      }
    } catch (err) {
      setError("Không thể xác nhận check-in!");
      setSuccess("");
    }
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
      <Dialog open={openDialog && !!ticketInfo} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thông tin vé</DialogTitle>
        <DialogContent>
          {ticketInfo && (
            <div style={{ marginTop: 8 }}>
              <div><b>Phim:</b> {ticketInfo.movie}</div>
              <div><b>Suất chiếu:</b> {new Date(ticketInfo.showtime).toLocaleString()}</div>
              <div><b>Rạp:</b> {ticketInfo.branch} - {ticketInfo.theater}</div>
              <div><b>Ghế:</b> {ticketInfo.seats.join(", ")}</div>
              <div><b>Trạng thái:</b> {ticketInfo.checkedIn ? "Đã check-in" : "Chưa check-in"}</div>
              {/* Nếu có lỗi (hết hạn, không hợp lệ,...) thì show màu đỏ */}
              {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
              {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {/* Nếu vé chưa check-in và không bị hết hạn thì mới cho check-in */}
          {!ticketInfo?.checkedIn && !error && (
            <Button onClick={handleConfirmCheckin} variant="contained" color="primary">
              Xác nhận check-in
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)} variant="contained">Đóng</Button>
        </DialogActions>
      </Dialog>
      {error && (
        <div style={{ color: "red", marginTop: 16 }}>{error}</div>
      )}
    </div>
  );
};

export default EmployeeQRCheckin;