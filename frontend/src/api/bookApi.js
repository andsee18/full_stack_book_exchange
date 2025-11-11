import axios from 'axios';

const API_URL_BOOKS = 'http://localhost:5000/api/books';

// получить список всех книг
export const getAllBooks = async () => {
    try {
        const response = await axios.get(API_URL_BOOKS);
        return response.data;
    } catch (error) {
        console.error('ошибка при получении книг:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// создать новую книгу
export const createBook = async (bookData) => {
    try {
        const response = await axios.post(API_URL_BOOKS, bookData);
        // возвращает созданную книгу со статусом 201 created
        return response.data; 
    } catch (error) {
        console.error('ошибка при создании книги:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// обновить существующую книгу 
export const updateBook = async (id, bookData) => {
    try {
        const response = await axios.put(`${API_URL_BOOKS}/${id}`, bookData);
        return response.data;
    } catch (error) {
        console.error(`ошибка при обновлении книги id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// удалить книгу
export const deleteBook = async (id) => {
    try {
        // возвращает 204 no content в случае успеха
        await axios.delete(`${API_URL_BOOKS}/${id}`);
    } catch (error) {
        console.error(`ошибка при удалении книги id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};