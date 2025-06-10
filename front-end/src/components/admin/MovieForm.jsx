"use client";

import { useState, useEffect } from "react";

const MovieForm = ({ movie, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    genre: [],
    releaseDate: "",
    endDate: "",
    language: "",
    director: "",
    cast: [],
    poster: "",
    trailer: "",
    status: "coming-soon",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [posterUploadType, setPosterUploadType] = useState("url"); // "url" or "file"
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const genreOptions = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
  ];

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || "",
        description: movie.description || "",
        duration: movie.duration || "",
        genre: movie.genre || [],
        releaseDate: movie.releaseDate
          ? new Date(movie.releaseDate).toISOString().split("T")[0]
          : "",
        endDate: movie.endDate
          ? new Date(movie.endDate).toISOString().split("T")[0]
          : "",
        language: movie.language || "",
        director: movie.director || "",
        cast: movie.cast || [],
        poster: movie.poster || "",
        trailer: movie.trailer || "",
        status: movie.status || "coming-soon",
      });

      // Set preview for existing poster
      if (movie.poster) {
        const imageUrl = movie.poster.startsWith("http")
          ? movie.poster
          : `http://localhost:5000/${movie.poster}`;
        setPosterPreview(imageUrl);
      }
    }
  }, [movie]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleGenreChange = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  };

  const handleCastChange = (index, value) => {
    const newCast = [...formData.cast];
    newCast[index] = value;
    setFormData((prev) => ({
      ...prev,
      cast: newCast,
    }));
  };

  const addCastMember = () => {
    setFormData((prev) => ({
      ...prev,
      cast: [...prev.cast, ""],
    }));
  };

  const removeCastMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index),
    }));
  };

  const handlePosterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setPosterFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPosterFile = async () => {
    if (!posterFile) return null;

    setUploadingPoster(true);
    try {
      console.log("Starting upload for file:", posterFile.name);

      const uploadFormData = new FormData();
      uploadFormData.append("poster", posterFile);

      console.log("Uploading to:", "http://localhost:5000/api/upload/poster");

      const response = await fetch("http://localhost:5000/api/upload/poster", {
        method: "POST",
        body: uploadFormData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed with response:", errorText);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      return data.url || data.filePath;
    } catch (error) {
      console.error("Error uploading poster:", error);
      alert(`Failed to upload poster image: ${error.message}`);
      throw error;
    } finally {
      setUploadingPoster(false);
    }
  };

  const handlePosterUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      poster: url,
    }));
    setPosterPreview(url);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }

    if (formData.genre.length === 0) {
      newErrors.genre = "At least one genre is required";
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = "Release date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.releaseDate &&
      formData.endDate &&
      new Date(formData.releaseDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after release date";
    }

    if (!formData.language.trim()) {
      newErrors.language = "Language is required";
    }

    if (!formData.director.trim()) {
      newErrors.director = "Director is required";
    }

    if (formData.cast.filter((c) => c.trim()).length === 0) {
      newErrors.cast = "At least one cast member is required";
    }

    // Validate poster
    if (posterUploadType === "url" && !formData.poster.trim()) {
      newErrors.poster = "Poster URL is required";
    } else if (posterUploadType === "file" && !posterFile && !movie?.poster) {
      newErrors.poster = "Please select a poster image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let posterUrl = formData.poster;

      // Upload poster file if selected
      if (posterUploadType === "file" && posterFile) {
        console.log("Uploading poster file...");
        posterUrl = await uploadPosterFile();
        console.log("Poster uploaded, URL:", posterUrl);
      }

      // Filter out empty cast members
      const cleanedData = {
        ...formData,
        cast: formData.cast.filter((c) => c.trim()),
        duration: Number.parseInt(formData.duration),
        poster: posterUrl,
      };

      console.log("Submitting movie data:", cleanedData);
      await onSubmit(cleanedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {movie ? "Edit Movie" : "Add New Movie"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter movie title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="120"
                  min="1"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.language ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="English"
                />
                {errors.language && (
                  <p className="text-red-500 text-sm mt-1">{errors.language}</p>
                )}
              </div>

              {/* Director */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director *
                </label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.director ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Director name"
                />
                {errors.director && (
                  <p className="text-red-500 text-sm mt-1">{errors.director}</p>
                )}
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date *
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.releaseDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.releaseDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.releaseDate}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter movie description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genres * (Select multiple)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {genreOptions.map((genre) => (
                  <label
                    key={genre}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.genre.includes(genre)}
                      onChange={() => handleGenreChange(genre)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm">{genre}</span>
                  </label>
                ))}
              </div>
              {errors.genre && (
                <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
              )}
            </div>

            {/* Cast */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cast *
              </label>
              <div className="space-y-2">
                {formData.cast.map((castMember, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={castMember}
                      onChange={(e) => handleCastChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Actor name"
                    />
                    <button
                      type="button"
                      onClick={() => removeCastMember(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg
                        className="w-5 h-5"
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
                ))}
                <button
                  type="button"
                  onClick={addCastMember}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  + Add Cast Member
                </button>
              </div>
              {errors.cast && (
                <p className="text-red-500 text-sm mt-1">{errors.cast}</p>
              )}
            </div>

            {/* Poster */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movie Poster *
              </label>

              {/* Poster Upload Type Selector */}
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={posterUploadType === "url"}
                    onChange={(e) => setPosterUploadType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enter URL</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={posterUploadType === "file"}
                    onChange={(e) => setPosterUploadType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Upload File</span>
                </label>
              </div>

              {/* Poster URL Input */}
              {posterUploadType === "url" && (
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handlePosterUrlChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.poster ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="https://example.com/poster.jpg"
                />
              )}

              {/* Poster File Upload */}
              {posterUploadType === "file" && (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterFileChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.poster ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              )}

              {/* Poster Preview */}
              {posterPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </p>
                  <div className="w-32 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <img
                      src={posterPreview || "/placeholder.svg"}
                      alt="Poster preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x400/cccccc/666666?text=No+Image";
                      }}
                    />
                  </div>
                </div>
              )}

              {errors.poster && (
                <p className="text-red-500 text-sm mt-1">{errors.poster}</p>
              )}
            </div>

            {/* Trailer URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trailer URL
              </label>
              <input
                type="url"
                name="trailer"
                value={formData.trailer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="coming-soon">Coming Soon</option>
                <option value="now-showing">Now Showing</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
                disabled={loading || uploadingPoster}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 disabled:opacity-50"
                disabled={loading || uploadingPoster}
              >
                {loading || uploadingPoster
                  ? uploadingPoster
                    ? "Uploading..."
                    : "Saving..."
                  : movie
                  ? "Update Movie"
                  : "Create Movie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MovieForm;
