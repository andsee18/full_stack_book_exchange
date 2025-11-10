import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';     // Основной бежевый акцент
const hoverColor = '#948a65';       // Бежевый акцент для наведения
const headerBackground = '#eae7dd'; // Фон хедера
const textColor = '#3c3838';        // Основной текст
const lightBackground = '#fdfcf7';  // Светлый фон приложения

// --- ЕДИНЫЙ КОМПОНЕНТ КНОПКИ С АНИМАЦИЕЙ ---
const AnimatedButton = ({ to, children, isAuth = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Выбираем базовый стиль в зависимости от типа кнопки (навигация или аутентификация)
    const baseStyle = isAuth ? authButtonStyle : navButtonStyle;
    
    // Определяем динамические стили при наведении
    const hoverStyles = isAuth ? {
        backgroundColor: hoverColor,
        transform: 'translateY(-1px) scale(1.02)',
        boxShadow: `0 5px 12px ${primaryColor}60`,
    } : {
        color: hoverColor,
        backgroundColor: lightBackground, // Фон при наведении
        transform: 'translateY(-1px) scale(1.02)', // Поднятие
        boxShadow: `0 3px 8px rgba(0, 0, 0, 0.1)`, // Мягкая тень
        // Для навигационных кнопок мы не меняем цвет, только фон
    };

    return (
        <Link
            to={to}
            style={{
                ...baseStyle,
                ...(isHovered ? hoverStyles : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
        </Link>
    );
};


// --- Основной компонент Layout ---
export default function Layout({ children }) {
    return (
        <div style={appStyle}>
            <header style={headerStyle}>
                
                <div style={logoStyle}>
                    <Link to="/" style={logoLinkStyle}>📚 Book Exchange</Link>
                </div>

                <nav style={navStyle}>
                    
                    {/* Кнопки навигации: теперь используют AnimatedButton */}
                    <AnimatedButton to="/profile">👤 Мой профиль</AnimatedButton>
                    <AnimatedButton to="/favorites">❤️ Избранные книги</AnimatedButton>
                    
                    {/* Кнопки авторизации: используют AnimatedButton с флагом isAuth */}
                    <AnimatedButton to="/login" isAuth={true}>Войти</AnimatedButton>
                    <AnimatedButton to="/register" isAuth={true}>Регистрация</AnimatedButton>
                    
                </nav>
            </header>
            
            <main style={mainStyle}>
                {children}
            </main>

            <footer style={footerStyle}>
                <p>&copy; 2025 Book Exchange Service</p>
            </footer>
        </div>
    );
}


// --- СТИЛИ КНОПОК И ХЕДЕРА ---

const appStyle = {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: lightBackground,
};

const headerStyle = {
    backgroundColor: headerBackground,
    padding: '15px 50px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `2px solid ${primaryColor}30`,
};

const logoStyle = {
    fontSize: '1.8em',
    fontWeight: 'bold',
};

const logoLinkStyle = {
    textDecoration: 'none',
    color: primaryColor,
    transition: 'color 0.2s',
};

const navStyle = {
    display: 'flex',
    gap: '15px', 
    alignItems: 'center',
};

// Базовый стиль для навигационных кнопок
const navButtonStyle = {
    textDecoration: 'none',
    color: textColor,
    fontWeight: '500',
    padding: '10px 15px',
    borderRadius: '8px',
    transition: 'all 0.3s ease-out',
    fontSize: '1.05em',
};

// Базовый стиль для кнопок аутентификации
const authButtonStyle = {
    textDecoration: 'none',
    backgroundColor: primaryColor,
    color: 'white',
    padding: '10px 20px',
    borderRadius: '25px',
    fontWeight: 'bold',
    boxShadow: `0 3px 8px ${primaryColor}40`,
    transition: 'all 0.3s ease-out',
    marginLeft: '10px',
};


const mainStyle = {
    padding: '20px',
};

const footerStyle = {
    backgroundColor: headerBackground,
    color: textColor,
    textAlign: 'center',
    padding: '10px 0',
    marginTop: '30px',
    fontSize: '0.9em',
    borderTop: `1px solid ${primaryColor}50`,
};