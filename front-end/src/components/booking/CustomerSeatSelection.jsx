import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatVND } from "@/utils/currencyUtils";
import {
  Users,
  Crown,
  Heart,
  X,
  AlertCircle,
  Monitor,
  DollarSign,
} from "lucide-react";
import { seatService } from "../../services/seatService";
import socketService from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";

const CustomerSeatSelection = ({
  showtimeId,
  onSeatSelectionChange,
  maxSeats = 8,
  onPriceChange,
}) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Khởi tạo WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token"); // Giả định token được lưu trong localStorage
    if (token && showtimeId) {
      socketService.connect(token);
      socketService.joinShowtime(showtimeId);

      // Lắng nghe các sự kiện từ server
      socketService.on("initial-seat-status", (data) => {
        setSeats(data.seats || []);
      });

      socketService.on("seats-being-selected", ({ seatIds, userId }) => {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            seatIds.includes(seat._id)
              ? {
                  ...seat,
                  availability: { ...seat.availability, status: "reserved" },
                }
              : seat
          )
        );
      });

      socketService.on("seats-reserved-for-payment", ({ seatIds }) => {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            seatIds.includes(seat._id)
              ? {
                  ...seat,
                  availability: { ...seat.availability, status: "reserved" },
                }
              : seat
          )
        );
      });

      socketService.on("seats-released", ({ seatIds }) => {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            seatIds.includes(seat._id)
              ? {
                  ...seat,
                  availability: { ...seat.availability, status: "available" },
                }
              : seat
          )
        );
        // Xóa các ghế đã giải phóng khỏi selectedSeats
        setSelectedSeats((prev) =>
          prev.filter((s) => !seatIds.includes(s._id))
        );
      });

      socketService.on("seat-selection-failed", ({ message }) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
      });
    }

    return () => {
      socketService.leaveShowtime(showtimeId);
      socketService.disconnect();
    };
  }, [showtimeId]);

  useEffect(() => {
    if (showtimeId) {
      fetchSeatAvailability();
    }
  }, [showtimeId]);

  useEffect(() => {
    if (onSeatSelectionChange) {
      onSeatSelectionChange(selectedSeats);
    }
    if (onPriceChange) {
      const totalPrice = calculateTotalPrice();
      onPriceChange(totalPrice);
    }
  }, [selectedSeats, onSeatSelectionChange, onPriceChange]);

  const fetchSeatAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await seatService.getSeatAvailability(showtimeId);
      setSeats(data || []);
    } catch (error) {
      console.error("Error fetching seat availability:", error);
      setError("Không thể tải thông tin ghế. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const validateGapRule = useCallback(
    (newSelection) => {
      if (newSelection.length <= 1) return { valid: true };

      const seatsByRow = {};
      newSelection.forEach((seat) => {
        if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
        seatsByRow[seat.row].push(seat);
      });

      for (const row in seatsByRow) {
        const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);
        for (let i = 0; i < rowSeats.length - 1; i++) {
          const current = rowSeats[i];
          const next = rowSeats[i + 1];
          const gap = next.number - current.number;

          if (gap === 2) {
            const middleSeatNumber = current.number + 1;
            const middleSeat = seats.find(
              (seat) =>
                seat.row === current.row && seat.number === middleSeatNumber
            );
            if (middleSeat && middleSeat.availability?.status === "available") {
              return {
                valid: false,
                message: `Không thể để trống một ghế giữa ${current.row}${current.number} và ${next.row}${next.number}. Vui lòng chọn ghế ở giữa hoặc chọn ghế khác.`,
              };
            }
          }
        }
      }
      return { valid: true };
    },
    [seats]
  );

  const handleSeatClick = useCallback(
    async (seat) => {
      // Lấy trạng thái ghế mới nhất từ server
      const latestStatus = await seatService.getSeatAvailability(showtimeId);
      const currentSeat = latestStatus.find((s) => s._id === seat._id);

      // Kiểm tra nếu ghế đang được giữ và không phải do chính người dùng này chọn
      if (
        currentSeat.availability?.status === "reserved" &&
        !selectedSeats.some((s) => s._id === seat._id)
      ) {
        const expirationTime = new Date(
          currentSeat.availability.reservationExpires
        );
        const remainingSecondsTotal = Math.round(
          (expirationTime.getTime() - new Date().getTime()) / 1000
        );

        if (remainingSecondsTotal > 0) {
          // Tính toán số phút và giây còn lại
          const minutes = Math.floor(remainingSecondsTotal / 60);
          const seconds = remainingSecondsTotal % 60;

          // Tạo chuỗi thông báo mới
          const timeString = `${
            minutes > 0 ? `${minutes} phút ` : ""
          }${seconds} giây`;
          setError(
            `Ghế ${seat.row}${seat.number} đang được giữ. Bạn có thể thử lại sau ${timeString}.`
          );
        } else {
          setError(
            `Ghế ${seat.row}${seat.number} đang được giữ. Vui lòng tải lại trang.`
          );
        }

        // Tự động xóa thông báo sau 5 giây
        setTimeout(() => setError(null), 5000);
        return;
      }

      if (
        currentSeat.availability?.status !== "available" &&
        !selectedSeats.some((s) => s._id === seat._id)
      ) {
        setError(`Ghế ${seat.row}${seat.number} không còn trống`);
        setTimeout(() => setError(null), 5000);
        return;
      }

      const isSelected = selectedSeats.some((s) => s._id === seat._id);
      let newSelection;

      if (isSelected) {
        newSelection = selectedSeats.filter((s) => s._id !== seat._id);
      } else {
        if (selectedSeats.length >= maxSeats) {
          setError(`Chỉ được chọn tối đa ${maxSeats} ghế`);
          setTimeout(() => setError(null), 3000);
          return;
        }
        newSelection = [...selectedSeats, seat];
      }

      const validation = seatService.validateSeatSelection(
        newSelection,
        latestStatus
      );
      if (!validation.valid) {
        setError(validation.message);
        setTimeout(() => setError(null), 5000);
        return;
      }

      setError(null);
      setSelectedSeats(newSelection);

      // Phần còn lại của hàm giữ nguyên...
      try {
        if (newSelection.length > 0) {
          socketService.selectSeats(
            showtimeId,
            newSelection.map((s) => s._id)
          );
          await new Promise((resolve, reject) => {
            socketService.on("seat-selection-success", () => resolve());
            socketService.on("seat-selection-failed", ({ message }) => {
              setError(message);
              setTimeout(() => setError(null), 5000);
              reject(new Error(message));
            });
          });
          await seatService.reserveSeats(
            showtimeId,
            newSelection.map((s) => s._id),
            user._id
          );
        } else if (selectedSeats.length > 0) {
          const latestStatus = await seatService.getSeatAvailability(
            showtimeId
          );
          const seatsToRelease = selectedSeats.filter((s) =>
            latestStatus.some(
              (ls) => ls._id === s._id && ls.availability?.status === "reserved"
            )
          );
          const seatIdsToRelease = seatsToRelease.map((s) => s._id);
          if (seatIdsToRelease.length > 0) {
            await seatService.releaseReservation(showtimeId, seatIdsToRelease);
            socketService.releaseSeats(showtimeId, seatIdsToRelease);
          }
        }
        setSeats(latestStatus);
      } catch (error) {
        setError(error.message || "Không thể xử lý ghế. Vui lòng thử lại.");
        console.error("Error in handleSeatClick:", {
          error: error.message,
          showtimeId,
          seatIds: selectedSeats.map((s) => s._id),
        });
        setTimeout(() => setError(null), 5000);
      }
    },
    [selectedSeats, seats, maxSeats, showtimeId]
  );

  const getSeatIcon = (seat) => {
    switch (seat.type) {
      case "vip":
        return <Crown className="w-4 h-4" />;
      case "couple":
        return <Heart className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.some((s) => s._id === seat._id);
    if (isSelected) {
      return "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400 ring-offset-1";
    }
    switch (seat.availability?.status) {
      case "available":
        switch (seat.type) {
          case "vip":
            return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 cursor-pointer";
          case "couple":
            return "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200 cursor-pointer";
          default:
            return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer";
        }
      case "reserved":
        return "bg-orange-100 text-orange-800 border-orange-300 cursor-not-allowed";
      case "booked":
        return "bg-red-100 text-red-800 border-red-300 cursor-not-allowed";
      case "blocked":
        return "bg-gray-100 text-gray-800 border-gray-300 cursor-not-allowed";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 cursor-not-allowed";
    }
  };

  const getSeatStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "reserved":
        return "Reserved";
      case "booked":
        return "Booked";
      case "blocked":
        return "Blocked";
      default:
        return "Unavailable";
    }
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + (seat.availability?.price || 0);
    }, 0);
  };

  const formatPrice = formatVND;

  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });
    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => a.number - b.number);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && seats.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không thể tải ghế
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSeatAvailability} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedSeats = groupSeatsByRow();
  const rowLabels = Object.keys(groupedSeats).sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chú thích ghế</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-green-800" />
              </div>
              <span>Còn trống</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 border border-blue-600 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span>Đã chọn</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                <X className="w-3 h-3 text-red-800" />
              </div>
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-orange-800" />
              </div>
              <span>Đang giữ</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center">
                <Crown className="w-3 h-3 text-yellow-800" />
              </div>
              <span>VIP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-pink-100 border border-pink-300 rounded flex items-center justify-center">
                <Heart className="w-3 h-3 text-pink-800" />
              </div>
              <span>Couple</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 mr-2" />
            MÀN HÌNH
          </CardTitle>
          <div className="w-full h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {rowLabels.map((row) => (
              <div
                key={row}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-8 text-center font-medium text-gray-700">
                  {row}
                </div>
                <div className="flex space-x-1">
                  {groupedSeats[row].map((seat) => {
                    const isSelected = selectedSeats.some(
                      (s) => s._id === seat._id
                    );
                    const isClickable =
                      seat.availability?.status === "available";
                    return (
                      <button
                        key={seat._id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!isClickable}
                        className={`
                          w-8 h-8 rounded border-2 flex items-center justify-center
                          transition-all duration-200 text-xs font-medium
                          ${getSeatColor(seat)}
                          ${isClickable ? "transform hover:scale-110" : ""}
                        `}
                        title={`${seat.row}${seat.number} - ${
                          seat.type
                        } - ${getSeatStatusText(
                          seat.availability?.status
                        )} - ${formatPrice(seat.availability?.price || 0)}`}
                      >
                        {seat.availability?.status === "available" ||
                        isSelected ? (
                          getSeatIcon(seat)
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="w-8 text-center font-medium text-gray-700">
                  {row}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Ghế đã chọn ({selectedSeats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <Badge
                    key={seat._id}
                    variant="outline"
                    className="flex items-center space-x-1 px-3 py-1"
                  >
                    {getSeatIcon(seat)}
                    <span>
                      {seat.row}
                      {seat.number}
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatPrice(seat.availability?.price || 0)}
                    </span>
                    <button
                      onClick={() => handleSeatClick(seat)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-medium">Tổng giá:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(calculateTotalPrice())}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Tối đa được chọn {maxSeats} ghế</p>
                <p>• Không được để trống một ghế giữa các ghế đã chọn</p>
                <p>• Ghế VIP và Couple có giá cao hơn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Quy tắc chọn ghế:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Nhấn vào ghế trống để chọn</li>
            <li>• Không được để trống một ghế giữa các ghế đã chọn</li>
            <li>• Ghế VIP (👑) và Couple (💕) có giá cao hơn</li>
            <li>• Tối đa được chọn {maxSeats} ghế mỗi lần đặt</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSeatSelection;
