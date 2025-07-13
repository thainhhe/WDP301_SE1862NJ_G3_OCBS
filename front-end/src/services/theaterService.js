import api from "./api"

export const theaterService = {
    // Get all theaters with optional filtering
    async getTheaters(params = {}) {
        try {
            const response = await api.get("/theaters", { params })
            return response.data
        } catch (error) {
            console.error("Error fetching theaters:", error)
            throw new Error(error.response?.data?.message || "Failed to fetch theaters")
        }
    },

    // Get theater by ID
    async getTheaterById(id) {
        try {
            const response = await api.get(`/theaters/${id}`)
            return response.data
        } catch (error) {
            console.error("Error fetching theater:", error)
            throw new Error(error.response?.data?.message || "Failed to fetch theater")
        }
    },

    // Create new theater
    async createTheater(theaterData) {
        try {
            const response = await api.post("/theaters", {
                name: theaterData.name,
                capacity: theaterData.capacity,
                seatLayout: theaterData.seatLayout,
            })
            return response.data
        } catch (error) {
            console.error("Error creating theater:", error)
            throw new Error(error.response?.data?.message || "Failed to create theater")
        }
    },

    // Update theater
    async updateTheater(id, theaterData) {
        try {
            const response = await api.put(`/theaters/${id}`, {
                name: theaterData.name,
                capacity: theaterData.capacity,
                seatLayout: theaterData.seatLayout,
            })
            return response.data
        } catch (error) {
            console.error("Error updating theater:", error)
            throw new Error(error.response?.data?.message || "Failed to update theater")
        }
    },

    // Delete theater
    async deleteTheater(id) {
        try {
            await api.delete(`/theaters/${id}`)
            return { success: true }
        } catch (error) {
            console.error("Error deleting theater:", error)
            throw new Error(error.response?.data?.message || "Failed to delete theater")
        }
    },

    // Get theater statistics
    async getTheaterStats(id) {
        try {
            const response = await api.get(`/theaters/${id}/stats`)
            return response.data
        } catch (error) {
            console.error("Error fetching theater stats:", error)
            throw new Error(error.response?.data?.message || "Failed to fetch theater statistics")
        }
    },
}
