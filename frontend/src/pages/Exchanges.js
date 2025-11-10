import React from 'react';
import { Link } from 'react-router-dom';

// --- ИМПОРТ ЗАГЛУШЕК ОБЛОЖЕК ---
import cover1 from '../assets/master_i_margarita.jpg'; 

// --- Бежевая палитра для единообразия ---
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 
const textColor = '#3c3838';      
const lightBackground = '#fdfcf7';

// Заглушечные данные для вкладки "Обмены"
const DUMMY_EXCHANGES = [
    {
        id: 1,
        status: 'Ожидание подтверждения',
        bookOffered: { title: 'Назад к тебе', author: 'Сара Джио', coverUrl: null, id: 10 },
        bookRequested: { title: 'Мастер и Маргарита', author: 'М. А. Булгаков', coverUrl: cover1, id: 1 },
        isIncoming: true, // Входящее предложение, требующее действий
    },
    {
        id: 2,
        status: 'Обмен завершён',
        bookOffered: { title: 'Назад к тебе', author: 'Сара Джио', coverUrl: null, id: 10 },
        bookRequested: { title: 'Мастер и Маргарита', author: 'М. А. Булгаков', coverUrl: cover1, id: 1 },
        isIncoming: false, // Исходящий обмен
    },
    {
        id: 3,
        status: 'Новое предложение',
        bookOffered: { title: 'Назад к тебе', author: 'Сара Джио', coverUrl: null, id: 10 },
        bookRequested: { title: 'Мастер и Маргарита', author: 'М. А. Булгаков', coverUrl: cover1, id: 1 },
        isIncoming: true,
    },
];

// --- Вспомогательный компонент для одной книги в паре ---
const ExchangeBookItem = ({ book }) => (
    <div style={bookItemStyle}>
        <div style={bookCoverPlaceholderStyle}>
             {/* Заглушка, если нет обложки */}
            {book.coverUrl ? (
                <img src={book.coverUrl} alt={`Обложка ${book.title}`} style={bookCoverStyle} />
            ) : (
                <span style={{ fontSize: '1.2em' }}>📖</span>
            )}
        </div>
        <div style={{ flexGrow: 1 }}>
            <Link to={`/books/${book.id}`} style={bookTitleStyle}>{book.title}</Link>
            <p style={bookAuthorStyle}>{book.author}</p>
        </div>
        <span style={favoriteIconStyle}>❤</span>
    </div>
);

// --- Основной компонент элемента обмена ---
const ExchangeItem = ({ exchange }) => {
    const isActionRequired = exchange.isIncoming && (exchange.status === 'Новое предложение' || exchange.status === 'Ожидание подтверждения');

    return (
        <div style={itemContainerStyle}>
            
            {/* 1. Верхняя книга (Предложенная) */}
            <ExchangeBookItem book={exchange.bookOffered} />
            
            {/* Разделитель с иконкой обмена */}
            <div style={separatorStyle}>
                <span style={exchangeIconStyle}>⟲</span>
            </div>
            
            {/* 2. Нижняя книга (Запрашиваемая) */}
            <ExchangeBookItem book={exchange.bookRequested} />
            
            {/* 3. Статус */}
            <div style={statusBadgeStyle(exchange.status)}>
                {exchange.status}
            </div>

            {/* 4. Кнопки действий (только для входящих) */}
            {isActionRequired && (
                <div style={actionButtonsContainerStyle}>
                    <button style={confirmButtonStyle}>Подтвердить обмен</button>
                    <button style={rejectButtonStyle}>Отказать в обмене</button>
                </div>
            )}
            
            {/* Кнопка закрытия (пока заглушка) */}
            <span style={closeButtonStyle}>x</span>
        </div>
    );
};

// --- Главный компонент страницы обменов ---
export default function Exchanges() {
    return (
        <div style={pageContainerStyle}>
            
            <Link to="/" style={backLinkStyle}>&larr; Назад</Link>
            
            {/* <h1>🤝 Мои обмены</h1> был удален по вашему запросу */}
            
            <div style={listContainerStyle}>
                {DUMMY_EXCHANGES.map(exchange => (
                    <ExchangeItem key={exchange.id} exchange={exchange} />
                ))}
            </div>
        </div>
    );
}

// --- Стили ---

const pageContainerStyle = { 
    maxWidth: '600px', 
    margin: '0 auto', 
    padding: '20px 0' 
};
const backLinkStyle = { display: 'inline-block', marginBottom: '10px', color: primaryColor, textDecoration: 'none' };

const listContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '30px',
};

// Стили контейнера одного обмена
const itemContainerStyle = {
    backgroundColor: darkBeigeColor, 
    borderRadius: '10px',
    padding: '15px 20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    position: 'relative',
};

// Стили для одной книги внутри обмена
const bookItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '5px 0',
};

const bookCoverPlaceholderStyle = {
    width: '40px',
    height: '60px',
    minWidth: '40px',
    backgroundColor: lightBackground,
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const bookCoverStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
}

const bookTitleStyle = {
    fontSize: '1.1em',
    fontWeight: 'bold',
    color: textColor,
    textDecoration: 'none',
    display: 'block',
};

const bookAuthorStyle = {
    fontSize: '0.8em',
    color: '#666',
    margin: '0',
};

const favoriteIconStyle = {
    fontSize: '1.5em',
    color: 'black', // Черное сердце как в макете
    marginLeft: '10px',
};

// Стили разделителя
const separatorStyle = {
    display: 'flex',
    justifyContent: 'center',
    margin: '5px 0',
};

const exchangeIconStyle = {
    fontSize: '1.8em',
    color: primaryColor,
    transform: 'rotate(90deg)',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
};

// Стили бейджа статуса
const statusBadgeStyle = (status) => {
    let backgroundColor = '#ccc';
    let color = textColor;

    if (status === 'Ожидание подтверждения' || status === 'Новое предложение') {
        backgroundColor = '#fce4a6'; // Желтоватый/бежевый акцент
    } else if (status === 'Обмен завершён') {
        backgroundColor = '#c8d3b0'; // Светло-зеленый
    }

    return {
        backgroundColor: backgroundColor,
        color: color,
        textAlign: 'center',
        borderRadius: '20px',
        padding: '5px 15px',
        fontSize: '0.9em',
        fontWeight: 'bold',
        marginTop: '15px',
        display: 'block',
        width: 'fit-content',
        margin: '15px auto 0 auto',
    };
};

// Стили кнопок действий
const actionButtonsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '10px',
    marginTop: '15px',
};

const confirmButtonStyle = {
    backgroundColor: '#b8e994', // Яркий зеленый
    color: textColor,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
};

const rejectButtonStyle = {
    backgroundColor: '#ff8a8a', // Яркий красный
    color: textColor,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
};

const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '1.2em',
    color: '#666',
    cursor: 'pointer',
};