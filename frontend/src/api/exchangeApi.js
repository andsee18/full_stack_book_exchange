import axios from 'axios';

import { clearAccessToken, refreshAccessToken } from './authApi';

const API_URL = 'http://localhost:5000/api/exchange';

const exchangeApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

exchangeApi.interceptors.request.use(
    (config) => {
        const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

exchangeApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const originalRequest = error?.config;

        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshed = await refreshAccessToken();
                const newToken = typeof refreshed === 'string' ? refreshed : refreshed?.accessToken;
                if (!newToken) throw new Error('No accessToken after refresh');
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return exchangeApi(originalRequest);
            } catch (refreshErr) {
                clearAccessToken();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export const createExchangeRequest = async (requestedBookId, offeredBookId) => {
    const response = await exchangeApi.post('/', { requestedBookId, offeredBookId });
    return response.data;
};

export const getIncomingExchangeRequests = async () => {
    const response = await exchangeApi.get('/incoming');
    return response.data;
};

export const getOutgoingExchangeRequests = async () => {
    const response = await exchangeApi.get('/outgoing');
    return response.data;
};

export const acceptExchangeRequest = async (id) => {
    const response = await exchangeApi.put(`/${id}/accept`);
    return response.data;
};

export const rejectExchangeRequest = async (id) => {
    const response = await exchangeApi.put(`/${id}/reject`);
    return response.data;
};

export const cancelExchangeRequest = async (id) => {
    const response = await exchangeApi.put(`/${id}/cancel`);
    return response.data;
};

export const clearMyExchangeHistory = async () => {
    const response = await exchangeApi.post('/history/clear');
    return response.data;
};
