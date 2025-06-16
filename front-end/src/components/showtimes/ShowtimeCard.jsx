import React from 'react';

const ShowtimeCard = ({ showtime }) => {
    // Format date and time
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'ongoing':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get theater color
    const getTheaterColor = (theater) => {
        switch (theater?.toLowerCase()) {
            case 'imax':
                return 'bg-purple-100 text-purple-800';
            case 'vip':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-indigo-100 text-indigo-800';
        }
    };

    // Check if showtime is today
    const isToday = () => {
        const today = new Date().toDateString();
        const showtimeDate = new Date(showtime.date).toDateString();
        return today === showtimeDate;
    };

    // Check if showtime is in the past
    const isPast = () => {
        const now = new Date();
        const showtimeDateTime = new Date(`${showtime.date}T${showtime.time}`);
        return showtimeDateTime < now;
    };

    // Calculate available seats
    const availableSeats = showtime.totalSeats - (showtime.bookedSeats || 0);
    const occupancyPercentage = showtime.totalSeats > 0
        ? Math.round(((showtime.bookedSeats || 0) / showtime.totalSeats) * 100)
        : 0;

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
            isPast() ? 'opacity-75' : ''
        }`}>
            {/* Header with movie info */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {showtime.movieTitle || showtime.movie?.title || 'Unknown Movie'}
                    </h3>
                    {isToday() && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Today
            </span>
                    )}
                </div>

                {/* Movie genre/rating if available */}
                {showtime.movie && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {showtime.movie.genre && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {showtime.movie.genre}
              </span>
                        )}
                        {showtime.movie.rating && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {showtime.movie.rating}
              </span>
                        )}
                        {showtime.movie.duration && (
                            <span className="text-xs">
                {showtime.movie.duration} min
              </span>
                        )}
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="p-4">
                {/* Date and Time */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">
                {formatDate(showtime.date)}
              </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">
                {formatTime(showtime.time)}
              </span>
                        </div>
                    </div>
                </div>

                {/* Theater and Status */}
                <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTheaterColor(showtime.theater)}`}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
              {showtime.theater}
          </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showtime.status)}`}>
            {showtime.status || 'Scheduled'}
          </span>
                </div>

                {/* Seating Information */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Seats</span>
                        <span className="text-sm text-gray-600">
              {availableSeats} / {showtime.totalSeats || 0} available
            </span>
                    </div>

                    {/* Progress bar for occupancy */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                occupancyPercentage >= 90 ? 'bg-red-500' :
                                    occupancyPercentage >= 70 ? 'bg-orange-500' :
                                        occupancyPercentage >= 50 ? 'bg-yellow-500' :
                                            'bg-green-500'
                            }`}
                            style={{ width: `${occupancyPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Empty</span>
                        <span>{occupancyPercentage}% Full</span>
                    </div>
                </div>

                {/* Price */}
                {showtime.price && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Ticket Price</span>
                        <span className="text-lg font-semibold text-gray-900">
              ${showtime.price.toFixed(2)}
            </span>
                    </div>
                )}

                {/* Special indicators */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                        {showtime.isSpecialShowing && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Special
              </span>
                        )}
                        {showtime.is3D && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                3D
              </span>
                        )}
                        {showtime.subtitles && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Subtitles
              </span>
                        )}
                    </div>

                    {/* Booking status indicator */}
                    {availableSeats === 0 ? (
                        <span className="text-xs font-medium text-red-600">Sold Out</span>
                    ) : availableSeats <= 5 ? (
                        <span className="text-xs font-medium text-orange-600">Few Left</span>
                    ) : (
                        <span className="text-xs font-medium text-green-600">Available</span>
                    )}
                </div>
            </div>

            {/* Footer with additional info */}
            {(showtime.notes || showtime.createdAt) && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    {showtime.notes && (
                        <p className="text-xs text-gray-600 mb-1">
                            <strong>Notes:</strong> {showtime.notes}
                        </p>
                    )}
                    {showtime.createdAt && (
                        <p className="text-xs text-gray-500">
                            Created: {new Date(showtime.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShowtimeCard;