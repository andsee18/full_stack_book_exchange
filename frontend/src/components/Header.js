import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';     // Основной бежевый акцент
const hoverColor = '#948a65';       // Бежевый акцент для наведения
const headerBackground = '#eae7dd'; // Фон хедера
const textColor = '#3c3838';        // Основной текст
const lightBackground = '#fdfcf7';  // Светлый фон приложения

// --- СТИЛИ КНОПОК И ХЕДЕРА ---

const logoStyle = {
    textDecoration: 'none',
    color: primaryColor,
    fontSize: '1.8em',
    fontWeight: 'bold',
    transition: 'color 0.2s',
};

const navStyle = {
    display: 'flex',
    gap: '15px', 
    alignItems: 'center',
};

// Базовый стиль для навигационных ссылок
const navLinkStyle = {
    textDecoration: 'none',
    color: textColor,
    fontWeight: '500',
    padding: '10px 15px',
    borderRadius: '8px',
    transition: 'all 0.3s ease-out',
    fontSize: '1.05em',
};

// Базовый стиль для кнопок действия/аутентификации
const actionButtonStyle = {
    // Стилизация как для кнопки
    appearance: 'none', // Сброс стилей браузера для кнопки
    border: 'none',
    cursor: 'pointer',

    textDecoration: 'none',
    backgroundColor: primaryColor,
    color: 'white',
    padding: '10px 20px',
    borderRadius: '25px',
    fontWeight: 'bold',
    boxShadow: `0 3px 8px ${primaryColor}40`,
    transition: 'all 0.3s ease-out',
    marginLeft: '10px',
    fontSize: '1em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
};

// --- ЕДИНЫЙ КОМПОНЕНТ ДЛЯ КНОПОК/ССЫЛОК С АНИМАЦИЕЙ ---
// Принимает `isButton` для отображения либо <Link>, либо <button>
const InteractiveElement = ({ to, children, isAction = false, onClick, title }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Выбираем базовый стиль
    const baseStyle = isAction ? actionButtonStyle : navLinkStyle;
    
    // Определяем динамические стили при наведении
    const hoverStyles = isAction ? {
        backgroundColor: hoverColor,
        transform: 'translateY(-1px) scale(1.02)',
        boxShadow: `0 5px 12px ${primaryColor}60`,
    } : {
        color: hoverColor,
        backgroundColor: lightBackground,
        transform: 'translateY(-1px) scale(1.02)',
        boxShadow: `0 3px 8px rgba(0, 0, 0, 0.1)`,
    };

    const elementProps = {
        style: {
            ...baseStyle,
            ...(isHovered ? hoverStyles : {}),
        },
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        title: title,
    };

    if (onClick) {
        // Это кнопка (например, "Выйти" или "Войти (тест)")
        return (
            <button 
                {...elementProps} 
                onClick={onClick}
            >
                {children}
            </button>
        );
    }

    // Это Link (например, "Профиль" или "Войти")
    return (
        <Link
            to={to}
            {...elementProps}
        >
            {children}
        </Link>
    );
};


// --- Основной компонент Header ---
export default function Header() {
    // Состояние авторизации
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

    // Функция выхода
    const handleLogout = () => {
        setIsLoggedIn(false);
        // Тут будет реальная очистка токена
        console.log('Выход выполнен (тест)');
    };
    
    // Функция входа (для тестирования UI)
    const handleLoginToggle = () => {
        setIsLoggedIn(true);
        console.log('Вход выполнен (тест)');
    };


    return (
        <header style={{
            backgroundColor: headerBackground,
            padding: '15px 50px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `2px solid ${primaryColor}30`,
        }}>
            
            <Link to="/" style={logoStyle}>
                <span style={{marginRight: '10px'}} role="img" aria-label="Books">📚</span>
                Book Exchange
            </Link>

            <nav style={navStyle}>
                
                {/* Каталог всегда виден */}
                <InteractiveElement to="/">Каталог</InteractiveElement>

                {isLoggedIn ? (
                    //КНОПКИ ДЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
                    <>
                        <InteractiveElement to="/add-book">➕ Добавить книгу</InteractiveElement>
                        <InteractiveElement to="/exchanges">🔄 Обмены</InteractiveElement>
                        <InteractiveElement to="/profile">👤 Профиль</InteractiveElement>
                        <InteractiveElement 
                            onClick={handleLogout} // Используем onClick для кнопки, а не to
                            isAction={true} // Стиль кнопки действия
                            title="Выйти из аккаунта (тест)"
                        >
                            Выйти
                        </InteractiveElement>
                    </>
                ) : (
                    //КНОПКИ ДЛЯ НЕАВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
                    <>
                        <InteractiveElement to="/login" isAction={true}>Войти</InteractiveElement>
                        <InteractiveElement to="/register" isAction={true}>Регистрация</InteractiveElement>
                         <InteractiveElement 
                            onClick={handleLoginToggle} 
                            isAction={true}
                            title="Нажмите, чтобы увидеть кнопки для авторизованного пользователя"
                        >
                            Войти (тест)
                        </InteractiveElement>
                    </>
                )}
            </nav>
        </header>
    );
}