import axios from 'axios';

import { clearAccessToken, refreshAccessToken } from './authApi';

// устанавливаем базовый важный
const API_URL = 'http://localhost:5000/api/books';

// создаем экземпляр важный
const bookApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// перехватчик запросов важный
bookApi.interceptors.request.use(
    (config) => {
        // получаем токен предполагаем
        const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken'); 

        if (token) {
            // токен существует если
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// перехватчик ответов важный
bookApi.interceptors.response.use(
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
                return bookApi(originalRequest);
            } catch (refreshErr) {
                clearAccessToken();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

// функции работы для

/* получить все книги */
export const getAllBooks = async () => {
    try {
        const response = await bookApi.get('/'); 
        return response.data;
    } catch (error) {
        console.error('Error fetching all books:', error);
        throw error;
    }
};

/* получить одну книгу */
export const getBookById = async (id) => {
    try {
        const response = await bookApi.get(`/${id}`); 
        return response.data;
    } catch (error) {
        console.error(`Error fetching book with ID ${id}:`, error);
        throw error;
    }
};

/* создать новую книгу */
export const createBook = async (bookData) => {
    try {
        const response = await bookApi.post('/', bookData); 
        return response.data;
    } catch (error) {
        console.error('Error creating book:', error.response ? error.response.data : error.message);
        throw error;
    }
};

/* обновить книгу важный */
export const updateBook = async (id, bookData) => {
    try {
        const response = await bookApi.put(`/${id}`, bookData);
        return response.data;
    } catch (error) {
        console.error(`Error updating book with ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

/* удалить книгу важный */
export const deleteBook = async (id) => {
    try {
        await bookApi.delete(`/${id}`);
        console.log(`Book with ID ${id} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting book with ID ${id}:`, error);
        throw error;
    }
};