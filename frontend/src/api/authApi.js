import axios from 'axios';

const API_URL_USERS = 'http://localhost:5000/api/users'; 

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(API_URL_USERS, userData);
        return response.data; 
    } catch (error) {
        console.error('registration failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

//  вход пользователя
export const loginUser = async (credentials) => {
    try {
        //  /api/users/login
        const response = await axios.post(`${API_URL_USERS}/login`, credentials);
        
        return response.data; 
    } catch (error) {
        console.error('login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};