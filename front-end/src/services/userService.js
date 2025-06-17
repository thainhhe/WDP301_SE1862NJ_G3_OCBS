import api from './api';

export const userService = {
    getUsers(params) {
        return api.get('/users', { params });
    },
    getUser(id) {
        return api.get(`/users/${id}`);
    },
    createUser(userData) {
        return api.post('/users', userData);
    },
    updateUser(id, userData) {
        return api.put(`/users/${id}`, userData);
    },
    deleteUsers(ids) {
        return api.delete('/users', { data: { ids } });
    }
};
