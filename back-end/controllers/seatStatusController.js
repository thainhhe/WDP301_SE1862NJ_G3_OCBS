import asyncHandler from "express-async-handler";
import SeatStatus from "../models/seatStatusModel.js";
import Showtime from "../models/showtimeModel.js";

// Reserve seats temporarily - POST /api/seat-status/reserve - Private
const reserveSeats = asyncHandler(async (req, res) => {
  const { showtimeId, seatIds, reservationMinutes = 10 } = req.body;

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    res.status(404);
    throw new Error("Showtime not found");
  }

  // Check if seats are available
  const seatStatuses = await SeatStatus.find({
    showtime: showtimeId,
    seat: { $in: seatIds },
  });

  const unavailableSeats = seatStatuses.filter(
    (status) => status.status !== "available"
  );

  if (unavailableSeats.length > 0) {
    res.status(400);
    throw new Error("Some seats are not available");
  }

  // Reserve seats
  const reservationExpires = new Date();
  reservationExpires.setMinutes(
    reservationExpires.getMinutes() + reservationMinutes
  );

  const updateResult = await SeatStatus.updateMany(
    {
      showtime: showtimeId,
      seat: { $in: seatIds },
      status: "available",
    },
    {
      $set: {
        status: "reserved",
        reservedAt: new Date(),
        reservationExpires: reservationExpires,
      },
    }
  );

  if (updateResult.modifiedCount !== seatIds.length) {
    res.status(400);
    throw new Error("Failed to reserve all seats");
  }

  res.json({
    message: "Seats reserved successfully",
    reservedCount: updateResult.modifiedCount,
    reservationExpires: reservationExpires,
  });
});

// Release reserved seats - POST /api/seat-status/release - Private
const releaseReservedSeats = asyncHandler(async (req, res) => {
  const { showtimeId, seatIds } = req.body;

  const updateResult = await SeatStatus.updateMany(
    {
      showtime: showtimeId,
      seat: { $in: seatIds },
      status: "reserved",
    },
    {
      $set: {
        status: "available",
        reservedAt: null,
        reservationExpires: null,
      },
    }
  );

  res.json({
    message: "Seats released successfully",
    releasedCount: updateResult.modifiedCount,
  });
});

// Book seats - POST /api/seat-status/book - Private
const bookSeats = asyncHandler(async (req, res) => {
  const { showtimeId, seatIds, bookingId } = req.body;

  const updateResult = await SeatStatus.updateMany(
    {
      showtime: showtimeId,
      seat: { $in: seatIds },
      status: { $in: ["available", "reserved"] },
    },
    {
      $set: {
        status: "booked",
        booking: bookingId,
        reservedAt: null,
        reservationExpires: null,
      },
    }
  );

  if (updateResult.modifiedCount !== seatIds.length) {
    res.status(400);
    throw new Error("Failed to book all seats");
  }

  res.json({
    message: "Seats booked successfully",
    bookedCount: updateResult.modifiedCount,
  });
});

// Clean up expired reservations - POST /api/seat-status/cleanup - Private/Admin
const cleanupExpiredReservations = asyncHandler(async (req, res) => {
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
      },
    }
  );

  res.json({
    message: "Expired reservations cleaned up",
    cleanedCount: updateResult.modifiedCount,
  });
});

// Block/unblock seats - PUT /api/seat-status/block - Private/Admin
const toggleSeatBlock = asyncHandler(async (req, res) => {
  const { showtimeId, seatIds, block = true } = req.body;

  const newStatus = block ? "blocked" : "available";

  const updateResult = await SeatStatus.updateMany(
    {
      showtime: showtimeId,
      seat: { $in: seatIds },
    },
    {
      $set: {
        status: newStatus,
        reservedAt: null,
        reservationExpires: null,
        booking: null,
      },
    }
  );

  res.json({
    message: `Seats ${block ? "blocked" : "unblocked"} successfully`,
    updatedCount: updateResult.modifiedCount,
  });
});

export {
  reserveSeats,
  releaseReservedSeats,
  bookSeats,
  cleanupExpiredReservations,
  toggleSeatBlock,
};
