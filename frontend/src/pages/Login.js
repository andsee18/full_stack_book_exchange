import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

// бежевая палитра для
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 

export default function Login() {
    // меняем важный для
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    // состояние вывода для
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // асинхронная функция обработки
    const handleSubmit = async (e) => { // обязательно async
        e.preventDefault();
        setMessage(''); // очистить предыдущее сообщение

        // логируем попытку входа
        console.log('login attempt:', { username, password });
        
        try {
            // вызов функции контекста
            const success = await login(username, password);
            
            if (success) {
                // вход успешен важный
                setMessage('Вход успешен! Перенаправление...');
                setTimeout(() => {
                    navigate('/'); // перенаправляем на главную (страница всех книг)
                }, 1000);
            } else {
                setMessage('Ошибка: Неверное имя пользователя или пароль.');
            }

        } catch (error) {
            // вход удался важный
            if (error.response && error.response.status === 401) {
                setMessage('Ошибка входа: неверное имя пользователя или пароль.');
            } else {
                setMessage('Ошибка входа. Проверьте соединение с сервером.');
            }
        }
    };

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Вход - BookExchange</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Вход в систему</h1>
                <form onSubmit={handleSubmit} style={formStyle}>
                   
                    <input
                        type="text" // используем text для username
                           placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <input
                        type="password"
                           placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <button type="submit" style={buttonStyle}>
                           Войти
                    </button>
                </form>
                
                {/* вывод сообщений об ошибке или успехе */}
                {message && (
                    <p style={{ 
                        marginTop: '15px', 
                        color: message.toLowerCase().includes('успешен') ? primaryColor : 'red' 
                    }}>
                        {message}
                    </p>
                )}

                   <p style={footerTextStyle}>
                       Еще нет аккаунта? <Link to="/register" style={linkStyle}>Зарегистрироваться</Link>
                   </p>
            </div>
        </div>
    );
}

// стили важный ключевой
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

const titleStyle = {
    color: primaryColor,
    marginBottom: '10px',
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