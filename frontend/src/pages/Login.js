import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../api/authApi'; // импорт функции api

// --- бежевая палитра для единообразия ---
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 

export default function Login() {
    // меняем email на username для соответствия бэкенду
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    // состояние для вывода сообщений пользователю
    const [message, setMessage] = useState(''); 

    // асинхронная функция обработки отправки формы
    const handleSubmit = async (e) => { // обязательно async
        e.preventDefault();
        setMessage(''); // очистить предыдущее сообщение

        // логируем попытку входа для отладки
        console.log('login attempt:', { username, password });
        
        try {
            const credentials = { username, password };
            
            // вызов функции api для входа
            const user = await loginUser(credentials);
            
            // вход успешен
            setMessage(`вход успешен! приветствуем ${user.username}.`);
            // в реальном приложении: сохранить данные пользователя в localstorage/context
            
            // опционально: очистить поля
            setUsername('');
            setPassword('');

        } catch (error) {
            // вход не удался (например, 401 unauthorized)
            if (error.response && error.response.status === 401) {
                setMessage('ошибка входа: неверное имя пользователя или пароль.');
            } else {
                setMessage('ошибка входа. проверьте соединение с сервером.');
            }
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={headerStyle}>вход в систему</h1>
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    <input
                        type="text" // используем text для username
                        placeholder="имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <input
                        type="password"
                        placeholder="пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <button type="submit" style={buttonStyle}>
                        войти
                    </button>
                </form>
                
                {/* вывод сообщений об ошибке или успехе */}
                {message && (
                    <p style={{ 
                        marginTop: '15px', 
                        color: message.startsWith('успешен') ? primaryColor : 'red' 
                    }}>
                        {message}
                    </p>
                )}

                <p style={footerTextStyle}>
                    ещё нет аккаунта? <Link to="/register" style={linkStyle}>зарегистрироваться</Link>
                </p>
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