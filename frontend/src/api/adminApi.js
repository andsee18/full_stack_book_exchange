import axios from 'axios';
import { refreshAccessToken, clearAccessToken } from './authApi';

const API_URL = 'http://localhost:5000/api';

const adminApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

adminApi.interceptors.request.use(
    (config) => {
        const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshed = await refreshAccessToken();
                const newToken = refreshed?.accessToken || refreshed;
                if (newToken) {
                    window.__ACCESS_TOKEN = newToken;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return adminApi(originalRequest);
                }
            } catch (refreshErr) {
                clearAccessToken();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getAllUsers = async () => {
    // важный ключевой момент
    const response = await adminApi.get('/users');
    return response.data;
};

export const setUserRole = async (userId, role) => {
    // важный ключевой момент
    const response = await adminApi.put(`/admin/users/${userId}/role`, { role });
    return response.data;
};

