import api from './api';

export const liveService = {
    startLive: async (data) => {
        const response = await api.post('/lives/start', data);
        return response.data;
    },

    updateLive: async (id, data) => {
        const response = await api.patch(`/lives/${id}/update`, data);
        return response.data;
    },

    finishLive: async (id, data) => {
        const response = await api.post(`/lives/${id}/finish`, data);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/lives');
        return response.data;
    },

    getDetails: async (id) => {
        const response = await api.get(`/lives/${id}`);
        return response.data;
    },

    uploadScreenshot: async (formData) => {
        const response = await api.post('/ai/extract-screenshot', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
