import axios from 'axios';

import { clearAccessToken, refreshAccessToken } from './authApi';

const API_URL = 'http://localhost:5000/api/ratings';

const ratingApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

ratingApi.interceptors.request.use(
    (config) => {
        const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

ratingApi.interceptors.response.use(
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
                return ratingApi(originalRequest);
            } catch (refreshErr) {
                clearAccessToken();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export const rateExchange = async (exchangeRequestId, stars) => {
    const response = await ratingApi.post('/', { exchangeRequestId, stars });
    return response.data;
};

export const getMyRatedExchangeIds = async () => {
    const response = await ratingApi.get('/mine');
    return response.data;
};
