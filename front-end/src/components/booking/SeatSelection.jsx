"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Crown,
  Heart,
  X,
  AlertCircle,
  Clock,
  DollarSign,
  Monitor,
} from "lucide-react";
import { seatService } from "../../services/seatService";

const SeatSelection = ({
  showtimeId,
  onSeatSelectionChange,
  maxSeats = 8,
  autoReserve = true,
  reservationDuration = 10,
}) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationTimer, setReservationTimer] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);

  // Fetch seat availability
  useEffect(() => {
    if (showtimeId) {
      fetchSeatAvailability();
    }
  }, [showtimeId]);

  // Auto-reserve selected seats
  useEffect(() => {
    if (autoReserve && selectedSeats.length > 0) {
      handleReservation();
    }
  }, [selectedSeats, autoReserve]);

  // Cleanup reservation on unmount
  useEffect(() => {
    return () => {
      if (selectedSeats.length > 0 && autoReserve) {
        seatService
          .releaseReservation(
            showtimeId,
            selectedSeats.map((seat) => seat._id)
          )
          .catch(console.error);
      }
    };
  }, []);

  const fetchSeatAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await seatService.getSeatAvailability(showtimeId);
      setSeats(data.seats || []);
      setSeatLayout(data.layout);
    } catch (error) {
      console.error("Error fetching seat availability:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const seatIds = selectedSeats.map((seat) => seat._id);
      await seatService.reserveSeats(showtimeId, seatIds, reservationDuration);

      // Start countdown timer
      setReservationTimer(reservationDuration * 60); // Convert to seconds

      const interval = setInterval(() => {
        setReservationTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Auto-release reservation
            handleReleaseReservation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error reserving seats:", error);
      setError(error.message);
    }
  };

  const handleReleaseReservation = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const seatIds = selectedSeats.map((seat) => seat._id);
      await seatService.releaseReservation(showtimeId, seatIds);
      setSelectedSeats([]);
      setReservationTimer(null);
      await fetchSeatAvailability(); // Refresh seat status
    } catch (error) {
      console.error("Error releasing reservation:", error);
    }
  };

  const handleSeatClick = useCallback(
    (seat) => {
      if (seat.status !== "available") return;

      const isSelected = selectedSeats.some((s) => s._id === seat._id);
      let newSelection;

      if (isSelected) {
        // Deselect seat
        newSelection = selectedSeats.filter((s) => s._id !== seat._id);
      } else {
        // Select seat (check max limit)
        if (selectedSeats.length >= maxSeats) {
          setError(`Maximum ${maxSeats} seats can be selected`);
          return;
        }
        newSelection = [...selectedSeats, seat];
      }

      // Validate selection (gap rule)
      const validation = seatService.validateSeatSelection(newSelection, seats);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      setError(null);
      setSelectedSeats(newSelection);

      // Notify parent component
      if (onSeatSelectionChange) {
        onSeatSelectionChange(newSelection);
      }
    },
    [selectedSeats, seats, maxSeats, onSeatSelectionChange]
  );

  const getSeatIcon = (seat) => {
    switch (seat.type) {
      case "vip":
        return <Crown className="w-4 h-4" />;
      case "couple":
        return <Heart className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.some((s) => s._id === seat._id);

    if (isSelected) {
      return "bg-blue-600 text-white border-blue-600";
    }

    switch (seat.status) {
      case "available":
        switch (seat.type) {
          case "vip":
            return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200";
          case "couple":
            return "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200";
          default:
            return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
        }
      case "reserved":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "booked":
        return "bg-red-100 text-red-800 border-red-300";
      case "blocked":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + (seat.price || 0);
    }, 0);
  };

  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });

    // Sort seats within each row
    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => a.number - b.number);
    });

    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat map...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && seats.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load seats
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSeatAvailability} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedSeats = groupSeatsByRow();
  const rowLabels = Object.keys(groupedSeats).sort();

  if (rowLabels.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có ghế khả dụng cho suất chiếu này
          </h3>
          <Button onClick={fetchSeatAvailability} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reservation Timer */}
      {reservationTimer && reservationTimer > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Seats reserved for {formatTime(reservationTimer)}. Complete your
            booking before time expires.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seat Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-green-800" />
              </div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 border border-blue-600 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                <X className="w-3 h-3 text-red-800" />
              </div>
              <span>Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center">
                <Crown className="w-3 h-3 text-yellow-800" />
              </div>
              <span>VIP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-pink-100 border border-pink-300 rounded flex items-center justify-center">
                <Heart className="w-3 h-3 text-pink-800" />
              </div>
              <span>Couple</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 mr-2" />
            SCREEN
          </CardTitle>
          <div className="w-full h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {rowLabels.map((row) => (
              <div
                key={row}
                className="flex items-center justify-center space-x-2"
              >
                {/* Row Label */}
                <div className="w-8 text-center font-medium text-gray-700">
                  {row}
                </div>

                {/* Seats */}
                <div className="flex space-x-1">
                  {groupedSeats[row].map((seat, index) => {
                    const isSelected = selectedSeats.some(
                      (s) => s._id === seat._id
                    );
                    const isClickable = seat.status === "available";

                    return (
                      <button
                        key={seat._id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!isClickable}
                        className={`
                                                    w-8 h-8 rounded border-2 flex items-center justify-center
                                                    transition-all duration-200 text-xs font-medium
                                                    ${getSeatColor(seat)}
                                                    ${
                                                      isClickable
                                                        ? "cursor-pointer transform hover:scale-110"
                                                        : "cursor-not-allowed"
                                                    }
                                                    ${
                                                      isSelected
                                                        ? "ring-2 ring-blue-400 ring-offset-1"
                                                        : ""
                                                    }
                                                `}
                        title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status}`}
                      >
                        {seat.status === "available" || isSelected ? (
                          getSeatIcon(seat)
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row Label (Right) */}
                <div className="w-8 text-center font-medium text-gray-700">
                  {row}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Selected Seats ({selectedSeats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <Badge
                    key={seat._id}
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    {getSeatIcon(seat)}
                    <span>{seatService.formatSeatLabel(seat)}</span>
                    <button
                      onClick={() => handleSeatClick(seat)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-medium">Total Price:</span>
                <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(calculateTotalPrice())}
                </span>
              </div>

              {autoReserve && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleReleaseReservation}
                    variant="outline"
                    size="sm"
                  >
                    Release Reservation
                  </Button>
                  <Button
                    onClick={fetchSeatAvailability}
                    variant="outline"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeatSelection;
