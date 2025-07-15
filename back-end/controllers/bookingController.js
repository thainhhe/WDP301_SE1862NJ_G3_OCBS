import asyncHandler from "express-async-handler";
import Booking from "../models/bookingModel.js";
import SeatStatus from "../models/seatStatusModel.js";
import Showtime from "../models/showtimeModel.js";
import { broadcastSeatUpdate } from "../socket/socketHandlers.js";
import mongoose from "mongoose";
import Combo from "../models/comboModel.js";
import Voucher from "../models/voucherModel.js";

// Create a PENDING booking - POST /api/bookings - Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    showtimeId,
    seatIds,
    combos = [],
    voucherId,
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
      res.status(400);
      throw new Error("Some selected seats are no longer reserved. Please try again.");
    }

    // 1. Tính tổng giá vé
    const seatTotal = seatStatuses.reduce((sum, status) => sum + (status.price || 0), 0);

    // 2. Tính tổng giá combo
    let comboTotal = 0;
    let comboDetails = [];
    if (combos.length > 0) {
      const comboIds = combos.map(c => c.combo);
      const comboDocs = await Combo.find({ _id: { $in: comboIds }, isActive: true });
      for (const c of combos) {
        const comboDoc = comboDocs.find(cd => cd._id.toString() === c.combo);
        if (comboDoc) {
          const quantity = c.quantity || 1;
          const price = comboDoc.price * quantity;
          comboTotal += price;
          comboDetails.push({ combo: comboDoc._id, quantity, price: comboDoc.price });
        }
      }
    }

    // 3. Kiểm tra và áp dụng voucher
    let discountAmount = 0;
    let appliedVoucher = null;
    if (voucherId) {
      const voucher = await Voucher.findById(voucherId);
      const now = new Date();
      if (!voucher || !voucher.isActive || now < voucher.startDate || now > voucher.endDate) {
        throw new Error("Voucher is not valid or expired");
      }
      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        throw new Error("Voucher usage limit reached");
      }
      // Kiểm tra minPurchase
      const subtotal = seatTotal + comboTotal;
      if (voucher.minPurchase && subtotal < voucher.minPurchase) {
        throw new Error(`Minimum purchase for this voucher is ${voucher.minPurchase}`);
      }
      // Kiểm tra applicableMovies/applicableBranches nếu có
      if (voucher.applicableMovies && voucher.applicableMovies.length > 0) {
        if (!voucher.applicableMovies.some(mId => mId.toString() === showtime.movie._id.toString())) {
          throw new Error("Voucher is not applicable for this movie");
        }
      }
      if (voucher.applicableBranches && voucher.applicableBranches.length > 0) {
        if (!voucher.applicableBranches.some(bId => bId.toString() === showtime.branch?.toString())) {
          throw new Error("Voucher is not applicable for this branch");
        }
      }
      // Tính discount
      if (voucher.discountType === "percentage") {
        discountAmount = Math.floor((seatTotal + comboTotal) * voucher.discountValue / 100);
        if (voucher.maxDiscount > 0) {
          discountAmount = Math.min(discountAmount, voucher.maxDiscount);
        }
      } else if (voucher.discountType === "fixed") {
        discountAmount = voucher.discountValue;
        if (voucher.maxDiscount > 0) {
          discountAmount = Math.min(discountAmount, voucher.maxDiscount);
        }
      }
      appliedVoucher = voucher._id;
    }

    // 4. Tính tổng tiền cuối cùng
    const totalAmount = Math.max(seatTotal + comboTotal - discountAmount, 0);

    // 5. Tạo booking
    const booking = await Booking.create({
      user: userId,
      showtime: showtimeId,
      seats: seatStatuses.map((status) => ({
        _id: status.seat._id,
        row: status.seat.row,
        number: status.seat.number,
        type: status.seat.type,
        price: status.price,
      })),
      totalAmount,
      combos: comboDetails,
      voucher: appliedVoucher,
      discountAmount,
      paymentStatus: "pending",
      bookingStatus: "pending",
    });

    if (!booking) {
      res.status(500);
      throw new Error("Failed to create booking record");
    }

    // Link the seat statuses to this new pending booking
    await SeatStatus.updateMany(
        { _id: { $in: seatStatuses.map(s => s._id) } },
        { $set: { booking: booking._id } }
    );

    const populatedBooking = await Booking.findById(booking._id)
        .populate("showtime")
        .populate("user", "name email");

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: "Pending booking created successfully. Please proceed to payment.",
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
  const { paymentStatus, transactionId, paymentMethod } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.paymentStatus = paymentStatus;
  if (transactionId) booking.transactionId = transactionId;
  if (paymentMethod) booking.paymentMethod = paymentMethod;

  if (paymentStatus === "completed") {
    booking.bookingStatus = "confirmed";

    const seatIds = booking.seats.map(s => s._id);
    await SeatStatus.updateMany(
        { showtime: booking.showtime, seat: { $in: seatIds } },
        { $set: { status: 'booked', reservedBy: null, reservationExpires: null } }
    );

    broadcastSeatUpdate(booking.showtime.toString(), {
      type: 'seats-booked',
      seatIds: seatIds,
      bookingId: booking._id,
    });

  } else if (paymentStatus === "failed") {
    booking.bookingStatus = "cancelled";

    const seatIds = booking.seats.map(s => s._id);
    await SeatStatus.updateMany(
        { showtime: booking.showtime, seat: { $in: seatIds } },
        { $set: { status: "available", booking: null, reservedBy: null, reservedAt: null, reservationExpires: null } }
    );

    broadcastSeatUpdate(booking.showtime.toString(), {
      type: "seats-released",
      seatIds,
      reason: "payment-failed",
    });
  }

  const updatedBooking = await booking.save();
  res.json({
    success: true,
    booking: updatedBooking,
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

  const seatIds = booking.seats.map((seat) => seat._id);
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