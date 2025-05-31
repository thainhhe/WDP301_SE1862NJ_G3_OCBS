"use client";

import { Link } from "react-router-dom";
import { useState } from "react";

const MovieCard = ({ movie, showActions = false, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "now-showing": { color: "bg-green-500", text: "Now Showing" },
      "coming-soon": { color: "bg-blue-500", text: "Coming Soon" },
      ended: { color: "bg-gray-500", text: "Ended" },
    };

    const config = statusConfig[status] || statusConfig["coming-soon"];

    return (
      <span
        className={`${config.color} text-white text-xs font-bold px-2 py-1 rounded-full`}
      >
        {config.text}
      </span>
    );
  };

  const getHotnessColor = (hotness) => {
    if (hotness >= 8) return "text-red-600";
    if (hotness >= 6) return "text-orange-500";
    if (hotness >= 4) return "text-yellow-500";
    return "text-gray-500";
  };

  // Hàm để tạo URL ảnh đúng
  const getImageUrl = (posterPath) => {
    if (!posterPath) return "https://via.placeholder.com/400x600?text=No+Image";

    // Nếu là URL đầy đủ (http/https)
    if (posterPath.startsWith("http")) {
      return posterPath;
    }

    // Nếu là đường dẫn local, thêm base URL của backend
    const cleanPath = posterPath.replace(/^\/+/, ""); // Loại bỏ slash đầu
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Movie Poster */}
      <div className="relative group">
        {imageError ? (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">{movie.title || "No Image"}</span>
          </div>
        ) : (
          <img
            src={getImageUrl(movie.poster) || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              console.log("Image failed to load:", e.target.src);
              setImageError(true);
            }}
          />
        )}

        {/* Status Badge - Fixed position */}
        <div className="absolute top-2 left-2 z-10">
          {getStatusBadge(movie.status)}
        </div>

        {/* Hotness Badge - Fixed position */}
        {movie.hotness > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-bold">
            🔥 {movie.hotness}
          </div>
        )}

        {/* Hover Overlay - Only shows on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="text-center space-y-2">
            <Link
              to={`/movies/${movie._id}`}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200 inline-block"
            >
              View Details
            </Link>
            {movie.status === "now-showing" && (
              <Link
                to={`/showtimes?movieId=${movie._id}`}
                className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-md transition duration-200 inline-block ml-2"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Movie Info - Separate from poster */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {movie.title}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-medium">Duration:</span>
            <span>{formatDuration(movie.duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Language:</span>
            <span>{movie.language}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Director:</span>
            <span className="truncate ml-2">{movie.director}</span>
          </div>

          {movie.hotness > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Hotness:</span>
              <span className={`font-bold ${getHotnessColor(movie.hotness)}`}>
                {movie.hotness}/10
              </span>
            </div>
          )}
        </div>

        {/* Genres */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {movie.genre.slice(0, 3).map((genre, index) => (
              <span
                key={`${movie._id}-genre-${index}`}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
            {movie.genre.length > 3 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{movie.genre.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mt-3 line-clamp-3">
          {movie.description}
        </p>

        {/* Release Date */}
        <div className="mt-3 text-xs text-gray-500">
          Release: {new Date(movie.releaseDate).toLocaleDateString()}
        </div>

        {/* Action Buttons for Admin */}
        {showActions && (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onEdit(movie)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm transition duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(movie)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm transition duration-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
