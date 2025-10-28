import apiClient from './apiClient.js';

export const adminService = {
    getOverview: async () => {
        const response = await apiClient.get('/admin/overview/');
        return response.data;
    },
    getUserActivity: async (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        });

        const query = searchParams.toString();
        const response = await apiClient.get(`/admin/user-activity/${query ? `?${query}` : ''}`);
        return response.data;
    },
    getAiUsage: async () => {
        const response = await apiClient.get('/admin/ai-usage/');
        return response.data;
    },
};
