import api from "./api";

export const branchService = {
    // Lấy danh sách branches, có thể filter qua params (ví dụ isActive, city, v.v.)
    async getBranches(params = {}) {
        const response = await api.get("/branches", { params });
        return response.data;
    },

    // Lấy chi tiết branch theo ID
    async getBranchById(id) {
        const response = await api.get(`/branches/${id}`);
        return response.data;
    },

    // Tạo mới branch, payload là object chứa toàn bộ fields
    async createBranch(branchData) {
        const response = await api.post("/branches", branchData);
        return response.data;
    },

    // Cập nhật branch theo ID
    async updateBranch(id, branchData) {
        const response = await api.put(`/branches/${id}`, branchData);
        return response.data;
    },

    // Xóa branch theo ID
    async deleteBranch(id) {
        await api.delete(`/branches/${id}`);
    },
};

export const getAllBranches = async () => {
    const { data } = await api.get('/branches/all');
    return data;
};
