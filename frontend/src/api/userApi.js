import axios from 'axios';
import { refreshAccessToken, clearAccessToken } from './authApi';

const API_URL = '/api/users';

const userApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// перехватчик запросов добавлением токена
userApi.interceptors.request.use(
    (config) => {
        const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// перехватчик ответов обновления токена
userApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn('Обнаружена ошибка 401: Access Token истек. Попытка обновления...');
            originalRequest._retry = true;
            try {
                const refreshed = await refreshAccessToken();
                const newToken = refreshed?.accessToken || refreshed;
                if (newToken) {
                    console.log('Access Token успешно обновлен. Повторный запрос...');
                    window.__ACCESS_TOKEN = newToken;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return userApi(originalRequest);
                }
            } catch (refreshErr) {
                console.error('Ошибка обновления токена. Требуется повторный вход.');
                clearAccessToken();
                // опционально редирект логин
            }
        }
        return Promise.reject(error);
    }
);

export const getUserById = async (id) => {
    const response = await userApi.get(`/${id}`);
    return response.data;
};

export const getMe = async () => {
    const response = await userApi.get('/me');
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await userApi.put(`/${id}`, userData);
    return response.data;
};

export const changePassword = async (id, oldPassword, newPassword) => {
    const response = await userApi.post(`/${id}/change-password`, {
        oldPassword,
        newPassword,
    });
    return response.data;
};
