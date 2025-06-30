import asyncHandler from "express-async-handler";
import Booking from "../models/bookingModel.js";
import SeatStatus from "../models/seatStatusModel.js";
import Showtime from "../models/showtimeModel.js";
import { broadcastSeatUpdate } from "../socket/socketHandlers.js";
import mongoose from "mongoose";

// Create booking - POST /api/bookings - Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    showtimeId,
    seatIds,
    combos = [],
    voucherId,
    paymentMethod,
  } = req.body;
  const userId = req.user._id;

  try {
    const showtime = await Showtime.findById(showtimeId).populate("movie");
    if (!showtime) {
      res.status(404);
      throw new Error("Showtime not found");
    }

    const seatStatuses = await SeatStatus.find({
      showtime: showtimeId,
      seat: { $in: seatIds },
      status: "reserved",
      reservedBy: userId,
      reservationExpires: { $gt: new Date() },
    }).populate("seat");

    if (seatStatuses.length !== seatIds.length) {
      console.error("Invalid seats:", {
        showtimeId,
        seatIds,
        foundSeats: seatStatuses.map((s) => s.seat.toString()),
      });
      res.status(400);
      throw new Error("Some seats are not reserved by you or have expired");
    }

    const seatTotal = seatStatuses.reduce(
      (sum, status) => sum + status.price,
      0
    );
    const comboTotal = combos.reduce(
      (sum, combo) => sum + combo.price * combo.quantity,
      0
    );
    const totalAmount = seatTotal + comboTotal;

    const booking = await Booking.create({
      user: userId,
      showtime: showtimeId,
      seats: seatStatuses.map((status) => ({
        row: status.seat.row,
        number: status.seat.number,
        type: status.seat.type,
        price: status.price,
      })),
      totalAmount,
      combos,
      voucher: voucherId,
      paymentMethod,
      paymentStatus: "pending",
      bookingStatus: "pending",
      transactionId: `txn_${Date.now()}_${userId}`,
    });

    if (!booking) {
      res.status(500);
      throw new Error("Failed to create booking");
    }

    const updateResult = await SeatStatus.updateMany(
      {
        showtime: showtimeId,
        seat: { $in: seatIds },
        status: "reserved",
        reservedBy: userId,
      },
      {
        $set: {
          status: "booked",
          booking: booking._id,
          reservationExpires: null,
          reservedBy: null,
        },
      }
    );

    if (updateResult.modifiedCount !== seatIds.length) {
      console.error("Failed to update seats:", {
        showtimeId,
        seatIds,
        modifiedCount: updateResult.modifiedCount,
      });
      res.status(500);
      throw new Error("Failed to update seat statuses");
    }

    broadcastSeatUpdate(showtimeId, {
      type: "seats-booked",
      seatIds,
      userId,
      bookingId: booking._id,
      timestamp: new Date(),
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("showtime")
      .populate("user", "name email");

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", {
      message: error.message,
      showtimeId,
      seatIds,
      userId,
    });
    res.status(400);
    throw error;
  }
});

// Get user bookings - GET /api/bookings/my-bookings - Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: "showtime",
      populate: {
        path: "movie",
        select: "title poster duration",
      },
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    bookings,
  });
});

// Get booking by ID - GET /api/bookings/:id - Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title poster duration" },
        { path: "theater", select: "name" },
        { path: "branch", select: "name location" },
      ],
    })
    .populate("user", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if user owns this booking or is admin
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this booking");
  }

  res.json({
    success: true,
    booking,
  });
});

// Update payment status - PUT /api/bookings/:id/payment - Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.paymentStatus = paymentStatus;
  if (transactionId) {
    booking.transactionId = transactionId;
  }

  if (paymentStatus === "completed") {
    booking.bookingStatus = "confirmed";
  } else if (paymentStatus === "failed") {
    booking.bookingStatus = "cancelled";

    // Release seats back to available
    await SeatStatus.updateMany(
      { booking: booking._id },
      {
        $set: {
          status: "available",
          booking: null,
          reservedBy: null,
          reservedAt: null,
          reservationExpires: null,
        },
      }
    );

    // Broadcast seat release
    const seatIds = booking.seats.map((seat) => seat._id);
    broadcastSeatUpdate(booking.showtime, {
      type: "seats-released",
      seatIds,
      userId: req.user._id,
      reason: "payment-failed",
      timestamp: new Date(),
    });
  }

  await booking.save();

  res.json({
    success: true,
    booking,
    message: "Payment status updated successfully",
  });
});

// Cancel booking - PUT /api/bookings/:id/cancel - Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this booking");
  }

  if (booking.bookingStatus === "cancelled") {
    res.status(400);
    throw new Error("Booking is already cancelled");
  }

  if (booking.bookingStatus === "completed") {
    res.status(400);
    throw new Error("Cannot cancel completed booking");
  }

  booking.bookingStatus = "cancelled";
  await booking.save();

  // Release seats
  await SeatStatus.updateMany(
    { booking: booking._id },
    {
      $set: {
        status: "available",
        booking: null,
        reservedBy: null,
        reservedAt: null,
        reservationExpires: null,
      },
    }
  );

  // Broadcast seat release
  const seatIds = booking.seats.map((seat) => seat._id);
  broadcastSeatUpdate(booking.showtime, {
    type: "seats-released",
    seatIds,
    userId: req.user._id,
    reason: "booking-cancelled",
    timestamp: new Date(),
  });

  res.json({
    success: true,
    message: "Booking cancelled successfully",
  });
});

export {
  createBooking,
  getMyBookings,
  getBookingById,
  updatePaymentStatus,
  cancelBooking,
};
