import asyncHandler from "express-async-handler";
import Movie from "../models/movieModel.js";

//  Create a new movie  POST /api/movies  Private/Admin
const createMovie = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    duration,
    genre,
    releaseDate,
    endDate,
    language,
    director,
    cast,
    poster,
    trailer,
    status,
  } = req.body;

  const movie = await Movie.create({
    title,
    description,
    duration,
    genre,
    releaseDate,
    endDate,
    language,
    director,
    cast,
    poster,
    trailer,
    status: status || "coming-soon",
    hotness: 0,
    rating: 0,
  });

  if (movie) {
    res.status(201).json(movie);
  } else {
    res.status(400);
    throw new Error("Invalid movie data");
  }
});

// Get all movies  GET /api/movies  Public
const getMovies = asyncHandler(async (req, res) => {
  const { status, genre, search, sortBy } = req.query;
  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 10;

  const filter = {};

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Filter by genre
  if (genre) {
    filter.genre = { $in: [genre] };
  }

  // Search by title or description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Sorting options
  let sort = {};
  if (sortBy === "hotness") {
    sort = { hotness: -1 };
  } else if (sortBy === "releaseDate") {
    sort = { releaseDate: -1 };
  } else if (sortBy === "title") {
    sort = { title: 1 };
  } else {
    // Default sort by hotness and then release date
    sort = { hotness: -1, releaseDate: -1 };
  }

  const count = await Movie.countDocuments(filter);
  const movies = await Movie.find(filter)
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit);

  res.json({
    movies,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// Get movie by ID  GET /api/movies/:id  Public
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    res.json(movie);
  } else {
    res.status(404);
    throw new Error("Movie not found");
  }
});

// Update movie  PUT /api/movies/:id   Private/Admin
const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    movie.title = req.body.title || movie.title;
    movie.description = req.body.description || movie.description;
    movie.duration = req.body.duration || movie.duration;
    movie.genre = req.body.genre || movie.genre;
    movie.releaseDate = req.body.releaseDate || movie.releaseDate;
    movie.endDate = req.body.endDate || movie.endDate;
    movie.language = req.body.language || movie.language;
    movie.director = req.body.director || movie.director;
    movie.cast = req.body.cast || movie.cast;
    movie.poster = req.body.poster || movie.poster;
    movie.trailer = req.body.trailer || movie.trailer;
    movie.status = req.body.status || movie.status;

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } else {
    res.status(404);
    throw new Error("Movie not found");
  }
});

// Delete movie   DELETE /api/movies/:id  Private/Admin
const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    await movie.deleteOne();
    res.json({ message: "Movie removed" });
  } else {
    res.status(404);
    throw new Error("Movie not found");
  }
});

export { createMovie, getMovies, getMovieById, updateMovie, deleteMovie };
