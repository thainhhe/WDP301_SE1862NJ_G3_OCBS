import api from "./api";

export const comboService = {
  // For admin panel
  getAdminCombos: async () => {
    const response = await api.get('/combos/admin');
    return response.data;
  },
  getComboById: async (id) => {
    const response = await api.get(`/combos/${id}`);
    return response.data;
  },
  createCombo: async (comboData) => {
    const response = await api.post('/combos', comboData);
    return response.data;
  },
  updateCombo: async (id, comboData) => {
    const response = await api.put(`/combos/${id}`, comboData);
    return response.data;
  },
  deleteCombo: async (id) => {
    const response = await api.delete(`/combos/${id}`);
    return response.data;
  },
  // For customers
  getCombos: async (params = {}) => {
    const res = await api.get("/combos", { params });
    return res.data;
  },
};