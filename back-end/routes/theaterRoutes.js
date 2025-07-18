import express from "express";
import {
  createTheater,
  getTheatersByBranch,
  getTheaterById,
  updateTheater,
  deleteTheater,
} from "../controllers/theaterController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, admin, createTheater);

router.route("/branch/:branchId").get(protect, admin, getTheatersByBranch);

router
    .route("/:id")
    .get(protect, admin, getTheaterById)
    .put(protect, admin, updateTheater)
    .delete(protect, admin, deleteTheater);

export default router;