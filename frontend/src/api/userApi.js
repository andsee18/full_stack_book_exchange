import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const userApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// комментарий важный ключевой
userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getUserById = async (id) => {
    const response = await userApi.get(`/${id}`);
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
