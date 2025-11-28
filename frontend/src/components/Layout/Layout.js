import React from 'react';
// Импортируем исправленный компонент Header
import Header from './Header'; 


// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';     // Основной бежевый акцент
const headerBackground = '#eae7dd'; // Фон хедера
const textColor = '#3c3838';        // Основной текст
const lightBackground = '#fdfcf7';  // Светлый фон приложения


// --- СТИЛИ LAYOUT ---

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


// --- Основной компонент Layout ---
// children должен находиться в main
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