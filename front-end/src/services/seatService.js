import api from './api';

export const seatService = {
  getSeatLayouts: async (params) => {
    const response = await api.get('/seats/layouts', { params });
    return response.data;
  },

  getSeatLayoutById: async (id) => {
    const response = await api.get(`/seats/layouts/${id}`);
    return response.data;
  },

  createSeatLayout: async (layoutData) => {
    const response = await api.post('/seats/layouts', layoutData);
    return response.data;
  },

  updateSeatLayout: async (id, layoutData) => {
    const response = await api.put(`/seats/layouts/${id}`, layoutData);
    return response.data;
  },

  deleteSeatLayout: async (id) => {
    const response = await api.delete(`/seats/layouts/${id}`);
    return response.data;
  },

  getSeatAvailability: async (showtimeId) => {
    const response = await api.get(`/seats/availability/${showtimeId}`);
    return response.data;
  },
};
