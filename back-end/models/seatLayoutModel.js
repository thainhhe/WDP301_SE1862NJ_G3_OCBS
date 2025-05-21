import mongoose from "mongoose";

const seatLayoutSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch.theaters",
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
    rowLabels: [String], // e.g., ["A", "B", "C", ...]
    vipRows: [String], // e.g., ["J", "K"]
    coupleSeats: [
      {
        row: String,
        startSeat: Number,
        endSeat: Number,
      },
    ],
    aisleAfterColumns: [Number], // e.g., [4, 8] - aisles after seats 4 and 8
    disabledSeats: [
      {
        row: String,
        number: Number,
      },
    ],
    screenPosition: {
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 100,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SeatLayout = mongoose.model("SeatLayout", seatLayoutSchema);

export default SeatLayout;
