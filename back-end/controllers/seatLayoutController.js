import asyncHandler from "express-async-handler";
import SeatLayout from "../models/seatLayoutModel.js";
import Seat from "../models/seatModel.js";
import SeatStatus from "../models/seatStatusModel.js";
import Branch from "../models/branchModel.js";
import Theater from "../models/theaterModel.js";
import Showtime from "../models/showtimeModel.js";

const generateRowLabels = (rows) => {
  const labels = [];
  for (let i = 0; i < rows; i++) {
    labels.push(String.fromCharCode(65 + i));
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

  const seatsByRow = {};
  seats.forEach((seat) => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  for (const row in seatsByRow) {
    const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);

    for (let i = 0; i < rowSeats.length; i++) {
      const adjacentSeats = [];

      if (i > 0 && rowSeats[i].number === rowSeats[i - 1].number + 1) {
        adjacentSeats.push(rowSeats[i - 1]._id);
      }

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

const createSeatLayout = asyncHandler(async (req, res) => {
  const {
    name,
    branch: branchId,
    theater: theaterId,
    rows,
    seatsPerRow,
    rowLabels,
    vipRows,
    coupleSeats,
    aisleAfterColumns,
    disabledSeats,
    screenPosition,
  } = req.body;

  if (!name || !branchId || !theaterId || !rows || !seatsPerRow) {
    res.status(400);
    throw new Error("Missing required fields. Please provide name, branch, theater, rows, and seatsPerRow.");
  }

  const theater = await Theater.findById(theaterId);
  if (!theater) {
    res.status(404);
    throw new Error("Theater not found.");
  }

  if (theater.seatLayout) {
    res.status(400);
    throw new Error("This theater already has an assigned seat layout. Please choose another theater.");
  }

  const seatLayout = await SeatLayout.create({
    name,
    branch: branchId,
    theater: theaterId,
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
    theater.seatLayout = seatLayout._id;
    await theater.save();
    res.status(201).json(seatLayout);
  } else {
    res.status(400);
    throw new Error("Invalid seat layout data. Could not create the layout.");
  }
});

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
      .populate("branch", "name")
      .populate("theater", "name")
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

const getSeatLayoutById = asyncHandler(async (req, res) => {
  const seatLayout = await SeatLayout.findById(req.params.id)
      .populate("branch", "name")
      .populate("theater", "name");

  if (seatLayout) {
    res.json(seatLayout);
  } else {
    res.status(404);
    throw new Error("Seat layout not found.");
  }
});

const updateSeatLayout = asyncHandler(async (req, res) => {
  const seatLayout = await SeatLayout.findById(req.params.id);

  if (seatLayout) {
    seatLayout.name = req.body.name || seatLayout.name;
    seatLayout.rows = req.body.rows || seatLayout.rows;
    seatLayout.seatsPerRow = req.body.seatsPerRow || seatLayout.seatsPerRow;
    seatLayout.rowLabels = req.body.rowLabels || seatLayout.rowLabels;
    seatLayout.vipRows = req.body.vipRows || seatLayout.vipRows;
    seatLayout.coupleSeats = req.body.coupleSeats || seatLayout.coupleSeats;
    seatLayout.aisleAfterColumns = req.body.aisleAfterColumns || seatLayout.aisleAfterColumns;
    seatLayout.disabledSeats = req.body.disabledSeats || seatLayout.disabledSeats;
    seatLayout.screenPosition = req.body.screenPosition || seatLayout.screenPosition;
    seatLayout.isActive = req.body.isActive !== undefined ? req.body.isActive : seatLayout.isActive;

    if (req.body.theater && req.body.theater.toString() !== seatLayout.theater.toString()) {
      res.status(400);
      throw new Error("Changing the theater of a seat layout is not permitted. Please create a new layout instead.");
    }

    const updatedSeatLayout = await seatLayout.save();
    res.json(updatedSeatLayout);
  } else {
    res.status(404);
    throw new Error("Seat layout not found.");
  }
});

const deleteSeatLayout = asyncHandler(async (req, res) => {
  const seatLayout = await SeatLayout.findById(req.params.id);

  if (seatLayout) {
    await Theater.findByIdAndUpdate(seatLayout.theater, {
      $unset: { seatLayout: "" }
    });

    await Seat.deleteMany({ theater: seatLayout.theater });

    await seatLayout.deleteOne();
    res.json({ message: "Seat layout and associated seats removed successfully." });
  } else {
    res.status(404);
    throw new Error("Seat layout not found.");
  }
});

const generateSeatsFromLayout = asyncHandler(async (req, res) => {
  const { layoutId } = req.body;

  const seatLayout = await SeatLayout.findById(layoutId).populate("theater");
  if (!seatLayout) {
    res.status(404);
    throw new Error("Seat layout not found");
  }

  await Seat.deleteMany({
    theater: seatLayout.theater._id,
    branch: seatLayout.branch,
  });

  const seats = [];
  const seatSpacing = 40;
  const rowSpacing = 50;

  for (let rowIndex = 0; rowIndex < seatLayout.rows; rowIndex++) {
    const rowLabel = seatLayout.rowLabels[rowIndex] || String.fromCharCode(65 + rowIndex);
    const isVipRow = seatLayout.vipRows.includes(rowLabel);

    for (let seatNumber = 1; seatNumber <= seatLayout.seatsPerRow; seatNumber++) {
      const isDisabled = seatLayout.disabledSeats.some(
          (disabled) => disabled.row === rowLabel && disabled.number === seatNumber
      );

      if (isDisabled) continue;

      let seatType = isVipRow ? "vip" : "standard";

      const coupleConfig = seatLayout.coupleSeats.find(
          (couple) => couple.row === rowLabel && seatNumber >= couple.startSeat && seatNumber <= couple.endSeat
      );
      if (coupleConfig) {
        seatType = "couple";
      }

      let xPosition = seatNumber * seatSpacing;

      for (const aisleAfter of seatLayout.aisleAfterColumns) {
        if (seatNumber > aisleAfter) {
          xPosition += 20;
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

  const createdSeats = await Seat.insertMany(seats);
  await updateAdjacentSeats(seatLayout.theater._id, seatLayout.branch);

  res.status(201).json({
    message: "Seats generated successfully",
    count: createdSeats.length,
    seats: createdSeats,
  });
});

const getSeatsByTheater = asyncHandler(async (req, res) => {
  const { theaterId } = req.params;
  const { branch } = req.query;

  if (!branch) {
    res.status(400);
    throw new Error("Branch ID is required");
  }

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

const getSeatAvailability = asyncHandler(async (req, res) => {
  const { showtimeId } = req.params;

  const showtime = await Showtime.findById(showtimeId).populate("theater");
  if (!showtime) {
    res.status(404);
    throw new Error("Showtime not found");
  }

  const seats = await Seat.find({
    theater: showtime.theater._id,
    branch: showtime.branch,
    isActive: true,
  }).sort({ row: 1, number: 1 });

  const seatStatuses = await SeatStatus.find({
    showtime: showtimeId,
  }).populate("seat");

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

  res.json(seatsWithAvailability);
});

const initializeSeatStatusesForShowtime = asyncHandler(async (req, res) => {
  const { showtimeId } = req.body;

  const showtime = await Showtime.findById(showtimeId).populate("theater");
  if (!showtime) {
    res.status(404);
    throw new Error("Showtime not found");
  }

  const seats = await Seat.find({
    theater: showtime.theater._id,
    branch: showtime.branch,
    isActive: true,
  });

  const existingStatuses = await SeatStatus.countDocuments({
    showtime: showtimeId,
  });

  if (existingStatuses > 0) {
    res.status(400);
    throw new Error("Seat statuses already initialized for this showtime");
  }

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
