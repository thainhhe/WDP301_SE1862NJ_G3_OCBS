import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // import hàm connect
import Seat from "./models/seatModel.js";

dotenv.config(); // nếu dùng biến môi trường

const layout = {
  branch: "665f1a4fcf30ab23e0b11111",
  theater: "665f1a4fcf30ab23e0b22222",
  rows: 8,
  seatsPerRow: 8,
  rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H"], // phải đúng số hàng
  vipRows: ["G", "H"],
  coupleSeats: [{ row: "F", startSeat: 5, endSeat: 6 }],
  aisleAfterColumns: [4], // ví dụ chia đôi giữa 4-5
  disabledSeats: [{ row: "A", number: 1 }],
};

const generateSeats = async () => {
  try {
    await connectDB(); // Kết nối DB tái sử dụng từ config

    await Seat.deleteMany({ theater: layout.theater });

    const seats = [];
    const disabledMap = new Set(
      layout.disabledSeats.map((ds) => `${ds.row}-${ds.number}`)
    );

    for (let i = 0; i < layout.rows; i++) {
      const row = layout.rowLabels[i];
      for (let num = 1; num <= layout.seatsPerRow; num++) {
        const seatKey = `${row}-${num}`;
        const isDisabled = disabledMap.has(seatKey);

        const type = layout.coupleSeats.some(
          (cs) => cs.row === row && num >= cs.startSeat && num <= cs.endSeat
        )
          ? "couple"
          : layout.vipRows.includes(row)
          ? "vip"
          : "standard";

        seats.push({
          branch: layout.branch,
          theater: layout.theater,
          row,
          number: num,
          type,
          isActive: !isDisabled,
          position: {
            x: num * 20,
            y: i * 30,
          },
          adjacentSeats: [],
        });
      }
    }

    const inserted = await Seat.insertMany(seats);
    console.log(`✅ Đã tạo ${inserted.length} ghế.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
};

generateSeats();
