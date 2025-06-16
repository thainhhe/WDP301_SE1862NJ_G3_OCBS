import api from "./api"

export const showtimeService = {
    // Get showtimes with filters matching your database structure
    async getShowtimes(params = {}) {
        const response = await api.get("/showtimes", { params })
        return response.data
    },

    // Get showtime by ID
    async getShowtimeById(id) {
        const response = await api.get(`/showtimes/${id}`)
        return response.data
    },

    // Create new showtime with your database structure
    async createShowtime(showtimeData) {
        // Expected structure:
        // {
        //   movie: "movieId",
        //   branch: "branchId",
        //   theater: "theaterId",
        //   startTime: "2025-05-24T14:00:00.000Z",
        //   endTime: "2025-05-24T16:28:00.000Z",
        //   price: {
        //     standard: 100000,
        //     vip: 150000,
        //     couple: 220000
        //   },
        //   isFirstShow: false,
        //   isLastShow: false
        // }
        const response = await api.post("/showtimes", showtimeData)
        return response.data
    },

    // Update showtime
    async updateShowtime(id, showtimeData) {
        const response = await api.put(`/showtimes/${id}`, showtimeData)
        return response.data
    },

    // Delete showtime
    async deleteShowtime(id) {
        await api.delete(`/showtimes/${id}`)
    },

    // Delete past showtimes
    async deletePastShowtimes(beforeDate) {
        await api.delete(`/showtimes/past`, {
            data: { beforeDate },
        })
    },
}
