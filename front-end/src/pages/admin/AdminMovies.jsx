import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  Backdrop,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Movie as MovieIcon,
} from "@mui/icons-material";
import { movieService } from "../../services/movieService";
import MovieForm from "../../components/admin/MovieForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    status: "now-showing", // Default filter to hide ended movies
    genre: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchMovies();
  }, [filters, pagination.page]);

  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      3000
    );
  };

  const getImageUrl = (posterPath) => {
    if (!posterPath) return "https://via.placeholder.com/300x450?text=No+Image";
    if (posterPath.startsWith("http")) {
      return posterPath;
    }
    const cleanPath = posterPath.replace(/^\/+/, "");
    return `http://localhost:5000/${cleanPath}`;
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 12,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });
      const data = await movieService.getMovies(params);
      setMovies(data.movies || []);
      setPagination({
        page: data.page || 1,
        pages: data.pages || 1,
        total: data.total || 0,
      });
    } catch (error) {
      console.error("Error fetching movies:", error);
      showAlert("Failed to fetch movies. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleDeleteMovie = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMovie = async () => {
    try {
      await movieService.deleteMovie(movieToDelete._id);
      showAlert("Movie deleted successfully");
      setShowDeleteDialog(false);
      setMovieToDelete(null);
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
      showAlert("Failed to delete movie", "error");
    }
  };

  const handleFormSubmit = async (movieData) => {
    try {
      if (editingMovie) {
        await movieService.updateMovie(editingMovie._id, movieData);
        showAlert("Movie updated successfully");
      } else {
        await movieService.createMovie(movieData);
        showAlert("Movie created successfully");
      }
      setShowForm(false);
      setEditingMovie(null);
      fetchMovies();
    } catch (error) {
      console.error("Error saving movie:", error);
      showAlert(
        editingMovie ? "Failed to update movie" : "Failed to create movie",
        "error"
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setMovieToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "now-showing":
        return "success";
      case "coming-soon":
        return "warning";
      case "ended":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "now-showing":
        return "Now Showing";
      case "coming-soon":
        return "Coming Soon";
      case "ended":
        return "Ended";
      default:
        return status;
    }
  };

  if (loading && movies.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Movie Management
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item size={{xs: 12, sm: 6, md: 4}}>
          <Card
            elevation={2}
            sx={{ display: "flex", alignItems: "center", p: 2 }}
          >
            <MovieIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Box>
              <Typography color="text.secondary">Total Movies</Typography>
              <Typography variant="h5" fontWeight="bold">
                {pagination.total}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item size={{xs: 12, sm: 6, md: 4}}>
          <Card
            elevation={2}
            sx={{ display: "flex", alignItems: "center", p: 2 }}
          >
            <MovieIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Box>
              <Typography color="text.secondary">Now Showing</Typography>
              <Typography variant="h5" fontWeight="bold">
                {movies.filter((m) => m.status === "now-showing").length}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item size={{xs: 12, sm: 6, md: 4}}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateMovie}
            sx={{ height: "100%", minHeight: 80, bgcolor: "primary.main" }}
          >
            Add New Movie
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item size={{xs: 12}}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, minWidth: 250 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{xs: 12, md: 4}}>
                <TextField
                  select
                  fullWidth
                  size="medium"
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  sx={{ mb: 2, minWidth: 200 }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        width: 250,
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="now-showing">Now Showing</MenuItem>
                  <MenuItem value="coming-soon">Coming Soon</MenuItem>
                  <MenuItem value="ended">Ended</MenuItem>
                </TextField>
              </Grid>
              <Grid item size={{xs: 12, md: 4}}>
                <TextField
                  select
                  fullWidth
                  size="medium"
                  label="Genre"
                  value={filters.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  sx={{ mb: 2, minWidth: 200 }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        width: 250,
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  <MenuItem value="Action">Action</MenuItem>
                  <MenuItem value="Adventure">Adventure</MenuItem>
                  <MenuItem value="Comedy">Comedy</MenuItem>
                  <MenuItem value="Drama">Drama</MenuItem>
                  <MenuItem value="Horror">Horror</MenuItem>
                  <MenuItem value="Romance">Romance</MenuItem>
                  <MenuItem value="Sci-Fi">Sci-Fi</MenuItem>
                  <MenuItem value="Thriller">Thriller</MenuItem>
                </TextField>
              </Grid>
              <Grid item size={{xs: 12, md: 4}}>
                <TextField
                  fullWidth
                  size="medium"
                  label="Search"
                  placeholder="Search movies..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item size={{xs: 12}}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Movies ({pagination.total})
            </Typography>
            {movies.length > 0 ? (
              <>
                <Grid
                  container
                  spacing={3}
                  mb={4}
                  justifyContent={movies.length === 1 ? "center" : "flex-start"}
                >
                  {movies.map((movie) => (
                    <Grid item size={{xs: 12, sm: 6, md: 4, lg: 3}} key={movie._id}>
                      <Card
                        elevation={2}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          maxWidth: 300,
                          margin: "0 auto",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            aspectRatio: "2/3",
                            overflow: "hidden",
                          }}
                        >
                          <CardMedia
                            component="img"
                            sx={{
                              height: "100%",
                              width: "100%",
                              objectFit: "contain",
                              backgroundColor: "#f0f0f0",
                            }}
                            image={getImageUrl(movie.poster)}
                            alt={movie.title}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x450?text=No+Image";
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              display: "flex",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleEditMovie(movie)}
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                "&:hover": { bgcolor: "primary.dark" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                            <Chip
                              label={getStatusLabel(movie.status)}
                              color={getStatusColor(movie.status)}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            noWrap
                            gutterBottom
                          >
                            {movie.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              mb: 2,
                            }}
                          >
                            {movie.description}
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {movie.genres?.slice(0, 2).map((genre, index) => (
                              <Chip
                                key={index}
                                label={genre}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {movie.duration} min
                          </Typography>
                          {movie.rating && (
                            <Chip
                              label={`${movie.rating}/10`}
                              size="small"
                              color="primary"
                              sx={{ ml: "auto" }}
                            />
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {pagination.pages > 1 && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      count={pagination.pages}
                      page={pagination.page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            ) : (
              <Paper elevation={2} sx={{ p: 6, textAlign: "center" }}>
                <MovieIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  No movies found
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  Get started by adding your first movie.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateMovie}
                  sx={{ bgcolor: "primary.main" }}
                >
                  Add New Movie
                </Button>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={showForm}
        onClose={handleFormCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: "80vh" },
        }}
      >
        <DialogTitle>
          {editingMovie ? "Edit Movie" : "Add New Movie"}
        </DialogTitle>
        <DialogContent>
          {showForm && (
            <MovieForm
              movie={editingMovie}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Movie"
          message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
          onConfirm={confirmDeleteMovie}
          onCancel={handleDeleteCancel}
        />
      )}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && movies.length > 0}
      >
        <CircularProgress color="inherit" size={60} />
      </Backdrop>
    </Box>
  );
};

export default AdminMovies;
