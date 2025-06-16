import api from './api';

export const userService = {
    /**
     * Fetches a paginated list of users.
     * @param {object} params - The query parameters.
     * @param {number} params.page - The current page number.
     * @param {number} params.limit - The number of items per page.
     * @param {string} params.search - The search keyword.
     * @param {string} params.role - The role to filter by.
     * @returns {Promise<any>}
     */
    getUsers(params) {
        return api.get('/users', { params });
    }
    // Thêm các hàm createUser, updateUser, deleteUser nếu cần
};
