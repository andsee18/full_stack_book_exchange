import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import cover1 from '../assets/master_i_margarita.jpg'; 

// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 
const textColor = '#3c3838';      
const lightBackground = '#fdfcf7';
const hoverColor = '#948a65'; 
const successColor = '#98c19d';      
const successHoverColor = '#80a384'; 
const errorColor = '#e8a8a8';        
const errorHoverColor = '#cc8c8c';   

// Заглушечные данные пользователя
const DUMMY_USER = {
    name: 'Андрей К.',
    email: 'user@example.com',
    location: 'Москва',
    rating: 4.8
};

// Заглушечные данные для вкладки "Обмены"
const DUMMY_EXCHANGES = [
    {
        id: 1,
        status: 'Ожидание подтверждения',
        bookOffered: { title: 'Назад к тебе', author: 'Сара Джио', coverUrl: null, id: 10 },
        bookRequested: { title: 'Мастер и Маргарита', author: 'М. А. Булгаков', coverUrl: cover1, id: 1 },
        isIncoming: true,
    },
    {
        id: 2,
        status: 'Обмен завершён',
        bookOffered: { title: 'Назад к тебе', author: 'Сара Джио', coverUrl: null, id: 10 },
        bookRequested: { title: 'Мастер и Маргарита', author: 'М. А. Булгаков', coverUrl: cover1, id: 1 },
        isIncoming: false,
    },
];

// --- Вспомогательные компоненты для ОБМЕНОВ ---

const ExchangeBookItem = ({ book }) => (
    <div style={exchangeBookItemStyle}>
        <div style={bookCoverPlaceholderStyle}>
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

const ExchangeItem = ({ exchange }) => {
    const isActionRequired = exchange.isIncoming && (exchange.status === 'Ожидание подтверждения' || exchange.status === 'Новое предложение');

    const [isConfirmHovered, setIsConfirmHovered] = useState(false);
    const [isRejectHovered, setIsRejectHovered] = useState(false);

    return (
        <div style={exchangeItemContainerStyle}>
            
            <ExchangeBookItem book={exchange.bookOffered} />
            
            <div style={separatorStyle}>
                <span style={exchangeIconStyle}>⟲</span>
            </div>
            
            <ExchangeBookItem book={exchange.bookRequested} />
            
            <div style={statusBadgeStyle(exchange.status)}>
                {exchange.status}
            </div>

            {isActionRequired && (
                <div style={actionButtonsContainerStyle}>
                    <button 
                        style={{...confirmButtonStyle, backgroundColor: isConfirmHovered ? successHoverColor : successColor}}
                        onMouseEnter={() => setIsConfirmHovered(true)}
                        onMouseLeave={() => setIsConfirmHovered(false)}
                    >
                        Подтвердить обмен
                    </button>
                    <button 
                        style={{...rejectButtonStyle, backgroundColor: isRejectHovered ? errorHoverColor : errorColor}}
                        onMouseEnter={() => setIsRejectHovered(true)}
                        onMouseLeave={() => setIsRejectHovered(false)}
                    >
                        Отказать в обмене
                    </button>
                </div>
            )}
            
            <span style={closeButtonStyle}>x</span>
        </div>
    );
};
// --- КОНЕЦ ВСПОМОГАТЕЛЬНЫХ КОМПОНЕНТОВ ОБМЕНОВ ---


// --- Компоненты содержимого вкладок ---

const MyBooks = () => <div style={contentStyle}>
    <h2>Мои книги для обмена (2 шт.)</h2>
    <p>Здесь будет список книг, которые вы предложили для обмена.</p>
    <button style={addButton}>+ Добавить новую книгу</button>
</div>;

const Exchanges = () => <div style={contentStyle}>
    <h2>Активные обмены и бронирования</h2>
    <p style={{marginBottom: '20px'}}>Список ваших запросов на обмен и входящих предложений.</p>
    
    <div style={listContainerStyle}>
        {DUMMY_EXCHANGES.map(exchange => (
            <ExchangeItem key={exchange.id} exchange={exchange} />
        ))}
    </div>
</div>;

const Favorites = () => <div style={contentStyle}>
    <h2>Избранное</h2>
    <p>Список книг, которые вы добавили в избранное.</p>
    <p>3 книги в избранном.</p>
</div>;

// --- Вспомогательный компонент для кнопки Настроек с эффектом hover (НОВЫЙ) ---
const SettingsButton = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link 
            to="/settings" 
            style={{
                ...settingsButton,
                backgroundColor: isHovered ? primaryColor : 'white',
                color: isHovered ? 'white' : primaryColor,
                transform: isHovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: isHovered ? `0 3px 8px ${primaryColor}60` : '0 1px 4px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            ⚙️ Настройки
        </Link>
    );
};


// --- Главный компонент Профиля ---

export default function Profile() {
    const [activeTab, setActiveTab] = useState('books');

    const renderContent = () => {
        switch (activeTab) {
            case 'exchanges':
                return <Exchanges />;
            case 'favorites':
                return <Favorites />;
            case 'books':
            default:
                return <MyBooks />;
        }
    };

    return (
        <div style={profileContainerStyle}>
            
            <div style={headerStyle}>
                
                <div style={userInfoStyle}>
                    <div style={avatarStyle}>АК</div> 
                    <div>
                        <h1 style={{color: primaryColor, margin: '0 0 5px 0'}}>{DUMMY_USER.name}</h1>
                        <p>Рейтинг: <span style={{color: '#ffc107', fontWeight: 'bold'}}>⭐⭐⭐⭐</span> {DUMMY_USER.rating}</p>
                        <p style={{fontSize: '0.9em', color: '#666'}}>E-mail: {DUMMY_USER.email}</p>
                    </div>
                </div>

                <SettingsButton /> {/* Использование нового компонента */}
            </div>

            <div style={tabsContainerStyle}>
                <TabButton 
                    title="Мои книги" 
                    tabKey="books" 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                />
                <TabButton 
                    title="Обмены" 
                    tabKey="exchanges" 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                />
                <TabButton 
                    title="Избранное" 
                    tabKey="favorites" 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                />
            </div>
            
            <div style={tabContentStyle}>
                {renderContent()}
            </div>
            
        </div>
    );
}

// --- Вспомогательный компонент для кнопки вкладки ---
const TabButton = ({ title, tabKey, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(tabKey)} 
        style={tabKey === activeTab ? activeTabStyle : inactiveTabStyle}
    >
        {title}
    </button>
);


// --- СТИЛИ ПРОФИЛЯ ---

const profileContainerStyle = { 
    maxWidth: '1000px', 
    margin: '0 auto',
    backgroundColor: lightBackground,
    padding: '30px',
    borderRadius: '15px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid ' + darkBeigeColor,
    paddingBottom: '20px'
};

const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
};

const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: primaryColor,
    color: 'white',
    fontSize: '2em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    border: '3px solid ' + darkBeigeColor,
    boxShadow: '0 0 0 5px rgba(168, 157, 112, 0.2)', 
};


const settingsButton = { // Обновленный базовый стиль
    backgroundColor: 'white',
    color: primaryColor,
    border: '1px solid ' + primaryColor,
    padding: '8px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease-out',
    textDecoration: 'none',
    fontSize: '0.95em'
};

const tabsContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px'
};

const activeTabStyle = {
    padding: '10px 20px',
    backgroundColor: darkBeigeColor,
    color: primaryColor,
    border: 'none',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottom: '3px solid ' + primaryColor, 
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.05em',
    transition: 'all 0.3s'
};

const inactiveTabStyle = {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: textColor,
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.05em',
    transition: 'all 0.3s'
};

const tabContentStyle = {
    padding: '30px',
    backgroundColor: darkBeigeColor, 
    borderRadius: '10px',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)',
};

const contentStyle = {
    minHeight: '200px'
};

const addButton = {
    backgroundColor: primaryColor,
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '12px 25px',
    cursor: 'pointer',
    marginTop: '15px',
    fontWeight: 'bold',
    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
};

// --- СТИЛИ ОБМЕНОВ ---

const listContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', 
    marginTop: '15px',
};

const exchangeItemContainerStyle = {
    backgroundColor: lightBackground, 
    borderRadius: '10px',
    padding: '15px 20px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    border: '1px solid #e0e0e0'
};

const exchangeBookItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '5px 0',
};

const bookCoverPlaceholderStyle = {
    width: '35px', 
    height: '55px',
    minWidth: '35px',
    backgroundColor: '#eee',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const bookCoverStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
}

const bookTitleStyle = {
    fontSize: '1.0em',
    fontWeight: 'bold',
    color: textColor,
    textDecoration: 'none',
    display: 'block',
};

const bookAuthorStyle = {
    fontSize: '0.75em',
    color: '#666',
    margin: '0',
};

const favoriteIconStyle = {
    fontSize: '1.3em',
    color: 'black',
    marginLeft: '10px',
};

const separatorStyle = {
    display: 'flex',
    justifyContent: 'center',
    margin: '3px 0',
};

const exchangeIconStyle = {
    fontSize: '1.5em',
    color: primaryColor,
    transform: 'rotate(90deg)',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
};

// Стили бейджа статуса
const statusBadgeStyle = (status) => {
    let backgroundColor = '#ccc';
    let color = textColor;
    let shadow = 'none';

    if (status === 'Ожидание подтверждения' || status === 'Новое предложение') {
        backgroundColor = '#fce29e'; 
        shadow = '0 2px 5px rgba(252, 226, 158, 0.5)';
    } else if (status === 'Обмен завершён') {
        backgroundColor = successColor; 
        color = 'white'; 
    }

    return {
        backgroundColor: backgroundColor,
        color: color,
        textAlign: 'center',
        borderRadius: '20px',
        padding: '6px 18px', 
        fontSize: '0.85em',
        fontWeight: 'bold',
        marginTop: '15px',
        display: 'block',
        width: 'fit-content',
        margin: '15px auto 0 auto',
        boxShadow: shadow,
        transition: 'all 0.3s',
    };
};

const actionButtonsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '10px',
    marginTop: '15px',
};

const confirmButtonStyle = {
    backgroundColor: successColor, 
    color: textColor,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
    fontSize: '0.9em',
    transition: 'background-color 0.2s',
};

const rejectButtonStyle = {
    backgroundColor: errorColor, 
    color: textColor,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
    fontSize: '0.9em',
    transition: 'background-color 0.2s',
};

const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '1.2em',
    color: '#666',
    cursor: 'pointer',
};