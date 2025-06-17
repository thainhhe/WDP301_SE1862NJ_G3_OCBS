import api from "./api"

export const showtimeService = {
    // Get showtimes with filters matching your database structure

    async getShowtimes(params = {}) {
        try {
            const response = await api.get("/showtimes", { params })
            return response.data
        } catch (error) {
            console.error("Error fetching showtimes:", error)
            throw new Error("Failed to fetch showtimes")
        }
    },

    // Get showtime by ID
    async getShowtimeById(id) {
        try {
            const response = await api.get(`/showtimes/${id}`)
            return response.data
        } catch (error) {
            console.error("Error fetching showtime:", error)
            throw new Error("Failed to fetch showtime details")
        }
    },

    // Create new showtime with your database structure
    async createShowtime(showtimeData) {
        try {
            // Transform data to match your database structure
            const transformedData = {
                movie: showtimeData.movieId,
                branch: showtimeData.branchId,
                theater: showtimeData.theaterId,
                startTime: new Date(`${showtimeData.date}T${showtimeData.time}`).toISOString(),
                endTime:
                    showtimeData.endTime || this.calculateEndTime(showtimeData.date, showtimeData.time, showtimeData.duration),
                price: {
                    standard: Number(showtimeData.price?.standard || showtimeData.price),
                    vip: Number(showtimeData.price?.vip || showtimeData.price * 1.5),
                    couple: Number(showtimeData.price?.couple || showtimeData.price * 2.2),
                },
                isFirstShow: showtimeData.isFirstShow || false,
                isLastShow: showtimeData.isLastShow || false,
                is3D: showtimeData.is3D || false,
                isSpecialShowing: showtimeData.isSpecialShowing || false,
                subtitles: showtimeData.subtitles || false,
                notes: showtimeData.notes || "",
                status: showtimeData.status || "scheduled",
            }

            const response = await api.post("/showtimes", transformedData)
            return response.data
        } catch (error) {
            console.error("Error creating showtime:", error)
            throw new Error(error.response?.data?.message || "Failed to create showtime")
        }
    },

    // Update showtime
    async updateShowtime(id, showtimeData) {
        try {
            // Transform data similar to create
            const transformedData = {
                movie: showtimeData.movieId,
                branch: showtimeData.branchId,
                theater: showtimeData.theaterId,
                startTime: new Date(`${showtimeData.date}T${showtimeData.time}`).toISOString(),
                endTime:
                    showtimeData.endTime || this.calculateEndTime(showtimeData.date, showtimeData.time, showtimeData.duration),
                price: {
                    standard: Number(showtimeData.price?.standard || showtimeData.price),
                    vip: Number(showtimeData.price?.vip || showtimeData.price * 1.5),
                    couple: Number(showtimeData.price?.couple || showtimeData.price * 2.2),
                },
                isFirstShow: showtimeData.isFirstShow || false,
                isLastShow: showtimeData.isLastShow || false,
                is3D: showtimeData.is3D || false,
                isSpecialShowing: showtimeData.isSpecialShowing || false,
                subtitles: showtimeData.subtitles || false,
                notes: showtimeData.notes || "",
                status: showtimeData.status || "scheduled",
            }

            const response = await api.put(`/showtimes/${id}`, transformedData)
            return response.data
        } catch (error) {
            console.error("Error updating showtime:", error)
            throw new Error(error.response?.data?.message || "Failed to update showtime")
        }
    },

    // Delete showtime
    async deleteShowtime(id) {
        try {
            await api.delete(`/showtimes/${id}`)
            return { success: true }
        } catch (error) {
            console.error("Error deleting showtime:", error)
            throw new Error(error.response?.data?.message || "Failed to delete showtime")
        }
    },

    // Bulk delete showtimes
    async bulkDeleteShowtimes(ids) {
        try {
            const response = await api.delete("/showtimes/bulk", {
                data: { ids },
            })
            return response.data
        } catch (error) {
            console.error("Error bulk deleting showtimes:", error)
            throw new Error("Failed to delete selected showtimes")
        }
    },

    // Delete past showtimes
    async deletePastShowtimes(beforeDate) {
        try {
            await api.delete(`/showtimes/past`, {
                data: { beforeDate },
            })
            return { success: true }
        } catch (error) {
            console.error("Error deleting past showtimes:", error)
            throw new Error("Failed to delete past showtimes")
        }
    },

    // Update showtime status
    async updateShowtimeStatus(id, status) {
        try {
            const response = await api.patch(`/showtimes/${id}/status`, { status })
            return response.data
        } catch (error) {
            console.error("Error updating showtime status:", error)
            throw new Error("Failed to update showtime status")
        }
    },

    // Get showtime statistics
    async getShowtimeStats(params = {}) {
        try {
            const response = await api.get("/showtimes/stats", { params })
            return response.data
        } catch (error) {
            console.error("Error fetching showtime stats:", error)
            return {
                total: 0,
                today: 0,
                branches: 0,
                movies: 0,
            }
        }
    },

    // Helper function to calculate end time
    calculateEndTime(date, time, duration = 120) {
        const startDateTime = new Date(`${date}T${time}`)
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000) // duration in minutes
        return endDateTime.toISOString()
    },

    // Real-time subscription for showtime updates
    subscribeToShowtimeUpdates(callback) {
        // This would typically use WebSocket or Server-Sent Events
        // For now, we'll simulate with polling
        const interval = setInterval(async () => {
            try {
                const data = await this.getShowtimes()
                callback(data)
            } catch (error) {
                console.error("Error in real-time update:", error)
            }
        }, 30000) // Poll every 30 seconds

        return () => clearInterval(interval)
    },
}

// Movie service for fetching movies
export const movieService = {
    async getMovies(params = {}) {
        try {
            const response = await api.get("/movies", { params })
            return response.data
        } catch (error) {
            console.error("Error fetching movies:", error)
            // Return mock data if API fails
            return {
                movies: [
                    { _id: "1", title: "Sample Movie 1", duration: 120 },
                    { _id: "2", title: "Sample Movie 2", duration: 135 },
                ],
            }
        }
    },
}

// Branch service for fetching branches
export const branchService = {
    async getBranches(params = {}) {
        try {
            const response = await api.get("/branches", { params })
            return response.data
        } catch (error) {
            console.error("Error fetching branches:", error)
            // Return mock data if API fails
            return {
                branches: [
                    {
                        _id: "branch1",
                        name: "Downtown Cinema",
                        location: { city: "New York", address: "123 Main St" },
                    },
                    {
                        _id: "branch2",
                        name: "Mall Cinema",
                        location: { city: "Los Angeles", address: "456 Mall Ave" },
                    },
                ],
            }
        }
    },
}

// Theater service for fetching theaters
export const theaterService = {
    async getTheaters(branchId = null) {
        try {
            const params = branchId ? { branchId } : {}
            const response = await api.get("/theaters", { params })
            return response.data
        } catch (error) {
            console.error("Error fetching theaters:", error)
            // Return mock data if API fails
            return {
                theaters: [
                    { _id: "theater1", name: "Theater 1", capacity: 150, branchId: branchId || "branch1" },
                    { _id: "theater2", name: "Theater 2", capacity: 120, branchId: branchId || "branch1" },
                    { _id: "theater3", name: "IMAX Theater", capacity: 200, branchId: branchId || "branch2" },
                ].filter((t) => !branchId || t.branchId === branchId),
            }
        }
    },
}
