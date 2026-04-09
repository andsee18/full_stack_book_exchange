import axios from 'axios';

import { clearAccessToken, refreshAccessToken } from './authApi';

// базовый url api
const API_URL = 'http://localhost:5000/api/books';

// экземпляр axios
const bookApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// перехватчик запросов
bookApi.interceptors.request.use(
    (config) => {
        // получение токена
        const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');

        if (token) {
            // добавление заголовка авторизации
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// перехватчик ответов
bookApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const originalRequest = error?.config;

        if (status === 401 && originalRequest && !originalRequest._retry) {
            // попытка обновления токена
            originalRequest._retry = true;

            try {
                const refreshed = await refreshAccessToken();
                const newToken = typeof refreshed === 'string' ? refreshed : refreshed?.accessToken;
                if (!newToken) throw new Error('No accessToken after refresh');

                // повтор запроса с новым токеном
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return bookApi(originalRequest);
            } catch (refreshErr) {
                console.error('Ошибка обновления токена в bookApi.');
                clearAccessToken();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

// получение всех книг с фильтрами
export const getAllBooks = async (params = {}) => {
    try {
        const response = await bookApi.get('/', { params });
        // сервер теперь возвращает объект
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
};

// получение книги по id
export const getBookById = async (id) => {
    try {
        const response = await bookApi.get(`/${id}`); 
        return response.data;
    } catch (error) {
        console.error(`Error fetching book with ID ${id}:`, error);
        throw error;
    }
};

// создание книги
export const createBook = async (formData) => {
    try {
        const response = await bookApi.post('/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating book:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// обновление книги
export const updateBook = async (id, formData) => {
    try {
        const response = await bookApi.put(`/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating book with ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// удаление книги
export const deleteBook = async (id) => {
    try {
        await bookApi.delete(`/${id}`);
        console.log(`Book with ID ${id} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting book with ID ${id}:`, error);
        throw error;
    }
};

// поиск книг в Google Books
export const searchGoogleBooks = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/search-google`, {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Google Books:', error);
        throw error;
    }
};
