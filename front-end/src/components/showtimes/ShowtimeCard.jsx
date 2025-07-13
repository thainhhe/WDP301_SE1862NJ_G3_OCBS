const ShowtimeCard = ({ showtime }) => {
    // Format date and time
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? "PM" : "AM"
        const displayHour = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, "0")
        return `${displayHour}:${displayMinutes} ${ampm}`
    }

    // Get status based on current time and showtime
    const getStatus = () => {
        const now = new Date()
        const startTime = new Date(showtime.startTime)
        const endTime = new Date(showtime.endTime)

        if (showtime.seatsAvailable === 0) return "sold-out"
        if (now < startTime) return "scheduled"
        if (now >= startTime && now <= endTime) return "ongoing"
        if (now > endTime) return "completed"
        return "scheduled"
    }

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "scheduled":
                return "bg-blue-100 text-blue-800"
            case "ongoing":
                return "bg-green-100 text-green-800"
            case "completed":
                return "bg-gray-100 text-gray-800"
            case "sold-out":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // Check if showtime is today
    const isToday = () => {
        const today = new Date().toDateString()
        const showtimeDate = new Date(showtime.startTime).toDateString()
        return today === showtimeDate
    }

    // Check if showtime is in the past
    const isPast = () => {
        const now = new Date()
        const showtimeDateTime = new Date(showtime.endTime)
        return showtimeDateTime < now
    }

    // Calculate occupancy percentage
    const totalSeats = showtime.seatsAvailable + showtime.seatsBooked
    const occupancyPercentage = totalSeats > 0 ? Math.round((showtime.seatsBooked / totalSeats) * 100) : 0

    const status = getStatus()

    return (
        <div
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                isPast() ? "opacity-75" : ""
            }`}
        >
            {/* Header with movie info */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{showtime.movie?.title || "Unknown Movie"}</h3>
                    {isToday() && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Today
            </span>
                    )}
                </div>

                {/* Movie info if available */}
                {showtime.movie && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {showtime.movie.genre && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {Array.isArray(showtime.movie.genre) ? showtime.movie.genre.join(", ") : showtime.movie.genre}
              </span>
                        )}
                        {showtime.movie.duration && <span className="text-xs">{showtime.movie.duration} min</span>}
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
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-sm font-medium">{formatDate(showtime.startTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="text-sm font-medium">
                {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
              </span>
                        </div>
                    </div>
                </div>

                {/* Branch and Theater */}
                <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
              {showtime.branch?.name || "Unknown Branch"} - {showtime.theater?.name || "Unknown Theater"}
          </span>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                    >
            {status === "scheduled" && "Scheduled"}
                        {status === "ongoing" && "Ongoing"}
                        {status === "completed" && "Completed"}
                        {status === "sold-out" && "Sold Out"}
          </span>
                </div>

                {/* Seating Information */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Seats</span>
                        <span className="text-sm text-gray-600">
              {showtime.seatsAvailable} / {totalSeats} available
            </span>
                    </div>

                    {/* Progress bar for occupancy */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                occupancyPercentage >= 90
                                    ? "bg-red-500"
                                    : occupancyPercentage >= 70
                                        ? "bg-orange-500"
                                        : occupancyPercentage >= 50
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                            }`}
                            style={{ width: `${occupancyPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Empty</span>
                        <span>{occupancyPercentage}% Full</span>
                    </div>
                </div>

                {/* Price Information */}
                {showtime.price && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Ticket Prices</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                                <div className="font-medium text-gray-600">Standard</div>
                                <div className="text-green-600 font-semibold">${showtime.price.standard?.toFixed(2) || "0.00"}</div>
                            </div>
                            {showtime.price.vip > 0 && (
                                <div className="text-center">
                                    <div className="font-medium text-gray-600">VIP</div>
                                    <div className="text-green-600 font-semibold">${showtime.price.vip.toFixed(2)}</div>
                                </div>
                            )}
                            {showtime.price.couple > 0 && (
                                <div className="text-center">
                                    <div className="font-medium text-gray-600">Couple</div>
                                    <div className="text-green-600 font-semibold">${showtime.price.couple.toFixed(2)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Special indicators */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                        {showtime.isFirstShow && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                First Show
              </span>
                        )}
                        {showtime.isLastShow && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Last Show
              </span>
                        )}
                    </div>

                    {/* Booking status indicator */}
                    {showtime.seatsAvailable === 0 ? (
                        <span className="text-xs font-medium text-red-600">Sold Out</span>
                    ) : showtime.seatsAvailable <= 5 ? (
                        <span className="text-xs font-medium text-orange-600">Few Left</span>
                    ) : (
                        <span className="text-xs font-medium text-green-600">Available</span>
                    )}
                </div>
            </div>

            {/* Footer with branch location */}
            {showtime.branch?.location && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-600">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
              {showtime.branch.location.address}, {showtime.branch.location.city}, {showtime.branch.location.province}
            </span>
                    </div>
                    {showtime.branch.contact?.phone && (
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            <span>{showtime.branch.contact.phone}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ShowtimeCard
