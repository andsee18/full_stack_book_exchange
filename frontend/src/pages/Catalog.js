import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ИМПОРТ ОБЛОЖЕК
import cover1 from '../assets/master_i_margarita.jpg'; 
import cover2 from '../assets/dark_tower.jpg'; 
import cover3 from '../assets/idiot.jpg'; 
import cover4 from '../assets/motilok.jpg'; 
import cover5 from '../assets/nad_propast.jpg'; 
import cover6 from '../assets/deti_moi.jpg'; 

// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';       // Основной бежевый акцент
const hoverColor = '#948a65';         // Бежевый акцент для наведения
const cardBackground = '#eae7dd';     // Фон карточек
const textColor = '#3c3838';          // Основной текст

// Заглушечные данные
const DUMMY_BOOKS = [
    { id: 1, title: 'Мастер и Маргарита', author: 'М. А. Булгаков', isFavorite: true, coverUrl: cover1 },
    { id: 2, title: 'Тёмная башня', author: 'Стивен Кинг', isFavorite: false, coverUrl: cover2 },
    { id: 3, title: 'Идиот', author: 'Ф. М. Достоевский', isFavorite: true, coverUrl: cover3 },
    { id: 4, title: 'Мотылёк', author: 'Анри Шарьер', isFavorite: false, coverUrl: cover4 },
    { id: 5, title: 'Над пропастью во ржи', author: 'Дж. Сэлинджер', isFavorite: false, coverUrl: cover5 },
    { id: 6, title: 'Дети мои', author: 'Гузель Яхина', isFavorite: true, coverUrl: cover6 },
];

const BookCard = ({ book }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLinkHovered, setIsLinkHovered] = useState(false);

    return (
        <div 
            style={{...cardStyle, transform: isHovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: isHovered ? '0 10px 20px rgba(0, 0, 0, 0.15)' : '0 5px 15px rgba(0, 0, 0, 0.08)'}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            
            <div style={imageWrapperStyle}> 
                <img src={book.coverUrl} alt={`Обложка книги ${book.title}`} style={bookCoverStyle} />
            </div>
            
            <h3 style={titleStyle}>{book.title}</h3>
            <p style={authorStyle}>{book.author}</p>
            
            <Link 
                to={`/books/${book.id}`} 
                style={{...linkStyle, color: isLinkHovered ? hoverColor : primaryColor}}
                onMouseEnter={() => setIsLinkHovered(true)}
                onMouseLeave={() => setIsLinkHovered(false)}
            >
                Подробнее &rarr;
            </Link>

            <button style={favoriteButtonStyle}>
                {book.isFavorite ? '❤️' : '🤍'}
            </button>
        </div>
    );
};

export default function Catalog({ isFavorites = false }) {
    const title = isFavorites ? '❤️ Избранные книги' : '📚 Каталог книг';
    const books = isFavorites ? DUMMY_BOOKS.filter(b => b.isFavorite) : DUMMY_BOOKS;

    return (
        <div style={catalogContainerStyle}>
            <h1>{title}</h1>
            <div style={bookGridStyle}>
                {books.map(book => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
        </div>
    );
}

// --- Обновленные Стили ---

const catalogContainerStyle = { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px 0' 
};

const bookGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '30px',
    marginTop: '30px',
};

const cardStyle = {
    backgroundColor: cardBackground, 
    borderRadius: '10px',
    padding: '15px',
    transition: 'all 0.3s ease-in-out', // Добавлено для плавности
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    border: '1px solid #ddd', 
};

const imageWrapperStyle = {
    height: '180px', 
    borderRadius: '8px', 
    marginBottom: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
};

const bookCoverStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover', 
    borderRadius: '8px',
};

const titleStyle = {
    fontSize: '1.25em', // Чуть крупнее
    fontWeight: '700', 
    color: textColor,
    margin: '10px 0 5px 0',
};

const authorStyle = {
    fontSize: '0.95em',
    color: '#666', 
    margin: '0 0 10px 0',
    fontStyle: 'italic', // Италийский шрифт для автора
};

const linkStyle = {
    textDecoration: 'none',
    color: primaryColor, 
    fontWeight: 'bold',
    marginTop: 'auto',
    display: 'block',
    paddingTop: '10px',
    borderTop: '1px solid #ddd', 
    fontSize: '0.95em',
    transition: 'color 0.2s', // Плавное изменение цвета
    textTransform: 'uppercase' // Заглавные буквы
};

const favoriteButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'absolute',
    top: '15px',
    right: '15px',
    fontSize: '1.5em',
    color: 'red',
    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
};