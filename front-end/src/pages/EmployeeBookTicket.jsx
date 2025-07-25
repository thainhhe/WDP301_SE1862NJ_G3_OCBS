import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Stepper, Step, StepLabel, Card } from "@mui/material";
import SeatSelection from "../components/booking/SeatSelection";
import ComboSelector from "../components/booking/ComboSelector";
import VoucherInput from "../components/booking/VoucherInput";
import CheckPayment from "../components/booking/CheckPayment";
import { movieService } from "@/services/movieService";
import { showtimeService } from "@/services/showtimeService";
import { bookingService } from "@/services/bookingService";
import CustomerSeatSelection from "../components/booking/CustomerSeatSelection";
import { Modal } from "antd";

const steps = [
  "Chọn phim",
  "Chọn suất chiếu",
  "Chọn ghế",
  "Chọn combo/voucher",
  "Thanh toán",
  "Xác nhận/in vé"
];

const EmployeeBookTicket = () => {
  const [activeStep, setActiveStep] = useState(0);
  // Phim
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  // Suất chiếu
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  // Ghế
  const [selectedSeats, setSelectedSeats] = useState([]);
  // Combo
  const [selectedCombos, setSelectedCombos] = useState([]);
  // Voucher
  const [voucher, setVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  // Thanh toán
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'qr'
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Tổng tiền
  const seatTotal = selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  const comboTotal = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  let discountAmount = 0;
  if (voucher) {
    const subtotal = seatTotal + comboTotal;
    if (voucher.discountType === "percentage") {
      discountAmount = Math.floor(subtotal * voucher.discountValue / 100);
      if (voucher.maxDiscount > 0) discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    } else if (voucher.discountType === "fixed") {
      discountAmount = voucher.discountValue;
      if (voucher.maxDiscount > 0) discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    }
  }
  const finalTotal = Math.max(seatTotal + comboTotal - discountAmount, 0);

  // Lấy danh sách phim
  useEffect(() => {
    movieService.getMovies().then(data => setMovies(data.movies || [])).catch(() => setMovies([]));
  }, []);

  // Lấy danh sách suất chiếu khi chọn phim
  useEffect(() => {
    if (selectedMovie) {
      showtimeService.getShowtimes({ movie: selectedMovie._id, limit: 50 })
        .then(res => setShowtimes(res.showtimes || []))
        .catch(() => setShowtimes([]));
    }
  }, [selectedMovie]);

  // Đặt vé
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [paymentCheckText, setPaymentCheckText] = useState("");

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

  // Thêm vào useEffect để mở modal QR khi chọn phương thức 'qr'
  useEffect(() => {
    if (paymentMethod === 'qr' && !bookingResult && activeStep === 4) {
      const randomText = generateRandomText(10);
      setPaymentCheckText(randomText);
      setQrCodeValue(generateQRCodeUrl(finalTotal, randomText));
      setShowQRCode(true);
    } else {
      setShowQRCode(false);
    }
    // eslint-disable-next-line
  }, [paymentMethod, finalTotal, bookingResult, activeStep]);

  const handleBooking = async () => {
    setLoading(true);
    setError("");
    setBookingResult(null);
    try {
      const bookingData = {
        showtimeId: selectedShowtime._id,
        seatIds: selectedSeats.map(s => s._id),
        combos: selectedCombos.map(c => ({ combo: c._id, quantity: c.quantity })),
        voucherId: voucher?._id,
        employeeMode: true,
      };
      const res = await bookingService.createBooking(bookingData);
      let booking = res.booking || res;
      if (res && (res.success || res.booking)) {
        if (paymentMethod === 'qr') {
          // Tạo mã chuyển khoản động và hiển thị modal QR
          const randomText = generateRandomText(10);
          setPaymentCheckText(randomText);
          setQrCodeValue(generateQRCodeUrl(finalTotal, randomText));
          setBookingResult(booking);
          setShowQRCode(true);
          setActiveStep(4); // Giữ ở bước thanh toán
          setLoading(false);
          return;
        } else if (paymentMethod === 'cash') {
          try {
            await bookingService.updatePaymentStatus(booking._id, {
              paymentStatus: 'completed',
              paymentMethod: 'cash',
            });
            // Lấy lại thông tin booking đã cập nhật
            const updated = await bookingService.getBookingById(booking._id);
            setBookingResult(updated.booking || updated);
          } catch (err) {
            setError('Cập nhật trạng thái thanh toán thất bại.');
            return;
          }
        } else {
          setBookingResult(booking);
        }
        setActiveStep(5);
      } else {
        setError(res.message || "Đặt vé thất bại");
      }
    } catch (err) {
      setError(err.message || "Đặt vé thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Thay thế hàm chọn suất chiếu:
  const handleSelectShowtime = async (showtime) => {
    try {
      const detail = await showtimeService.getShowtimeById(showtime._id);
      setSelectedShowtime(detail);
      setActiveStep(2);
    } catch (err) {
      // Có thể show thông báo lỗi nếu cần
    }
  };

  // Đảm bảo khi chọn ghế, mỗi seat đều có price đúng
  const handleSeatSelectionChange = (seats) => {
    setSelectedSeats(
      seats.map(s => ({
        ...s,
        price: s.price !== undefined ? s.price : (s.availability?.price || 0)
      }))
    );
  };

  // Sửa lại handlePaymentSuccess để tạo booking và cập nhật trạng thái khi thanh toán QR thành công
  const handlePaymentSuccess = async () => {
    setLoading(true);
    setError(null);
    try {
      // Tạo booking trước
      const bookingData = {
        showtimeId: selectedShowtime._id,
        seatIds: selectedSeats.map(s => s._id),
        combos: selectedCombos.map(c => ({ combo: c._id, quantity: c.quantity })),
        voucherId: voucher?._id,
        employeeMode: true,
      };
      const res = await bookingService.createBooking(bookingData);
      let booking = res.booking || res;
      // Cập nhật trạng thái thanh toán
      await bookingService.updatePaymentStatus(booking._id, {
        paymentStatus: "completed",
        transactionId: paymentCheckText,
        paymentMethod: "bank_transfer",
      });
      // Lấy lại thông tin booking đã cập nhật
      const updated = await bookingService.getBookingById(booking._id);
      setBookingResult(updated.booking || updated);
      setShowQRCode(false);
      setPaymentMethod('cash'); // reset về mặc định để tránh lặp
      setActiveStep(5);
    } catch (err) {
      setError("Đặt vé hoặc cập nhật trạng thái thanh toán thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Đặt vé cho khách</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>
      {/* Bước 1: Chọn phim */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" mb={2}>Chọn phim</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {movies.map(movie => (
              <Card key={movie._id} sx={{ width: 200, cursor: 'pointer', border: selectedMovie?._id === movie._id ? '2px solid #1976d2' : '1px solid #eee' }} onClick={() => { setSelectedMovie(movie); setActiveStep(1); }}>
                <img src={movie.poster?.startsWith('http') ? movie.poster : `http://localhost:5000/${movie.poster?.replace(/^\/+/, '')}`} alt={movie.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                <Box p={1}><Typography fontWeight="bold">{movie.title}</Typography></Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}
      {/* Bước 2: Chọn suất chiếu */}
      {activeStep === 1 && selectedMovie && (
        <Box>
          <Typography variant="h6" mb={2}>Chọn suất chiếu</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {showtimes
              .filter(showtime => new Date(showtime.startTime) > new Date())
              .map(showtime => (
                <Card key={showtime._id} sx={{ width: 260, cursor: 'pointer', border: selectedShowtime?._id === showtime._id ? '2px solid #1976d2' : '1px solid #eee' }} onClick={() => handleSelectShowtime(showtime)}>
                  <Box p={2}>
                    <Typography fontWeight="bold">{new Date(showtime.startTime).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</Typography>
                    <Typography variant="body2">Rạp: {showtime.branch?.name} - {showtime.theater?.name}</Typography>
                    <Typography variant="body2">Trạng thái: {showtime.status}</Typography>
                  </Box>
                </Card>
              ))}
          </Box>
        </Box>
      )}
      {/* Bước 3: Chọn ghế */}
      {activeStep === 2 && selectedShowtime && (
        <Box>
          <Typography variant="h6" mb={2}>Chọn ghế</Typography>
          <CustomerSeatSelection
            showtimeId={selectedShowtime._id}
            onSeatSelectionChange={handleSeatSelectionChange}
            maxSeats={8}
          />
          {selectedSeats.length > 0 && (
            <Box mt={3} p={2} border={1} borderColor="#eee" borderRadius={2}>
              <Typography fontWeight="bold">Giá từng ghế đã chọn:</Typography>
              {selectedSeats.map(s => (
                <div key={s._id}>{s.row}{s.number} - {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(s.price || 0)}</div>
              ))}
            </Box>
          )}
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => setActiveStep(1)}>Quay lại</Button>
            <Button variant="contained" color="primary" disabled={selectedSeats.length === 0} onClick={() => setActiveStep(3)}>Tiếp tục</Button>
          </Box>
        </Box>
      )}
      {/* Bước 4: Chọn combo/voucher */}
      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" mb={2}>Chọn combo và voucher</Typography>
          <ComboSelector combos={selectedCombos} setCombos={setSelectedCombos} />
          <Box mt={3}>
            <VoucherInput voucher={voucher} setVoucher={setVoucher} setError={setVoucherError} combos={selectedCombos} seatTotal={seatTotal} />
            {voucherError && <Typography color="error">{voucherError}</Typography>}
          </Box>
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => setActiveStep(2)}>Quay lại</Button>
            <Button variant="contained" color="primary" onClick={() => setActiveStep(4)}>Tiếp tục</Button>
          </Box>
        </Box>
      )}
      {/* Bước 5: Thanh toán */}
      {activeStep === 4 && (
        <Box>
          {/* Chi tiết giá */}
          <Box mb={3} p={2} border={1} borderColor="#eee" borderRadius={2} bgcolor="#fafafa">
            <Typography fontWeight="bold">Chi tiết giá</Typography>
            <Box mt={1}>
              <div>Ghế đã chọn: {selectedSeats.map(s => s.row + s.number).join(", ") || "-"}</div>
              <div>Tiền ghế: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(seatTotal)}</div>
              <div>Tiền combo: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(comboTotal)}</div>
              <div>Giảm giá voucher: -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountAmount)}</div>
              <div style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: 18, marginTop: 8 }}>Tổng cộng: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotal)}</div>
            </Box>
          </Box>
          <Typography variant="h6" mb={2}>Chọn phương thức thanh toán</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('cash')}
            >
              Tiền mặt
            </Button>
            <Button
              variant={paymentMethod === 'qr' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('qr')}
            >
              Quét mã QR
            </Button>
          </Box>
          {paymentMethod === 'qr' && (
            <Modal
              open={showQRCode}
              onCancel={() => setShowQRCode(false)}
              footer={null}
              maskClosable={false}
              closable={true}
              title="Quét mã QR để thanh toán"
            >
              <div className="text-center">
                <p className="mb-2">
                  Vui lòng chuyển khoản đúng số tiền và nội dung.
                </p>
                <p className="mb-2">
                  Nội dung: <strong className="text-red-600">{paymentCheckText}</strong>
                </p>
                <img
                  src={qrCodeValue}
                  alt="QR Code"
                  style={{ maxWidth: "100%", margin: "auto", display: "block" }}
                />
                <CheckPayment
                  totalMoney={finalTotal}
                  txt={paymentCheckText}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            </Modal>
          )}
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => setActiveStep(3)}>Quay lại</Button>
            <Button
              variant="contained"
              color="primary"
              disabled={paymentMethod === 'cash' && selectedSeats.length === 0}
              onClick={handleBooking}
            >
              Xác nhận đặt vé
            </Button>
          </Box>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      )}
      {/* Bước 6: In vé */}
      {activeStep === 5 && (
        bookingResult ? (
          <div className="print-ticket">
            <Box sx={{ maxWidth: 600, mx: 'auto', p: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" mb={2}>Vé đã đặt thành công!</Typography>
              <Typography>Phim: {selectedMovie?.title}</Typography>
              <Typography>Suất chiếu: {selectedShowtime && new Date(selectedShowtime.startTime).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</Typography>
              <Typography>Ghế: {selectedSeats.map(s => s.row + s.number).join(', ')}</Typography>
              <Typography fontWeight="bold" mt={2}>Tổng tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotal)}</Typography>
              {/* Hiển thị mã QR check-in thực tế */}
              {(bookingResult.qrCode || bookingResult.booking?.qrCode) && (
                <Box mt={3} textAlign="center">
                  <img src={bookingResult.qrCode || bookingResult.booking?.qrCode} alt="QR check-in" style={{ width: 180, margin: '16px auto' }} />
                  <Typography variant="caption" color="text.secondary">Mã QR check-in</Typography>
                </Box>
              )}
              <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => window.print()}>In vé</Button>
            </Box>
          </div>
        ) : (
          <Box sx={{ maxWidth: 600, mx: 'auto', p: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error" mb={2}>Không tìm thấy thông tin vé!</Typography>
            <Typography>Vui lòng thao tác lại hoặc liên hệ quản trị viên.</Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default EmployeeBookTicket;
