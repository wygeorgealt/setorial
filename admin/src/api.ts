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
    getPayoutBatches: () => api.get('/admin/payout-batches'),
    triggerPayout: (month: string, revenue: number) =>
        api.post(`/admin/payout/trigger?month=${month}&revenue=${revenue}`),
};

export default api;
