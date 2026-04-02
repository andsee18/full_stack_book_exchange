import axios from 'axios';

const API_URL_USERS = 'http://localhost:5000/api/users';
const API_URL_AUTH = 'http://localhost:5000/api/auth';

let refreshPromise = null;

const setAccessToken = (token) => {
    if (token) {
        window.__ACCESS_TOKEN = token;
        localStorage.setItem('jwtToken', token);
    }
};

export const clearAccessToken = () => {
    window.__ACCESS_TOKEN = null;
    localStorage.removeItem('jwtToken');
};

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(API_URL_USERS, userData);
        return response.data; 
    } catch (error) {
        console.error('registration failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// вход пользователя получение токенов
export const loginUser = async (credentials) => {
    try {
        // отправка запроса вход
        const response = await axios.post(`${API_URL_AUTH}/login`, credentials, { withCredentials: true });
        const data = response.data;
        // сохранение важный ключевой
        if (data && data.accessToken) {
            setAccessToken(data.accessToken);
        }
        return data;
    } catch (error) {
        console.error('login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// обновление через важный
export const refreshAccessToken = async () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = axios
        .post(`${API_URL_AUTH}/refresh`, {}, { withCredentials: true })
        .then((response) => {
            const data = response.data;
            if (data && data.accessToken) {
                setAccessToken(data.accessToken);
                return data;
            }
            throw new Error('No accessToken in refresh response');
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
};

// выход пользователя отзыв токена
export const logout = async () => {
    try {
        const response = await axios.post(`${API_URL_AUTH}/logout`, {}, { withCredentials: true });
        clearAccessToken();
        return response.data;
    } catch (error) {
        console.error('logout failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};