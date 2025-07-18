import api from './api';

export const theaterService = {
    getTheatersByBranch: async (branchId) => {
        try {
            const response = await api.get(`/theaters/branch/${branchId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching theaters by branch:", error);
            throw error;
        }
    },

    createTheater: async (theaterData) => {
        try {
            const response = await api.post('/theaters', theaterData);
            return response.data;
        } catch (error) {
            console.error("Error creating theater:", error);
            throw error;
        }
    },

    updateTheater: async (id, theaterData) => {
        try {
            const response = await api.put(`/theaters/${id}`, theaterData);
            return response.data;
        } catch (error) {
            console.error("Error updating theater:", error);
            throw error;
        }
    },

    deleteTheater: async (id) => {
        try {
            const response = await api.delete(`/theaters/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting theater:", error);
            throw error;
        }
    }

};