import express from "express";
import {
  reserveSeats,
  releaseReservedSeats,
  bookSeats,
  cleanupExpiredReservations,
  toggleSeatBlock,
} from "../controllers/seatStatusController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/reserve", protect, reserveSeats);
router.post("/release", protect, releaseReservedSeats);
router.post("/book", protect, bookSeats);
router.post("/cleanup", protect, admin, cleanupExpiredReservations);
router.put("/block", protect, admin, toggleSeatBlock);

export default router;
