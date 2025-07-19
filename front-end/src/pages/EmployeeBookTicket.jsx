import React, { useState } from "react";
import MovieCard from "@/components/movies/MovieCard";
import ShowtimeCard from "@/components/showtimes/ShowtimeCard";
import SeatSelection from "@/components/booking/SeatSelection";
import ComboSelector from "@/components/booking/ComboSelector";
import VoucherInput from "@/components/booking/VoucherInput";
import { bookingService } from "@/services/bookingService";
import { movieService } from "@/services/movieService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Box, Typography, Button, TextField, Card, CardContent, Stepper, Step, StepLabel, Alert } from "@mui/material";

const steps = [
  "Chọn phim",
  "Chọn suất chiếu",
  "Chọn ghế",
  "Chọn combo/voucher",
  "Nhập thông tin khách",
  "Xác nhận"
];

const EmployeeBookTicket = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState([]);
  const [voucher, setVoucher] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  // Lấy danh sách phim khi vào bước 0
  React.useEffect(() => {
    if (activeStep === 0) {
      setLoadingMovies(true);
      movieService.getMovies({ status: "now-showing" })
        .then(data => setMovies(data.movies || []))
        .catch(() => setMovies([]))
        .finally(() => setLoadingMovies(false));
    }
  }, [activeStep]);

  // Step 1: Chọn phim
  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setActiveStep(1);
  };

  // Step 2: Chọn suất chiếu
  const handleSelectShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setActiveStep(2);
  };

  // Step 3: Chọn ghế
  const handleSelectSeats = (seats) => {
    setSelectedSeats(seats);
    setActiveStep(3);
  };

  // Step 4: Chọn combo/voucher
  const handleComboVoucherNext = (combos, voucher) => {
    setSelectedCombos(combos);
    setVoucher(voucher);
    setActiveStep(4);
  };

  // Step 5: Nhập thông tin khách
  const handleCustomerInfoNext = () => {
    setActiveStep(5);
  };

  // Step 6: Xác nhận đặt vé
  const handleBooking = async () => {
    setLoading(true);
    setError("");
    setBookingResult(null);
    try {
      const bookingData = {
        showtimeId: selectedShowtime._id,
        seatIds: selectedSeats.map(s => s._id),
        combos: selectedCombos,
        voucherId: voucher ? voucher._id : undefined,
        customerInfo,
        employeeMode: true,
      };
      const res = await bookingService.createBooking(bookingData);
      setBookingResult(res);
    } catch (err) {
      setError(err.message || "Đặt vé thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Đặt vé cho khách</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {bookingResult && <Alert severity="success" sx={{ mb: 2 }}>Đặt vé thành công! Mã vé: {bookingResult.booking?._id}</Alert>}
      {activeStep === 0 && (
        loadingMovies ? <LoadingSpinner /> : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {movies.map(movie => (
              <Box key={movie._id} sx={{ width: 220, cursor: 'pointer' }} onClick={() => handleSelectMovie(movie)}>
                <MovieCard movie={movie} />
              </Box>
            ))}
            {movies.length === 0 && <Typography>Không có phim nào khả dụng.</Typography>}
          </Box>
        )
      )}
      {activeStep === 1 && selectedMovie && (
        <ShowtimeCard movieId={selectedMovie._id} employeeMode onSelect={handleSelectShowtime} />
      )}
      {activeStep === 2 && selectedShowtime && (
        <SeatSelection showtimeId={selectedShowtime._id} employeeMode onSelect={handleSelectSeats} />
      )}
      {activeStep === 3 && selectedShowtime && selectedSeats.length > 0 && (
        <ComboSelector showtimeId={selectedShowtime._id} employeeMode onNext={handleComboVoucherNext} />
      )}
      {activeStep === 4 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Thông tin khách hàng</Typography>
            <TextField label="Tên khách" fullWidth sx={{ my: 1 }} value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
            <TextField label="Email" fullWidth sx={{ my: 1 }} value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
            <TextField label="Số điện thoại" fullWidth sx={{ my: 1 }} value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleCustomerInfoNext}>Tiếp tục</Button>
          </CardContent>
        </Card>
      )}
      {activeStep === 5 && (
        <Box>
          <Typography variant="h6" mb={2}>Xác nhận thông tin đặt vé</Typography>
          <Typography>Phim: {selectedMovie?.title}</Typography>
          <Typography>Suất chiếu: {selectedShowtime?.startTime && new Date(selectedShowtime.startTime).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</Typography>
          <Typography>Ghế: {selectedSeats.map(s => s.name || `${s.row}${s.number}`).join(", ")}</Typography>
          <Typography>Combo: {selectedCombos.length > 0 ? selectedCombos.map(c => c.comboName || c.combo).join(", ") : "Không"}</Typography>
          <Typography>Voucher: {voucher?.code || "Không"}</Typography>
          <Typography>Khách: {customerInfo.name} - {customerInfo.email} - {customerInfo.phone}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleBooking} disabled={loading}>Xác nhận đặt vé</Button>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeBookTicket; 