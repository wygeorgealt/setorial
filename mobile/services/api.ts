import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from '../store/authStore';

const API_URL = 'https://truthful-florence-firstness.ngrok-free.dev';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Bypass-Tunnel-Reminder': 'true'
    }
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    getMe: () => api.get('/users/me'),
    updateProfile: (data: any) => api.patch('/users/me', data),
    changePassword: (data: any) => api.patch('/auth/password', data),
    getProgress: () => api.get('/users/me/progress'),
};

export const walletApi = {
    getBalance: () => api.get('/wallet/balance'),
    getTransactions: () => api.get('/wallet/transactions'),
};

export const gamificationApi = {
    getLeaderboard: () => api.get('/gamification/leaderboard'),
};

export const subscriptionApi = {
    initialize: (tier: string) => api.post('/subscriptions/initialize', { tier }),
    verify: (reference: string) => api.get(`/subscriptions/verify/${reference}`),
};

export const learningApi = {
    getSubjects: () => api.get('/learning/subjects'),
    getSubject: (id: string) => api.get(`/learning/subjects/${id}`),
    getQuiz: (id: string) => api.get(`/learning/quizzes/${id}`),
    submitQuiz: (data: any) => api.post('/learning/quizzes/submit', data),
};

export const kycApi = {
    submitKyc: (data: { payoutMethod: 'NGN_BANK' | 'USD_PAYPAL'; payoutAccount: Record<string, any> }) =>
        api.post('/users/me/kyc', data),
    getBanks: () => api.get('/users/me/kyc/banks'),
    resolveAccount: (accountNumber: string, bankCode: string) =>
        api.get(`/users/me/kyc/resolve?accountNumber=${accountNumber}&bankCode=${bankCode}`),
};
