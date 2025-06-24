import asyncHandler from "express-async-handler";
import Theater from "../models/theaterModel.js";
import Branch from "../models/branchModel.js";
import Seat from "../models/seatModel.js";
import SeatLayout from "../models/seatLayoutModel.js";

// Create theater - POST /api/theaters - Private/Admin
const createTheater = asyncHandler(async (req, res) => {
  const { name, capacity, seatLayout, branchId } = req.body;

  if (!name || !capacity || !branchId) {
    res.status(400);
    throw new Error("Name, capacity, and branch ID are required");
  }

  // Verify branch exists
  const branch = await Branch.findById(branchId);
  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  const theater = await Theater.create({
    name,
    capacity,
    seatLayout: seatLayout || {
      rows: Math.ceil(capacity / 10),
      seatsPerRow: 10,
      vipRows: [],
      coupleSeats: [],
    },
  });

  // Add theater to branch
  branch.theaters.push(theater._id);
  await branch.save();

  res.status(201).json(theater);
});

// Get all theaters - GET /api/theaters - Public
const getAllTheaters = asyncHandler(async (req, res) => {
  const theaters = await Theater.find();
  res.json(theaters);
});

// Get theaters by branch - GET /api/theaters/branch/:branchId - Public
const getTheatersByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  const branch = await Branch.findById(branchId).populate("theaters");
  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  res.json(branch.theaters);
});

// Get theater by ID - GET /api/theaters/:id - Public
const getTheaterById = asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);

  if (theater) {
    // Get seat count
    const seatCount = await Seat.countDocuments({
      theater: theater._id,
      isActive: true,
    });

    // Get seat layouts
    const seatLayouts = await SeatLayout.find({
      theater: theater._id,
      isActive: true,
    });

    res.json({
      ...theater.toObject(),
      actualSeatCount: seatCount,
      seatLayouts,
    });
  } else {
    res.status(404);
    throw new Error("Theater not found");
  }
});

// Update theater - PUT /api/theaters/:id - Private/Admin
const updateTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);

  if (theater) {
    theater.name = req.body.name || theater.name;
    theater.capacity = req.body.capacity || theater.capacity;
    theater.seatLayout = req.body.seatLayout || theater.seatLayout;

    const updatedTheater = await theater.save();
    res.json(updatedTheater);
  } else {
    res.status(404);
    throw new Error("Theater not found");
  }
});

// Delete theater - DELETE /api/theaters/:id - Private/Admin
const deleteTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);

  if (theater) {
    // Check if theater has seats or showtimes
    const seatCount = await Seat.countDocuments({ theater: theater._id });
    if (seatCount > 0) {
      res.status(400);
      throw new Error("Cannot delete theater with existing seats");
    }

    // Remove from branch
    await Branch.updateMany(
        { theaters: theater._id },
        { $pull: { theaters: theater._id } }
    );

    await theater.deleteOne();
    res.json({ message: "Theater removed" });
  } else {
    res.status(404);
    throw new Error("Theater not found");
  }
});

export {
  createTheater,
  getAllTheaters,
  getTheatersByBranch,
  getTheaterById,
  updateTheater,
  deleteTheater,
};
