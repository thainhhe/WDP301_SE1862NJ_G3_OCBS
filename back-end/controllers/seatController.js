import asyncHandler from "express-async-handler";
import SeatLayout from "../models/seatLayoutModel.js";
import Seat from "../models/seatModel.js";
import SeatStatus from "../models/seatStatusModel.js";
import Branch from "../models/branchModel.js";
import Theater from "../models/theaterModel.js"; // ✅ Import Theater model
import Showtime from "../models/showtimeModel.js";

// Create seat layout - POST /api/seats/layouts - Private/Admin
const createSeatLayout = asyncHandler(async (req, res) => {
  const {
    name,
    branch,
    theater,
    rows,
    seatsPerRow,
    rowLabels,
    vipRows,
    coupleSeats,
    aisleAfterColumns,
    disabledSeats,
    screenPosition,
  } = req.body;

  // ✅ Verify branch exists
  const branchDoc = await Branch.findById(branch);
  if (!branchDoc) {
    res.status(404);
    throw new Error("Branch not found");
  }

  // ✅ Verify theater exists and belongs to branch
  const theaterDoc = await Theater.findById(theater);
  if (!theaterDoc) {
    res.status(404);
    throw new Error("Theater not found");
  }

  // ✅ Check if theater belongs to branch
  const theaterInBranch = branchDoc.theaters.includes(theater);
  if (!theaterInBranch) {
    res.status(400);
    throw new Error("Theater does not belong to this branch");
  }

  const seatLayout = await SeatLayout.create({
    name,
    branch,
    theater,
    rows,
    seatsPerRow,
    rowLabels: rowLabels || generateRowLabels(rows),
    vipRows: vipRows || [],
    coupleSeats: coupleSeats || [],
    aisleAfterColumns: aisleAfterColumns || [],
    disabledSeats: disabledSeats || [],
    screenPosition: screenPosition || { x: 0, y: 0, width: 100 },
  });

  if (seatLayout) {
    res.status(201).json(seatLayout);
  } else {
    res.status(400);
    throw new Error("Invalid seat layout data");
  }
});

// Get all seat layouts - GET /api/seats/layouts - Private/Admin
const getSeatLayouts = asyncHandler(async (req, res) => {
  const { branch, theater, isActive } = req.query;
  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 10;

  const filter = {};

  if (branch) filter.branch = branch;
  if (theater) filter.theater = theater;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const count = await SeatLayout.countDocuments(filter);
  const seatLayouts = await SeatLayout.find(filter)
    .populate("branch", "name location")
    .populate("theater", "name capacity") // ✅ Populate theater directly
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.json({
    seatLayouts,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// Get seat layout by ID - GET /api/seats/layouts/:id - Private
const getSeatLayoutById = asyncHandler(async (req, res) => {
  const seatLayout = await SeatLayout.findById(req.params.id)
    .populate("branch", "name location")
    .populate("theater", "name capacity seatLayout"); // ✅ Populate theater directly

  if (seatLayout) {
    res.json(seatLayout);
  } else {
    res.status(404);
    throw new Error("Seat layout not found");
  }
});

// Update seat layout - PUT /api/seats/layouts/:id - Private/Admin
const updateSeatLayout = asyncHandler(async (req, res) => {
  const seatLayout = await SeatLayout.findById(req.params.id);

  if (seatLayout) {
    // ✅ If theater is being updated, verify it exists and belongs to branch
    if (
      req.body.theater &&
      req.body.theater !== seatLayout.theater.toString()
    ) {
      const theaterDoc = await Theater.findById(req.body.theater);
      if (!theaterDoc) {
        res.status(404);
        throw new Error("Theater not found");
      }

      const branchDoc = await Branch.findById(seatLayout.branch);
      if (!branchDoc.theaters.includes(req.body.theater)) {
        res.status(400);
        throw new Error("Theater does not belong to this branch");
      }
    }

    seatLayout.name = req.body.name || seatLayout.name;
    seatLayout.theater = req.body.theater || seatLayout.theater;
    seatLayout.rows = req.body.rows || seatLayout.rows;
    seatLayout.seatsPerRow = req.body.seatsPerRow || seatLayout.seatsPerRow;
    seatLayout.rowLabels = req.body.rowLabels || seatLayout.rowLabels;
    seatLayout.vipRows = req.body.vipRows || seatLayout.vipRows;
    seatLayout.coupleSeats = req.body.coupleSeats || seatLayout.coupleSeats;
    seatLayout.aisleAfterColumns =
      req.body.aisleAfterColumns || seatLayout.aisleAfterColumns;
    seatLayout.disabledSeats =
      req.body.disabledSeats || seatLayout.disabledSeats;
    seatLayout.screenPosition =
      req.body.screenPosition || seatLayout.screenPosition;
    seatLayout.isActive =
      req.body.isActive !== undefined ? req.body.isActive : seatLayout.isActive;

    const updatedSeatLayout = await seatLayout.save();
    res.json(updatedSeatLayout);
  } else {
    res.status(404);
    throw new Error("Seat layout not found");
  }
});

// Delete seat layout - DELETE /api/seats/layouts/:id - Private/Admin
const deleteSeatLayout = asyncHandler(async (req, res) => {
  const seatLayout = await SeatLayout.findById(req.params.id);

  if (seatLayout) {
    await seatLayout.remove();
    res.json({ message: "Seat layout removed" });
  } else {
    res.status(404);
    throw new Error("Seat layout not found");
  }
});

// Generate seats from layout - POST /api/seats/generate - Private/Admin
const generateSeatsFromLayout = asyncHandler(async (req, res) => {
  const { layoutId } = req.body;

  const seatLayout = await SeatLayout.findById(layoutId).populate("theater");
  if (!seatLayout) {
    res.status(404);
    throw new Error("Seat layout not found");
  }

  // Clear existing seats for this theater
  await Seat.deleteMany({
    theater: seatLayout.theater._id,
    branch: seatLayout.branch,
  });

  const seats = [];
  const seatSpacing = 40; // pixels between seats
  const rowSpacing = 50; // pixels between rows

  for (let rowIndex = 0; rowIndex < seatLayout.rows; rowIndex++) {
    const rowLabel =
      seatLayout.rowLabels[rowIndex] || String.fromCharCode(65 + rowIndex);
    const isVipRow = seatLayout.vipRows.includes(rowLabel);

    for (
      let seatNumber = 1;
      seatNumber <= seatLayout.seatsPerRow;
      seatNumber++
    ) {
      // Check if seat is disabled
      const isDisabled = seatLayout.disabledSeats.some(
        (disabled) =>
          disabled.row === rowLabel && disabled.number === seatNumber
      );

      if (isDisabled) continue;

      // Determine seat type
      let seatType = isVipRow ? "vip" : "standard";

      // Check if it's a couple seat
      const coupleConfig = seatLayout.coupleSeats.find(
        (couple) =>
          couple.row === rowLabel &&
          seatNumber >= couple.startSeat &&
          seatNumber <= couple.endSeat
      );
      if (coupleConfig) {
        seatType = "couple";
      }

      // Calculate position
      let xPosition = seatNumber * seatSpacing;

      // Add aisle spacing
      for (const aisleAfter of seatLayout.aisleAfterColumns) {
        if (seatNumber > aisleAfter) {
          xPosition += 20; // Add aisle width
        }
      }

      const yPosition = rowIndex * rowSpacing;

      seats.push({
        theater: seatLayout.theater._id,
        branch: seatLayout.branch,
        row: rowLabel,
        number: seatNumber,
        type: seatType,
        position: {
          x: xPosition,
          y: yPosition,
        },
        isActive: true,
      });
    }
  }

  // Bulk insert seats
  const createdSeats = await Seat.insertMany(seats);

  // Update adjacent seats relationships
  await updateAdjacentSeats(seatLayout.theater._id, seatLayout.branch);

  res.status(201).json({
    message: "Seats generated successfully",
    count: createdSeats.length,
    seats: createdSeats,
  });
});

// Get seats by theater - GET /api/seats/theater/:theaterId - Private
const getSeatsByTheater = asyncHandler(async (req, res) => {
  const { theaterId } = req.params;
  const { branch } = req.query;

  if (!branch) {
    res.status(400);
    throw new Error("Branch ID is required");
  }

  // ✅ Verify theater exists
  const theater = await Theater.findById(theaterId);
  if (!theater) {
    res.status(404);
    throw new Error("Theater not found");
  }

  const seats = await Seat.find({
    theater: theaterId,
    branch: branch,
    isActive: true,
  }).sort({ row: 1, number: 1 });

  res.json(seats);
});

// Get seat availability for showtime - GET /api/seats/availability/:showtimeId - Public
const getSeatAvailability = asyncHandler(async (req, res) => {
  const { showtimeId } = req.params;

  console.log("🎬 Getting seat availability for showtime:", showtimeId); // ✅ Debug log

  const showtime = await Showtime.findById(showtimeId).populate("theater"); // ✅ Populate theater directly
  if (!showtime) {
    console.log("❌ Showtime not found:", showtimeId); // ✅ Debug log
    res.status(404);
    throw new Error("Showtime not found");
  }

  console.log("✅ Showtime found:", {
    id: showtime._id,
    theater: showtime.theater?._id,
    branch: showtime.branch,
  }); // ✅ Debug log

  // Get all seats for this theater
  const seats = await Seat.find({
    theater: showtime.theater._id,
    branch: showtime.branch,
    isActive: true,
  }).sort({ row: 1, number: 1 });

  console.log("🪑 Found seats:", seats.length); // ✅ Debug log

  // Get seat statuses for this showtime
  const seatStatuses = await SeatStatus.find({
    showtime: showtimeId,
  }).populate("seat");

  console.log("📊 Found seat statuses:", seatStatuses.length); // ✅ Debug log

  // Create seat availability map
  const seatAvailabilityMap = {};
  seatStatuses.forEach((status) => {
    if (status.seat) {
      seatAvailabilityMap[status.seat._id.toString()] = {
        status: status.status,
        price: status.price,
        reservedAt: status.reservedAt,
        reservationExpires: status.reservationExpires,
      };
    }
  });

  // Combine seat info with availability
  const seatsWithAvailability = seats.map((seat) => {
    const availability = seatAvailabilityMap[seat._id.toString()] || {
      status: "available",
      price: getPriceForSeatType(seat.type, showtime.price),
    };

    return {
      ...seat.toObject(),
      availability,
    };
  });

  console.log(
    "🎯 Returning seats with availability:",
    seatsWithAvailability.length
  ); // ✅ Debug log

  res.json(seatsWithAvailability);
});

// Initialize seat statuses for showtime - POST /api/seats/initialize-showtime - Private/Admin
const initializeSeatStatusesForShowtime = asyncHandler(async (req, res) => {
  const { showtimeId } = req.body;

  const showtime = await Showtime.findById(showtimeId).populate("theater");
  if (!showtime) {
    res.status(404);
    throw new Error("Showtime not found");
  }

  // Get all seats for this theater
  const seats = await Seat.find({
    theater: showtime.theater._id,
    branch: showtime.branch,
    isActive: true,
  });

  // Check if seat statuses already exist
  const existingStatuses = await SeatStatus.countDocuments({
    showtime: showtimeId,
  });

  if (existingStatuses > 0) {
    res.status(400);
    throw new Error("Seat statuses already initialized for this showtime");
  }

  // Create seat statuses
  const seatStatuses = seats.map((seat) => ({
    showtime: showtimeId,
    seat: seat._id,
    status: "available",
    price: getPriceForSeatType(seat.type, showtime.price),
  }));

  const createdStatuses = await SeatStatus.insertMany(seatStatuses);

  res.status(201).json({
    message: "Seat statuses initialized successfully",
    count: createdStatuses.length,
  });
});

// Helper functions remain the same
const generateRowLabels = (rows) => {
  const labels = [];
  for (let i = 0; i < rows; i++) {
    labels.push(String.fromCharCode(65 + i)); // A, B, C, ...
  }
  return labels;
};

const getPriceForSeatType = (seatType, showtimePrices) => {
  switch (seatType) {
    case "vip":
      return showtimePrices.vip || showtimePrices.standard * 1.5;
    case "couple":
      return showtimePrices.couple || showtimePrices.standard * 2;
    default:
      return showtimePrices.standard;
  }
};

const updateAdjacentSeats = async (theaterId, branchId) => {
  const seats = await Seat.find({
    theater: theaterId,
    branch: branchId,
    isActive: true,
  });

  // Group seats by row
  const seatsByRow = {};
  seats.forEach((seat) => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  // Update adjacent seats for each row
  for (const row in seatsByRow) {
    const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);

    for (let i = 0; i < rowSeats.length; i++) {
      const adjacentSeats = [];

      // Previous seat
      if (i > 0 && rowSeats[i].number === rowSeats[i - 1].number + 1) {
        adjacentSeats.push(rowSeats[i - 1]._id);
      }

      // Next seat
      if (
        i < rowSeats.length - 1 &&
        rowSeats[i + 1].number === rowSeats[i].number + 1
      ) {
        adjacentSeats.push(rowSeats[i + 1]._id);
      }

      await Seat.findByIdAndUpdate(rowSeats[i]._id, {
        adjacentSeats: adjacentSeats,
      });
    }
  }
};

export {
  createSeatLayout,
  getSeatLayouts,
  getSeatLayoutById,
  updateSeatLayout,
  deleteSeatLayout,
  generateSeatsFromLayout,
  getSeatsByTheater,
  getSeatAvailability,
  initializeSeatStatusesForShowtime,
};
