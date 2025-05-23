import express from "express";
import {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  getRecommendedMovies,
  updateMovieHotness,
  getTrendingMovies,
} from "../controllers/movieController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getMovies);
router.get("/:id", getMovieById);

// Admin routes
router.post("/", protect, admin, createMovie);
router.put("/update-hotness", protect, admin, updateMovieHotness);
router
  .route("/:id")
  .put(protect, admin, updateMovie)
  .delete(protect, admin, deleteMovie);

export default router;
