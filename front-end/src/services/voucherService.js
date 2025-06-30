import api from "./api";

export const voucherService = {
    async getVouchers(params = {}) {
        const response = await api.get("/vouchers", { params });
        return response.data;
    },

    async getVoucherById(id) {
        const response = await api.get(`/vouchers/${id}`);
        return response.data;
    },

    async createVoucher(voucherData) {
        const response = await api.post("/vouchers", voucherData);
        return response.data;
    },

    async updateVoucher(id, voucherData) {
        const response = await api.put(`/vouchers/${id}`, voucherData);
        return response.data;
    },

    async deleteVoucher(id) {
        await api.delete(`/vouchers/${id}`);
    },
};