import api from "./api";

export const getDashboardStats = async (params) => {
  const { data } = await api.get("/admin-dashboard/stats", { params });
  return data;
}; 