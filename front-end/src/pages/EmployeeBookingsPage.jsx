import React, { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Button, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';

const EmployeeBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleShowQR = (booking) => {
    setSelectedBooking(booking);
    setQrOpen(true);
  };
  const handleCloseQR = () => {
    setQrOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy tất cả booking do employee tạo hoặc tất cả booking (tùy backend)
        const res = await bookingService.getAllBookingsForEmployee();
        setBookings(res.bookings || []);
      } catch (err) {
        setError("Không thể tải danh sách vé!");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Danh sách vé đã đặt</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã vé</TableCell>
                <TableCell>Phim</TableCell>
                <TableCell>Suất chiếu</TableCell>
                <TableCell>Ghế</TableCell>
                <TableCell>Khách</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Mã QR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{b._id}</TableCell>
                  <TableCell>{b.showtime?.movie?.title || ""}</TableCell>
                  <TableCell>{b.showtime?.startTime ? new Date(b.showtime.startTime).toLocaleString() : ""}</TableCell>
                  <TableCell>{b.seats?.map(s => s.row + s.number).join(", ")}</TableCell>
                  <TableCell>{b.customerInfo?.name || b.user?.name || ""}</TableCell>
                  <TableCell>{b.bookingStatus}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleShowQR(b)} size="small">
                      <QrCodeIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Modal hiển thị QR */}
      <Dialog open={qrOpen} onClose={handleCloseQR} maxWidth="xs" fullWidth>
        <DialogTitle>Mã QR vé</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedBooking && (
            <>
              <Typography variant="subtitle1" mb={2}>Mã vé: {selectedBooking._id}</Typography>
              {selectedBooking.qrCode ? (
                <img src={selectedBooking.qrCode} alt="QR Code" style={{ maxWidth: 256, margin: 'auto' }} />
              ) : (
                <Typography variant="body2" color="text.secondary">Không có mã QR. Mã vé: {selectedBooking._id}</Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeeBookingsPage; 