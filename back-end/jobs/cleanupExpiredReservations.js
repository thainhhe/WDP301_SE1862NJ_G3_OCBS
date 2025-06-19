import cron from "node-cron";
import SeatStatus from "../models/seatStatusModel.js";

// Cleanup expired reservations every 5 minutes
const cleanupExpiredReservations = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      const result = await SeatStatus.updateMany(
        {
          status: "reserved",
          reservationExpires: { $lt: now },
        },
        {
          $set: {
            status: "available",
            reservedAt: null,
            reservationExpires: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `Cleaned up ${result.modifiedCount} expired seat reservations`
        );
      }
    } catch (error) {
      console.error("Error cleaning up expired reservations:", error);
    }
  });

  console.log("Expired reservations cleanup job started");
};

export default cleanupExpiredReservations;
