import api from "./api";

export const seatStatusService = {
  // Lấy trạng thái tất cả các ghế cho một suất chiếu cụ thể
  async getSeatStatusByShowtime(showtimeId) {
    try {
      const response = await api.get(`/seat-status/${showtimeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching seat status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch seat status"
      );
    }
  },

  // Đặt tạm thời các ghế
  async reserveSeats(showtimeId, seatIds, reservationMinutes = 10) {
    try {
      const response = await api.post("/seat-status/reserve", {
        showtimeId,
        seatIds,
        reservationMinutes,
      });
      return response.data;
    } catch (error) {
      console.error("Error reserving seats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reserve seats"
      );
    }
  },

  // Hủy đặt tạm thời ghế (release reservation)
  async releaseReservation(showtimeId, seatIds) {
    try {
      const response = await api.post("/seat-status/release", {
        showtimeId,
        seatIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error releasing reservation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to release reservation"
      );
    }
  },

  // Đặt (thanh toán) các ghế đã reserved
  async bookSeats(showtimeId, seatIds, userId, bookingId = null) {
    // bookingId có thể được dùng nếu bạn muốn liên kết đặt ghế với một booking đã tồn tại
    try {
      const response = await api.post("/seat-status/book", {
        showtimeId,
        seatIds,
        userId,
        bookingId,
      });
      return response.data;
    } catch (error) {
      console.error("Error booking seats:", error);
      throw new Error(error.response?.data?.message || "Failed to book seats");
    }
  },

  // Chặn/bỏ chặn ghế (dành cho Admin)
  async toggleSeatBlock(showtimeId, seatIds, block = true) {
    try {
      const response = await api.put("/seat-status/block", {
        showtimeId,
        seatIds,
        block,
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling seat block:", error);
      throw new Error(
        error.response?.data?.message || "Failed to toggle seat block"
      );
    }
  },
};
