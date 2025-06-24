import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    seatLayout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SeatLayout",
        required: true,
    },
}, {
    timestamps: true,
});

const Theater = mongoose.model("Theater", theaterSchema);

export default Theater;
