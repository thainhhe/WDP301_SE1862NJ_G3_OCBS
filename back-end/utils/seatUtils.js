import Seat from "../models/seatModel.js";
import SeatStatus from "../models/seatStatusModel.js";

// Generate row labels (A, B, C, ...)
export const generateRowLabels = (rows) => {
  const labels = [];
  for (let i = 0; i < rows; i++) {
    if (i < 26) {
      labels.push(String.fromCharCode(65 + i)); // A-Z
    } else {
      // For more than 26 rows: AA, AB, AC, ...
      const firstChar = String.fromCharCode(65 + Math.floor((i - 26) / 26));
      const secondChar = String.fromCharCode(65 + ((i - 26) % 26));
      labels.push(firstChar + secondChar);
    }
  }
  return labels;
};

// Calculate seat price based on type
export const calculateSeatPrice = (seatType, basePrices) => {
  const multipliers = {
    standard: 1,
    vip: 1.5,
    couple: 2,
  };

  const multiplier = multipliers[seatType] || 1;

  switch (seatType) {
    case "vip":
      return basePrices.vip || basePrices.standard * multiplier;
    case "couple":
      return basePrices.couple || basePrices.standard * multiplier;
    default:
      return basePrices.standard;
  }
};

// Check if seats are adjacent
export const areSeatsAdjacent = (seat1, seat2) => {
  if (seat1.row !== seat2.row) return false;
  return Math.abs(seat1.number - seat2.number) === 1;
};

// Validate seat selection rules
export const validateSeatSelection = async (seatIds, showtimeId) => {
  const seats = await Seat.find({ _id: { $in: seatIds } }).sort({
    row: 1,
    number: 1,
  });

  if (seats.length !== seatIds.length) {
    throw new Error("Some seats not found");
  }

  // Check if seats are available
  const seatStatuses = await SeatStatus.find({
    showtime: showtimeId,
    seat: { $in: seatIds },
  });

  const unavailableSeats = seatStatuses.filter(
    (status) => status.status !== "available"
  );
  if (unavailableSeats.length > 0) {
    throw new Error("Some seats are not available");
  }

  // Group seats by row
  const seatsByRow = {};
  seats.forEach((seat) => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  // Check for gaps (không để ghế trống giữa các ghế đã chọn)
  for (const row in seatsByRow) {
    const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);

    for (let i = 1; i < rowSeats.length; i++) {
      const gap = rowSeats[i].number - rowSeats[i - 1].number;
      if (gap === 2) {
        // Có đúng 1 ghế trống giữa 2 ghế đã chọn
        throw new Error(
          `Cannot leave single seat gap between seats ${rowSeats[i - 1].row}${
            rowSeats[i - 1].number
          } and ${rowSeats[i].row}${rowSeats[i].number}`
        );
      }
    }
  }

  return true;
};

// Get seat map for theater
export const getSeatMap = async (theaterId, branchId) => {
  const seats = await Seat.find({
    theater: theaterId,
    branch: branchId,
    isActive: true,
  }).sort({ row: 1, number: 1 });

  // Group by row
  const seatMap = {};
  seats.forEach((seat) => {
    if (!seatMap[seat.row]) {
      seatMap[seat.row] = [];
    }
    seatMap[seat.row].push(seat);
  });

  return seatMap;
};

// Calculate optimal seat layout
export const calculateSeatLayout = (capacity, preferredSeatsPerRow = 10) => {
  const rows = Math.ceil(capacity / preferredSeatsPerRow);
  const seatsPerRow = Math.ceil(capacity / rows);

  return {
    rows,
    seatsPerRow,
    totalCapacity: rows * seatsPerRow,
    efficiency: capacity / (rows * seatsPerRow),
  };
};
