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
  Monitor,
  DollarSign,
} from "lucide-react";
import { seatService } from "../../services/seatService";

const CustomerSeatSelection = ({
  showtimeId,
  onSeatSelectionChange,
  maxSeats = 8,
  onPriceChange,
}) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showtimeId) {
      fetchSeatAvailability();
    }
  }, [showtimeId]);

  useEffect(() => {
    // Notify parent of selection changes
    if (onSeatSelectionChange) {
      onSeatSelectionChange(selectedSeats);
    }

    // Calculate and notify price changes
    if (onPriceChange) {
      const totalPrice = calculateTotalPrice();
      onPriceChange(totalPrice);
    }
  }, [selectedSeats, onSeatSelectionChange, onPriceChange]);

  const fetchSeatAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await seatService.getSeatAvailability(showtimeId);
      setSeats(data || []);
    } catch (error) {
      console.error("Error fetching seat availability:", error);
      setError("Unable to load seat information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // REQ-3.5: Ngăn đặt các ghế cách nhau đúng một ghế
  const validateGapRule = useCallback(
    (newSelection) => {
      if (newSelection.length <= 1) return { valid: true };

      // Group seats by row
      const seatsByRow = {};
      newSelection.forEach((seat) => {
        if (!seatsByRow[seat.row]) {
          seatsByRow[seat.row] = [];
        }
        seatsByRow[seat.row].push(seat);
      });

      // Check gap rule for each row
      for (const row in seatsByRow) {
        const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);

        for (let i = 0; i < rowSeats.length - 1; i++) {
          const current = rowSeats[i];
          const next = rowSeats[i + 1];
          const gap = next.number - current.number;

          if (gap === 2) {
            // Check if the seat in between is available
            const middleSeatNumber = current.number + 1;
            const middleSeat = seats.find(
              (seat) =>
                seat.row === current.row && seat.number === middleSeatNumber
            );

            if (middleSeat && middleSeat.availability?.status === "available") {
              return {
                valid: false,
                message: `Cannot leave single empty seat between ${current.row}${current.number} and ${next.row}${next.number}. Please select the seat in between or choose different seats.`,
              };
            }
          }
        }
      }

      return { valid: true };
    },
    [seats]
  );

  const handleSeatClick = useCallback(
    (seat) => {
      // REQ-3.4: Chỉ cho phép chọn ghế trống
      if (seat.availability?.status !== "available") {
        return;
      }

      const isSelected = selectedSeats.some((s) => s._id === seat._id);
      let newSelection;

      if (isSelected) {
        // Deselect seat
        newSelection = selectedSeats.filter((s) => s._id !== seat._id);
      } else {
        // Select seat (check max limit)
        if (selectedSeats.length >= maxSeats) {
          setError(`Maximum ${maxSeats} seats can be selected`);
          setTimeout(() => setError(null), 3000);
          return;
        }
        newSelection = [...selectedSeats, seat];
      }

      // REQ-3.5: Validate gap rule
      const validation = validateGapRule(newSelection);
      if (!validation.valid) {
        setError(validation.message);
        setTimeout(() => setError(null), 5000);
        return;
      }

      setError(null);
      setSelectedSeats(newSelection);
    },
    [selectedSeats, seats, maxSeats, validateGapRule]
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

  // REQ-3.4: Hiển thị trạng thái ghế
  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.some((s) => s._id === seat._id);

    if (isSelected) {
      return "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400 ring-offset-1";
    }

    switch (seat.availability?.status) {
      case "available":
        switch (seat.type) {
          case "vip":
            return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 cursor-pointer";
          case "couple":
            return "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200 cursor-pointer";
          default:
            return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer";
        }
      case "reserved":
        return "bg-orange-100 text-orange-800 border-orange-300 cursor-not-allowed";
      case "booked":
        return "bg-red-100 text-red-800 border-red-300 cursor-not-allowed";
      case "blocked":
        return "bg-gray-100 text-gray-800 border-gray-300 cursor-not-allowed";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 cursor-not-allowed";
    }
  };

  const getSeatStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "reserved":
        return "Reserved";
      case "booked":
        return "Booked";
      case "blocked":
        return "Blocked";
      default:
        return "Unavailable";
    }
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + (seat.availability?.price || 0);
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
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
              <div className="w-6 h-6 bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-orange-800" />
              </div>
              <span>Reserved</span>
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
                  {groupedSeats[row].map((seat) => {
                    const isSelected = selectedSeats.some(
                      (s) => s._id === seat._id
                    );
                    const isClickable =
                      seat.availability?.status === "available";

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
                                                        ? "transform hover:scale-110"
                                                        : ""
                                                    }
                                                `}
                        title={`${seat.row}${seat.number} - ${
                          seat.type
                        } - ${getSeatStatusText(
                          seat.availability?.status
                        )} - ${formatPrice(seat.availability?.price || 0)}`}
                      >
                        {seat.availability?.status === "available" ||
                        isSelected ? (
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
                    className="flex items-center space-x-1 px-3 py-1"
                  >
                    {getSeatIcon(seat)}
                    <span>
                      {seat.row}
                      {seat.number}
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatPrice(seat.availability?.price || 0)}
                    </span>
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
                  {formatPrice(calculateTotalPrice())}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Maximum {maxSeats} seats can be selected</p>
                <p>• Cannot leave single empty seats between selected seats</p>
                <p>• VIP and Couple seats have different pricing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Seat Selection Rules:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click on available seats to select them</li>
            <li>
              • You cannot leave single empty seats between your selections
            </li>
            <li>• VIP seats (👑) and Couple seats (💕) have premium pricing</li>
            <li>• Maximum {maxSeats} seats can be selected per booking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSeatSelection;
