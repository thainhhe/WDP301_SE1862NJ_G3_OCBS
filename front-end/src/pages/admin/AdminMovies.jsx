"use client";

import { useState, useEffect } from "react";
import { movieService } from "../../services/movieService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import MovieForm from "../../components/admin/MovieForm";
import MovieCard from "../../components/movies/MovieCard";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
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

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 12,
        ...filters,
      };

      // Remove empty filters
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
      // Show user-friendly error message
      alert("Failed to fetch movies. Please try again.");
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
      alert("Movie deleted successfully");
      setShowDeleteDialog(false);
      setMovieToDelete(null);
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Failed to delete movie");
    }
  };

  const handleFormSubmit = async (movieData) => {
    try {
      console.log("Submitting movie data:", movieData);

      if (editingMovie) {
        console.log("Updating movie:", editingMovie._id);
        await movieService.updateMovie(editingMovie._id, movieData);
        alert("Movie updated successfully");
      } else {
        console.log("Creating new movie");
        await movieService.createMovie(movieData);
        alert("Movie created successfully");
      }

      setShowForm(false);
      setEditingMovie(null);
      fetchMovies();
    } catch (error) {
      console.error("Error saving movie:", error);
      alert(editingMovie ? "Failed to update movie" : "Failed to create movie");
    }
  };

  const handleUpdateHotness = async () => {
    try {
      setLoading(true);
      await movieService.updateMovieHotness();
      alert("Movie hotness updated successfully");
      fetchMovies();
    } catch (error) {
      console.error("Error updating hotness:", error);
      alert("Failed to update movie hotness");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
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

  if (loading && movies.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movie Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your cinema's movie collection
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleUpdateHotness}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
            disabled={loading}
          >
            Update Hotness
          </button>
          <button
            onClick={handleCreateMovie}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Add New Movie
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="now-showing">Now Showing</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="ended">Ended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by title or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {movies.map((movie) => (
            <div key={movie._id} className="relative">
              <MovieCard movie={movie} />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => handleEditMovie(movie)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition duration-200"
                  title="Edit Movie"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteMovie(movie)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition duration-200"
                  title="Delete Movie"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No movies found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first movie.
          </p>
          <button
            onClick={handleCreateMovie}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Add New Movie
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-md ${
                  pagination.page === page
                    ? "bg-red-600 text-white border-red-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Movie Form Modal */}
      {showForm && (
        <MovieForm
          movie={editingMovie}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Movie"
          message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
          onConfirm={confirmDeleteMovie}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Loading Overlay */}
      {loading && movies.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
