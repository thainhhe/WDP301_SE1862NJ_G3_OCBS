
import React, { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem } from "@mui/material";
import { Button, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';

const EmployeeBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // Thêm state cho filter/search
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    date: "",
  });

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

    // Lắng nghe sự kiện check-in để reload danh sách
    const handleCheckedIn = () => fetchBookings();
    window.addEventListener('bookingCheckedIn', handleCheckedIn);
    return () => window.removeEventListener('bookingCheckedIn', handleCheckedIn);
  }, []);

  // Lọc dữ liệu bookings theo filter/search
  const filteredBookings = bookings.filter((b) => {
    // Lọc theo search
    const searchMatch =
      filters.search === "" ||
      b._id.includes(filters.search) ||
      (b.showtime?.movie?.title || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (b.customerInfo?.name || b.user?.name || "").toLowerCase().includes(filters.search.toLowerCase());
    // Lọc theo trạng thái
    const statusMatch =
      filters.status === "all" ||
      (filters.status === "checkedin" && b.checkedIn) ||
      (filters.status === "notcheckedin" && !b.checkedIn);
    // Lọc theo ngày
    const dateMatch =
      !filters.date ||
      (b.showtime?.startTime && new Date(b.showtime.startTime).toISOString().slice(0, 10) === filters.date);
    return searchMatch && statusMatch && dateMatch;
  });

  // Hàm kiểm tra vé hết hạn
  const isBookingExpired = (booking) => {
    if (!booking.showtime) return false;
    const now = new Date();
    const endTime = booking.showtime.endTime ? new Date(booking.showtime.endTime) : new Date(booking.showtime.startTime);
    return !booking.checkedIn && now > endTime;
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Danh sách vé đã đặt</Typography>
      {/* Thanh search & filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <TextField
          select
          label="Trạng thái"
          size="small"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="checkedin">Đã check-in</MenuItem>
          <MenuItem value="notcheckedin">Chưa check-in</MenuItem>
        </TextField>
        <TextField
          label="Ngày suất chiếu"
          type="date"
          size="small"
          value={filters.date}
          onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
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
              {filteredBookings.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{b._id}</TableCell>
                  <TableCell>{b.showtime?.movie?.title || ""}</TableCell>
                  <TableCell>{b.showtime?.startTime ? new Date(b.showtime.startTime).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : ""}</TableCell>
                  <TableCell>{b.seats?.map(s => s.row + s.number).join(", ")}</TableCell>
                  <TableCell>{b.customerInfo?.name || b.user?.name || ""}</TableCell>
                  <TableCell>
                    {b.checkedIn
                      ? 'Đã check-in'
                      : isBookingExpired(b)
                        ? 'Hết hạn'
                        : 'Chưa check-in'}
                  </TableCell>
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