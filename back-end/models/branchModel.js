import mongoose from "mongoose";

const theaterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  seatLayout: {
    rows: {
      type: Number,
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
    vipRows: [Number],
    coupleSeats: [
      {
        row: Number,
        startSeat: Number,
        endSeat: Number,
      },
    ],
  },
});

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
    },
    theaters: [theaterSchema],
    operatingHours: {
      open: {
        type: String,
        default: "09:00",
      },
      close: {
        type: String,
        default: "23:00",
      },
    },
    facilities: [String],
    image: {
      type: String,
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

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
