import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Intercept requests to add the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercept responses to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const adminApi = {
    login: (data: any) => api.post('/auth/login', data),
    getDashboardStats: () => api.get('/admin/dashboard'),
    getPendingKyc: () => api.get('/admin/kyc'),
    approveKyc: (id: string) => api.post(`/admin/kyc/${id}/approve`),
    rejectKyc: (id: string, reason: string) => api.post(`/admin/kyc/${id}/reject`, { reason }),
    getUsers: (params: any) => api.get('/admin/users', { params }),
    freezeUser: (id: string, reason: string) => api.post(`/admin/users/${id}/freeze`, { reason }),
    // Payouts
    getPayoutBatches: () => api.get('/admin/payout-batches'),
    triggerPayout: (month: string, revenue: number) =>
        api.post(`/admin/payout/trigger?month=${month}&revenue=${revenue}`),

    // Pricing & Regions
    getPricing: () => api.get('/admin/pricing'),
    createPricing: (data: any) => api.post('/admin/pricing', data),
    updatePricing: (id: string, data: any) => api.patch(`/admin/pricing/${id}`, data),
    deletePricing: (id: string) => api.delete(`/admin/pricing/${id}`),
    getRegionalStats: () => api.get('/admin/regions'),
};

export default api;
