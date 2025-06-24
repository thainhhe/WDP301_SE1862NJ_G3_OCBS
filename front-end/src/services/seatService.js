import api from "./api";

export const seatService = {
  // Seat Layout Management
  async getSeatLayouts(params = {}) {
    try {
      const response = await api.get("/seats/layouts", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching seat layouts:", error);
      throw new Error("Failed to fetch seat layouts");
    }
  },

  async getSeatLayoutById(id) {
    try {
      const response = await api.get(`/seats/layouts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching seat layout:", error);
      throw new Error("Failed to fetch seat layout");
    }
  },

  // REQ-3.1: Tạo bố trí ghế
  async createSeatLayout(layoutData) {
    try {
      const response = await api.post("/seats/layouts", layoutData);
      return response.data;
    } catch (error) {
      console.error("Error creating seat layout:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create seat layout"
      );
    }
  },

  // REQ-3.2: Cập nhật bố trí ghế
  async updateSeatLayout(id, layoutData) {
    try {
      const response = await api.put(`/seats/layouts/${id}`, layoutData);
      return response.data;
    } catch (error) {
      console.error("Error updating seat layout:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update seat layout"
      );
    }
  },

  // REQ-3.3: Xóa bố trí ghế
  async deleteSeatLayout(id) {
    try {
      await api.delete(`/seats/layouts/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting seat layout:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete seat layout"
      );
    }
  },

  // Generate seats from layout
  async generateSeatsFromLayout(layoutId) {
    try {
      const response = await api.post("/seats/generate", { layoutId });
      return response.data;
    } catch (error) {
      console.error("Error generating seats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to generate seats"
      );
    }
  },

  // REQ-3.4: Hiển thị trạng thái ghế
  async getSeatAvailability(showtimeId) {
    try {
      const response = await api.get(`/seats/availability/${showtimeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching seat availability:", error);
      throw new Error("Failed to fetch seat availability");
    }
  },

  // Seat Status Management
  async reserveSeats(showtimeId, seatIds, duration = 10) {
    try {
      const response = await api.post("/seat-status/reserve", {
        showtimeId,
        seatIds,
        reservationMinutes: duration,
      });
      return response.data;
    } catch (error) {
      console.error("Error reserving seats:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reserve seats"
      );
    }
  },

  async bookSeats(showtimeId, seatIds, bookingId) {
    try {
      const response = await api.post("/seat-status/book", {
        showtimeId,
        seatIds,
        bookingId,
      });
      return response.data;
    } catch (error) {
      console.error("Error booking seats:", error);
      throw new Error(error.response?.data?.message || "Failed to book seats");
    }
  },

  async releaseReservation(showtimeId, seatIds) {
    try {
      const response = await api.post("/seat-status/release", {
        showtimeId,
        seatIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error releasing reservation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to release reservation"
      );
    }
  },

  // REQ-3.5: Validation cho gap rule
  validateSeatSelection(selectedSeats, allSeats) {
    if (selectedSeats.length <= 1) {
      return { valid: true };
    }

    // Group seats by row
    const seatsByRow = {};
    selectedSeats.forEach((seat) => {
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
          const middleSeat = allSeats.find(
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

  // Utility functions
  calculateSeatPrice(seat, showtime) {
    const basePrice = showtime.price?.standard || 0;

    switch (seat.type) {
      case "vip":
        return showtime.price?.vip || basePrice * 1.5;
      case "couple":
        return showtime.price?.couple || basePrice * 2.2;
      default:
        return basePrice;
    }
  },

  formatSeatLabel(seat) {
    return `${seat.row}${seat.number}`;
  },
};

// Theater service
export const theaterService = {
  async getTheaters(params = {}) {
    try {
      const response = await api.get("/theaters", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching theaters:", error);
      throw new Error("Failed to fetch theaters");
    }
  },

  async getTheaterById(id) {
    try {
      const response = await api.get(`/theaters/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching theater:", error);
      throw new Error("Failed to fetch theater");
    }
  },

  async getTheatersByBranch(branchId) {
    try {
      const response = await api.get(`/theaters/branch/${branchId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching branch theaters:", error);
      throw new Error("Failed to fetch branch theaters");
    }
  },

  async createTheater(theaterData) {
    try {
      const response = await api.post("/theaters", theaterData);
      return response.data;
    } catch (error) {
      console.error("Error creating theater:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create theater"
      );
    }
  },

  async updateTheater(id, theaterData) {
    try {
      const response = await api.put(`/theaters/${id}`, theaterData);
      return response.data;
    } catch (error) {
      console.error("Error updating theater:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update theater"
      );
    }
  },

  async deleteTheater(id) {
    try {
      await api.delete(`/theaters/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting theater:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete theater"
      );
    }
  },
};
