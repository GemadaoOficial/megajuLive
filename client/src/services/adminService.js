import api from './api';

export const adminService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    getUserDetails: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    updateUser: async (id, data) => {
        const response = await api.patch(`/admin/users/${id}/status`, data);
        return response.data;
    },

    // Modules
    createModule: async (data) => {
        const response = await api.post('/modules', data);
        return response.data;
    },
    updateModule: async (id, data) => {
        const response = await api.patch(`/modules/${id}`, data);
        return response.data;
    },
    deleteModule: async (id) => {
        await api.delete(`/modules/${id}`);
    }
};
