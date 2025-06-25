import SeatStatus from "../models/seatStatusModel.js";
import { broadcastSeatUpdate } from "../socket/socketHandlers.js";

const cleanupExpiredReservations = async () => {
  try {
    const now = new Date();

    const updateResult = await SeatStatus.updateMany(
      {
        status: "reserved",
        reservationExpires: { $lt: now },
      },
      {
        $set: {
          status: "available",
          reservedAt: null,
          reservationExpires: null,
          reservedBy: null,
        },
      }
    );

    // Phát thông báo cho các client WebSocket nếu có ghế được giải phóng
    if (updateResult.modifiedCount > 0) {
      const affectedStatuses = await SeatStatus.find({
        status: "available",
        reservedAt: null,
        reservationExpires: null,
      }).select("showtime seat");

      const showtimeGroups = {};
      affectedStatuses.forEach((status) => {
        const showtimeId = status.showtime.toString();
        if (!showtimeGroups[showtimeId]) showtimeGroups[showtimeId] = [];
        showtimeGroups[showtimeId].push(status.seat);
      });

      for (const showtimeId in showtimeGroups) {
        broadcastSeatUpdate(showtimeId, {
          type: "seats-released",
          seatIds: showtimeGroups[showtimeId],
          reason: "reservation-expired",
          timestamp: new Date(),
        });
      }

      console.log(`Đã dọn dẹp ${updateResult.modifiedCount} ghế hết hạn`);
    }
  } catch (error) {
    console.error("Lỗi khi dọn dẹp ghế hết hạn:", error);
  }
};

export default cleanupExpiredReservations;
