import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://172.20.10.3:3000'; // Update this to your local IP for physical device testing

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
};

export const learningApi = {
    getSubjects: () => api.get('/learning/subjects'),
    getQuiz: (id: string) => api.get(`/learning/quizzes/${id}`),
    submitQuiz: (data: any) => api.post('/learning/quizzes/submit', data),
};
