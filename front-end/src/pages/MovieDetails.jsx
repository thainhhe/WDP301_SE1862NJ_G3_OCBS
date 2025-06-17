"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { movieService } from "@services/movieService";
// import { showtimeService } from "@services/showtimeService";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import { toast } from "react-toastify";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const [movieData, showtimesData] = await Promise.all([
        movieService.getMovieById(id),
        showtimeService?.getShowtimesByMovie(id),
      ]);

      setMovie(movieData);
      setShowtimes(showtimesData);
    } catch (error) {
      toast.error("Failed to fetch movie details");
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };

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
        className={`${config.color} text-white text-sm font-bold px-3 py-1 rounded-full`}
      >
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Movie Not Found
        </h1>
        <Link to="/" className="text-red-600 hover:text-red-700">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <img
          src={movie.poster || "/placeholder.svg"}
          alt={movie.title}
          className="w-full h-96 object-cover opacity-30"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=400&width=800";
          }}
        />

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="mb-4">{getStatusBadge(movie.status)}</div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {movie.title}
              </h1>

              <div className="flex items-center space-x-6 text-white mb-6">
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formatDuration(movie.duration)}
                </span>

                <span>{movie.language}</span>

                {movie.hotness > 0 && (
                  <span className="flex items-center">
                    🔥 {movie.hotness}/10
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-red-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {movie.status === "now-showing" && showtimes.length > 0 && (
                <Link
                  to={`/showtimes?movieId=${movie._id}`}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 inline-block"
                >
                  Book Tickets
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Synopsis
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {movie.description}
              </p>
            </section>

            {/* Trailer */}
            {movie.trailer && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Trailer
                </h2>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={movie.trailer.replace("watch?v=", "embed/")}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            )}

            {/* Cast */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {movie.cast.map((actor, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{actor}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Movie Info
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Director
                  </span>
                  <p className="text-gray-900">{movie.director}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Duration
                  </span>
                  <p className="text-gray-900">
                    {formatDuration(movie.duration)}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Language
                  </span>
                  <p className="text-gray-900">{movie.language}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Release Date
                  </span>
                  <p className="text-gray-900">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <div className="mt-1">{getStatusBadge(movie.status)}</div>
                </div>

                {movie.hotness > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Popularity
                    </span>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(movie.hotness / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {movie.hotness}/10
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Showtimes */}
              {movie.status === "now-showing" && showtimes.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Available Showtimes
                  </h4>
                  <div className="space-y-2">
                    {showtimes.slice(0, 3).map((showtime, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {new Date(showtime.startTime).toLocaleString()}
                      </div>
                    ))}
                    {showtimes.length > 3 && (
                      <Link
                        to={`/showtimes?movieId=${movie._id}`}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        View all showtimes →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
