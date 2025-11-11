import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/authApi'; // <-- Убедитесь, что этот путь правильный

// --- Бежевая палитра для единообразия ---
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 

export default function Register() {
    // Изменяем state, чтобы соответствовать модели User на бэкенде
    const [username, setUsername] = useState(''); 
    const [location, setLocation] = useState(''); // Добавлено поле location
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState(''); 
    
    // Внимание: поле rating мы устанавливаем при отправке по умолчанию (5.0) для простоты

    const handleSubmit = async (e) => { // <-- Обязательно 'async'
        e.preventDefault();
        
        // !!! ЛОГИРОВАНИЕ ДЛЯ ДИАГНОСТИКИ !!!
        console.log('--- STARTING SUBMIT ---'); 
        
        setMessage('');

        if (password !== passwordConfirm) {
            setMessage('Ошибка: Пароли не совпадают!');
            console.error('Password mismatch');
            return;
        }

        try {
            // Данные для отправки на бэкенд, соответствующие модели User
            const userData = {
                username: username,
                password: password,
                location: location,
                rating: 5.0 // Устанавливаем базовый рейтинг
            };
            
            console.log('Data sent to API:', userData); // Логируем отправляемые данные

            const newUser = await registerUser(userData); // <-- Вызов API

            // Если запрос успешен (статус 201 Created)
            setMessage(`Успешная регистрация! ID: ${newUser.id}`);
            
            // Очистка формы
            setUsername('');
            setLocation('');
            setPassword('');
            setPasswordConfirm('');

        } catch (error) {
            // Обработка ошибок
            setMessage('Ошибка регистрации. Проверьте консоль браузера и терминал бэкенда.');
            console.error('Registration error details:', error);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={headerStyle}>Регистрация</h1>
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* Поле Имя пользователя (username) */}
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    {/* Поле Местоположение (location) */}
                    <input
                        type="text"
                        placeholder="Местоположение (город)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    {/* Поле Пароль */}
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    {/* Поле Подтверждение пароля */}
                    <input
                        type="password"
                        placeholder="Подтвердите пароль"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <button type="submit" style={buttonStyle}>
                        Зарегистрироваться
                    </button>
                </form>
                
                {/* Сообщение об успехе или ошибке */}
                {message && (
                    <p style={{ marginTop: '15px', color: message.startsWith('Успешная') ? primaryColor : 'red' }}>
                        {message}
                    </p>
                )}

                <p style={footerTextStyle}>
                    Уже есть аккаунт? <Link to="/login" style={linkStyle}>Войти</Link>
                </p>
            </div>
        </div>
    );
}

// --- Стили ---
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
    maxWidth: '400px',
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


const footerTextStyle = {
    marginTop: '20px',
    fontSize: '0.9em',
};

const linkStyle = {
    color: primaryColor,
    textDecoration: 'none',
    fontWeight: 'bold',
};