import express from "express";
import {
  createSeatLayout,
  getSeatLayouts,
  getSeatLayoutById,
  updateSeatLayout,
  deleteSeatLayout,
  generateSeatsFromLayout,
  getSeatsByTheater,
  getSeatAvailability,
  initializeSeatStatusesForShowtime,
} from "../controllers/seatController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Seat Layout routes
router
  .route("/layouts")
  .post(protect, admin, createSeatLayout)
  .get(protect, admin, getSeatLayouts);

router
  .route("/layouts/:id")
  .get(protect, getSeatLayoutById)
  .put(protect, admin, updateSeatLayout)
  .delete(protect, admin, deleteSeatLayout);

// Seat generation
router.post("/generate", protect, admin, generateSeatsFromLayout);

// Seat queries
router.get("/theater/:theaterId", protect, getSeatsByTheater);
router.get("/availability/:showtimeId", getSeatAvailability);

// Seat status management
router.post(
  "/initialize-showtime",
  protect,
  admin,
  initializeSeatStatusesForShowtime
);

export default router;
