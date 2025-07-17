import express from "express";
import {
  createTheater,
  getAllTheaters,
  getTheatersByBranch,
  getTheaterById,
  updateTheater,
  deleteTheater,
} from "../controllers/theaterController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllTheaters);
router.get("/branch/:branchId", getTheatersByBranch);
router.get("/:id", getTheaterById);

// Admin routes
router.post("/", protect, admin, createTheater);
router.put("/:id", protect, admin, updateTheater);
router.delete("/:id", protect, admin, deleteTheater);

export default router;
