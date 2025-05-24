import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import Seat from "./models/seatModel.js";
import SeatStatus from "./models/seatStatusModel.js";
import Showtime from "./models/showtimeModel.js";

dotenv.config();

const showtimeId = "608f1f77bcf86cd799440021"; // ❗Thay bằng showtime thật

const seedSeatStatus = async () => {
  try {
    await connectDB();

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      throw new Error("❌ Showtime không tồn tại.");
    }

    // Lấy danh sách ghế thuộc rạp này
    const seats = await Seat.find({ theater: showtime.theater });

    const seatStatuses = seats.map((seat) => ({
      showtime: showtime._id,
      seat: seat._id,
      status: "available",
      price: (() => {
        switch (seat.type) {
          case "vip":
            return showtime.price.vip;
          case "couple":
            return showtime.price.couple;
          default:
            return showtime.price.standard;
        }
      })(),
    }));

    await SeatStatus.deleteMany({ showtime: showtime._id }); // Xoá dữ liệu cũ nếu có
    const inserted = await SeatStatus.insertMany(seatStatuses);

    console.log(
      `✅ Đã tạo ${inserted.length} SeatStatus cho showtime ${showtimeId}`
    );
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
};

seedSeatStatus();
