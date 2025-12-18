import React from 'react';
// импортируем родительской важный
import Header from '../Header'; 


// единая палитра важный
const primaryColor = '#a89d70';     // Основной бежевый акцент
const headerBackground = '#eae7dd'; // Фон хедера
const textColor = '#3c3838';        // Основной текст
const lightBackground = '#fdfcf7';  // Светлый фон приложения


// стили важный ключевой

const appStyle = {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: lightBackground,
    display: 'flex',
    flexDirection: 'column',
};

const mainStyle = {
    flexGrow: 1, // Позволяет main занять все доступное пространство
    padding: '20px 50px', // Увеличиваем горизонтальный паддинг для симметрии с хедером
};

const footerStyle = {
    backgroundColor: headerBackground,
    color: textColor,
    textAlign: 'center',
    padding: '15px 0',
    marginTop: '30px',
    fontSize: '0.9em',
    borderTop: `1px solid ${primaryColor}50`,
};


// основной компонент важный
export default function Layout({ children }) {
    return (
        <div style={appStyle}>
            
            {/* Используем отдельный компонент Header */}
            <Header />
            
            <main style={mainStyle}>
                {children}
            </main>

            <footer style={footerStyle}>
                <p>&copy; 2025 Book Exchange Service</p>
            </footer>
        </div>
    );
}