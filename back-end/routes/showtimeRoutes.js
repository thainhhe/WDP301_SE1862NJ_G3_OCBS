import express from "express";
import {
  getAllShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  bulkDeleteShowtimes,
  deletePastShowtimes,
  updateShowtimeStatus,
  getShowtimeStats,
} from "../controllers/showtimeController.js";

const router = express.Router();

// Public routes
router.get("/", getAllShowtimes);
router.get("/stats", getShowtimeStats);
router.get("/:id", getShowtimeById);

// Admin routes
router.post("/", createShowtime);
router.put("/:id", updateShowtime);
router.patch("/:id/status", updateShowtimeStatus);
router.delete("/:id", deleteShowtime);
router.delete("/bulk", bulkDeleteShowtimes);
router.delete("/past", deletePastShowtimes);

export default router;
