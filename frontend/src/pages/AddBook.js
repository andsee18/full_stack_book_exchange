import React, { useState } from 'react';
import { createBook } from '../api/bookApi'; // импорт функции для отправки книги

// --- палитра ---
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 

export default function AddBook() {
    // состояние для всех полей книги
    const [bookData, setBookData] = useState({
        title: '',
        author: '',
        description: '',
        ownerId: '', // id пользователя-владельца
        status: 'available' // статус по умолчанию
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // обработчик изменений в полях
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData(prev => ({
            ...prev,
            // ownerId должен быть числом
            [name]: name === 'ownerId' ? Number(value) : value 
        }));
    };

    // обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        // Проверка на то, что ownerId введено
        if (!bookData.ownerId) {
            setMessage('ошибка: необходимо указать id владельца.');
            setIsError(true);
            return;
        }

        try {
            // отправка данных на бэкенд
            const newBook = await createBook(bookData); 
            
            setMessage(`книга "${newBook.title}" успешно добавлена! id: ${newBook.id}`);
            
            // очистка формы после успешного добавления
            setBookData({
                title: '',
                author: '',
                description: '',
                ownerId: '',
                status: 'available'
            });

        } catch (error) {
            // обработка ошибки (например, 400 bad request, если ownerid не существует)
            let errorMessage = 'ошибка при добавлении книги. проверьте консоль.';
            if (error.response && error.response.status === 400) {
                errorMessage = 'ошибка: пользователь с таким id не найден. проверьте owner id.';
            }
            setMessage(errorMessage);
            setIsError(true);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={headerStyle}>➕ добавить книгу для обмена</h1>
                
                {/* сообщение об успехе/ошибке */}
                {message && (
                    <p style={{ ...messageStyle, color: isError ? 'red' : primaryColor }}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* поле: название */}
                    <input
                        type="text"
                        name="title"
                        placeholder="название книги"
                        value={bookData.title}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    
                    {/* поле: автор */}
                    <input
                        type="text"
                        name="author"
                        placeholder="автор"
                        value={bookData.author}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    {/* поле: описание */}
                    <textarea
                        name="description"
                        placeholder="краткое описание"
                        value={bookData.description}
                        onChange={handleChange}
                        required
                        style={{...inputStyle, height: '100px'}}
                    />
                    
                    {/* поле: ID Владельца (для теста) */}
                    <input
                        type="number"
                        name="ownerId"
                        placeholder="ваш id пользователя (например, 1)"
                        value={bookData.ownerId}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    {/* поле: статус (скрыто, по умолчанию 'available') */}
                    <input
                        type="hidden"
                        name="status"
                        value={bookData.status}
                    />
                    
                    <button type="submit" style={buttonStyle}>
                        добавить книгу
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- стили ---
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh', 
};

const cardStyle = {
    backgroundColor: darkBeigeColor,
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
};

const headerStyle = {
    color: primaryColor,
    marginBottom: '30px',
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
};

const inputStyle = {
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
    backgroundColor: 'white',
};

const buttonStyle = {
    backgroundColor: primaryColor,
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
};

const messageStyle = {
    marginBottom: '15px',
    fontWeight: 'bold',
};