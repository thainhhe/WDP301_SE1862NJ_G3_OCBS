import React, { useState, useEffect } from 'react';

const ShowtimeForm = ({ showtime, movies, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        movieId: '',
        theater: '',
        date: '',
        time: '',
        price: '',
        totalSeats: '',
        status: 'scheduled',
        is3D: false,
        isSpecialShowing: false,
        subtitles: false,
        notes: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Theater options
    const theaterOptions = [
        { value: 'Theater 1', label: 'Theater 1', seats: 150 },
        { value: 'Theater 2', label: 'Theater 2', seats: 120 },
        { value: 'Theater 3', label: 'Theater 3', seats: 100 },
        { value: 'Theater 4', label: 'Theater 4', seats: 80 },
        { value: 'IMAX', label: 'IMAX Theater', seats: 200 },
        { value: 'VIP', label: 'VIP Theater', seats: 50 },
    ];

    // Time slots
    const timeSlots = [
        '09:00', '10:30', '12:00', '13:30', '15:00', '16:30',
        '18:00', '19:30', '21:00', '22:30'
    ];

    useEffect(() => {
        if (showtime) {
            // Edit mode - populate form with existing data
            setFormData({
                movieId: showtime.movieId || '',
                theater: showtime.theater || '',
                date: showtime.date ? new Date(showtime.date).toISOString().split('T')[0] : '',
                time: showtime.time || '',
                price: showtime.price || '',
                totalSeats: showtime.totalSeats || '',
                status: showtime.status || 'scheduled',
                is3D: showtime.is3D || false,
                isSpecialShowing: showtime.isSpecialShowing || false,
                subtitles: showtime.subtitles || false,
                notes: showtime.notes || '',
            });
        } else {
            // Create mode - set default values
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            setFormData(prev => ({
                ...prev,
                date: tomorrow.toISOString().split('T')[0],
                time: '18:00',
                status: 'scheduled',
            }));
        }
    }, [showtime]);

    // Auto-fill seats when theater is selected
    useEffect(() => {
        if (formData.theater && !showtime) {
            const selectedTheater = theaterOptions.find(t => t.value === formData.theater);
            if (selectedTheater) {
                setFormData(prev => ({
                    ...prev,
                    totalSeats: selectedTheater.seats
                }));
            }
        }
    }, [formData.theater, showtime]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.movieId) newErrors.movieId = 'Movie is required';
        if (!formData.theater) newErrors.theater = 'Theater is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.totalSeats) newErrors.totalSeats = 'Total seats is required';

        // Validation rules
        if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
            newErrors.price = 'Price must be a positive number';
        }

        if (formData.totalSeats && (isNaN(formData.totalSeats) || parseInt(formData.totalSeats) <= 0)) {
            newErrors.totalSeats = 'Total seats must be a positive number';
        }

        // Date validation
        if (formData.date) {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.date = 'Date cannot be in the past';
            }
        }

        // Time validation for today's date
        if (formData.date && formData.time) {
            const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
            const now = new Date();

            if (selectedDateTime <= now) {
                newErrors.time = 'Time must be in the future';
            }
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
            // Prepare data for submission
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                totalSeats: parseInt(formData.totalSeats),
                movieTitle: movies.find(m => m._id === formData.movieId)?.title || '',
            };

            await onSubmit(submitData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedMovie = () => {
        return movies.find(m => m._id === formData.movieId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {showtime ? 'Edit Showtime' : 'Add New Showtime'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Movie Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Movie *
                        </label>
                        <select
                            name="movieId"
                            value={formData.movieId}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                errors.movieId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select a movie</option>
                            {movies.map((movie) => (
                                <option key={movie._id} value={movie._id}>
                                    {movie.title} ({movie.duration ? `${movie.duration}min` : 'N/A'})
                                </option>
                            ))}
                        </select>
                        {errors.movieId && <p className="mt-1 text-sm text-red-600">{errors.movieId}</p>}

                        {/* Movie preview */}
                        {getSelectedMovie() && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-3">
                                    {getSelectedMovie().poster && (
                                        <img
                                            src={getSelectedMovie().poster}
                                            alt={getSelectedMovie().title}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{getSelectedMovie().title}</p>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            {getSelectedMovie().genre && <span>{getSelectedMovie().genre}</span>}
                                            {getSelectedMovie().rating && <span>• {getSelectedMovie().rating}</span>}
                                            {getSelectedMovie().duration && <span>• {getSelectedMovie().duration} min</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theater and Date Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Theater *
                            </label>
                            <select
                                name="theater"
                                value={formData.theater}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.theater ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select theater</option>
                                {theaterOptions.map((theater) => (
                                    <option key={theater.value} value={theater.value}>
                                        {theater.label} ({theater.seats} seats)
                                    </option>
                                ))}
                            </select>
                            {errors.theater && <p className="mt-1 text-sm text-red-600">{errors.theater}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.date ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        </div>
                    </div>

                    {/* Time and Price Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time *
                            </label>
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.time ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select time</option>
                                {timeSlots.map((time) => (
                                    <option key={time} value={time}>
                                        {new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </option>
                                ))}
                            </select>
                            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ticket Price ($) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="12.50"
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Total Seats and Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Seats *
                            </label>
                            <input
                                type="number"
                                name="totalSeats"
                                value={formData.totalSeats}
                                onChange={handleInputChange}
                                placeholder="150"
                                min="1"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.totalSeats ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.totalSeats && <p className="mt-1 text-sm text-red-600">{errors.totalSeats}</p>}
                        </div>

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
                                <option value="scheduled">Scheduled</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Special Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Special Features
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is3D"
                                    checked={formData.is3D}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">3D Showing</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isSpecialShowing"
                                    checked={formData.isSpecialShowing}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Special Showing</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="subtitles"
                                    checked={formData.subtitles}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Subtitles</span>
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Add any special notes or announcements..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {showtime ? 'Updating...' : 'Creating...'}
                                </div>
                            ) : (
                                showtime ? 'Update Showtime' : 'Create Showtime'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShowtimeForm;