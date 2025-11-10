import React, { useState } from 'react'; 
import { useParams, Link } from 'react-router-dom';

// ИМПОРТ ОБЛОЖКИ 
import cover1 from '../assets/master_i_margarita.jpg'; 

// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';     
const hoverColor = '#948a65';       
const darkBeigeColor = '#eae7dd'; 
const textColor = '#3c3838';      
const lightBackground = '#fdfcf7';

// Заглушечные данные книги
const DUMMY_BOOK = { 
    id: 1, 
    title: 'Мастер и Маргарита', 
    author: 'М. А. Булгаков', 
    genre: 'Фантастика, Сатира', 
    description: 'Роман о любви, предательстве и вечном поиске истины, где фантастические элементы переплетаются с московским бытом 1930-х годов. Книга в отличном состоянии, почти не читалась.',
    ownerName: 'Андрей К.',
    ownerLocation: 'Москва',
    ownerRating: 4.8,
    ownerLink: '/users/1',
    available: true,
    isFavorite: false, 
    coverUrl: cover1,
};

export default function BookDetail() {
    // eslint-disable-next-line
    const { id } = useParams(); 
    const [book, setBook] = useState(DUMMY_BOOK); 
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isOwnerHovered, setIsOwnerHovered] = useState(false);
    const [isBackHovered, setIsBackHovered] = useState(false);
    
    const toggleFavorite = () => {
        setBook(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    };

    return (
        <div style={containerStyle}>
            
            {/* Кнопка "Назад" - теперь имеет отступ 0 слева */}
            <Link 
                to="/" 
                style={{
                    ...backLinkStyle,
                    color: isBackHovered ? hoverColor : primaryColor,
                    transform: isBackHovered ? 'translateX(-3px) scale(1.02)' : 'translateX(0) scale(1)', 
                    boxShadow: isBackHovered ? '0 2px 5px rgba(0, 0, 0, 0.1)' : 'none',
                    backgroundColor: isBackHovered ? darkBeigeColor : 'transparent',
                }}
                onMouseEnter={() => setIsBackHovered(true)}
                onMouseLeave={() => setIsBackHovered(false)}
            >
                &larr; Назад к каталогу
            </Link>
            
            <div style={mainContentWrapperStyle}>
                
                <div style={titleHeaderStyle}>
                    <h1 style={titleStyle}>{book.title}</h1>
                    
                    <button 
                        onClick={toggleFavorite}
                        style={favoriteButtonStyle}
                    >
                        <span style={{ 
                            color: book.isFavorite ? 'red' : '#ccc', 
                            fontSize: '2em' 
                        }}>
                            {book.isFavorite ? '❤️' : '🤍'}
                        </span>
                    </button>
                </div>
                
                <div style={contentGridStyle}>
                    
                    {/* Левая колонка */}
                    <div style={detailColumnStyle}>
                        
                        <img 
                            src={book.coverUrl} 
                            alt={`Обложка книги ${book.title}`} 
                            style={largeBookCoverStyle} 
                        />
                        
                        <h2>📚 О книге</h2>
                        <p style={descriptionStyle}>{book.description}</p>
                        
                        <div style={infoGridStyle}>
                            <InfoItem label="Автор:" value={book.author} action={
                                <button style={favoriteAuthorStyle}>+ Любимый автор</button>
                            } />
                            <InfoItem label="Жанр:" value={book.genre} />
                            <InfoItem label="Состояние:" value="Отличное" />
                        </div>
                    </div>

                    {/* Правая колонка: Профиль владельца и Кнопка обмена */}
                    <div style={sidebarStyle}>
                        
                        <h2 style={{ color: primaryColor }}>👤 Владелец</h2>
                        
                        {/* Карточка владельца с эффектом наведения */}
                        <div 
                            style={{...ownerCardStyle, backgroundColor: isOwnerHovered ? '#fffdf5' : lightBackground}}
                            onMouseEnter={() => setIsOwnerHovered(true)}
                            onMouseLeave={() => setIsOwnerHovered(false)}
                        >
                            <div style={avatarStyle}>AК</div>
                            
                            <div style={{ flexGrow: 1 }}>
                                <Link to={book.ownerLink} style={ownerNameStyle}>{book.ownerLink}</Link>
                                <p style={{ margin: '3px 0' }}>{book.ownerLocation}</p>
                                <p style={ratingStyle}>Рейтинг: ⭐ {book.ownerRating}</p>
                            </div>
                        </div>
                        
                        {/* Кнопка "Предложить обмен" с эффектом наведения */}
                        <button 
                            style={{
                                ...(book.available ? actionButtonStyle : disabledButtonStyle),
                                backgroundColor: book.available && isButtonHovered ? hoverColor : (book.available ? primaryColor : '#ccc')
                            }}
                            onMouseEnter={() => setIsButtonHovered(true)}
                            onMouseLeave={() => setIsButtonHovered(false)}
                            disabled={!book.available}
                        >
                            {book.available ? '🤝 Предложить обмен' : '❌ Книга в обмене'}
                        </button>
                        
                        <p style={{ fontSize: '0.9em', color: '#777', marginTop: '15px', textAlign: 'center' }}>
                            *Обмен осуществляется по взаимному согласию сторон.
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Вспомогательный компонент для блока информации
const InfoItem = ({ label, value, action }) => (
    <div style={infoItemStyle}>
        <p style={labelStyle}>{label}</p>
        <p style={valueStyle}>{value}</p>
        {action}
    </div>
);


// --- Стили ---

// КОНТЕЙНЕР: УБЕРЕМ ВЕСЬ ГОРИЗОНТАЛЬНЫЙ PADDING, ЧТОБЫ КНОПКА МОГЛА ПРИЖАТЬСЯ К КРАЮ
const containerStyle = { 
    maxWidth: '1000px', 
    margin: '0 auto',
    paddingTop: '20px' // Оставим только верхний отступ
};

// ОБЕРТКА для ОСНОВНОГО КОНТЕНТА: Добавим padding сюда
const mainContentWrapperStyle = {
    padding: '0 10px', // Небольшой отступ слева и справа для основного содержимого
};


// Обновленный стиль кнопки "Назад": padding-left убираем, padding-right оставляем
const backLinkStyle = { 
    display: 'inline-block', 
    marginBottom: '20px', 
    color: primaryColor, 
    textDecoration: 'none', 
    transition: 'all 0.3s ease-out',
    padding: '8px 12px 8px 0', // Убрали левый padding
    borderRadius: '8px',
    fontWeight: 'bold', 
    fontSize: '1.05em',
    marginLeft: '10px' // Минимальный отступ от края
};

const titleHeaderStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: '30px', 
    borderBottom: '1px solid ' + primaryColor,
    paddingBottom: '10px' 
};

// ... (Остальные стили остаются без изменений)
const titleStyle = { margin: '0', fontSize: '2em' }; 
const favoriteButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 10px'
};

const favoriteAuthorStyle = {
    backgroundColor: 'white',
    color: primaryColor,
    border: '1px solid ' + primaryColor,
    borderRadius: '20px',
    padding: '5px 12px',
    marginTop: '10px',
    cursor: 'pointer',
    fontSize: '0.8em',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
};

const largeBookCoverStyle = {
    width: '250px', 
    height: 'auto',
    borderRadius: '10px',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)', 
    marginBottom: '30px',
    display: 'block', 
    margin: '0 0 30px 0',
};

const contentGridStyle = { 
    display: 'grid', 
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
};

const detailColumnStyle = { padding: '0 10px' };
const descriptionStyle = { lineHeight: '1.7', fontSize: '1.05em', marginBottom: '40px' }; 

const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '10px',
    padding: '20px 0',
    borderTop: '1px dashed #ccc', 
    borderBottom: '1px dashed #ccc',
};

const infoItemStyle = {
    padding: '5px',
    backgroundColor: lightBackground,
    borderRadius: '5px'
};

const labelStyle = { margin: '0', fontSize: '0.85em', color: primaryColor, fontWeight: '700' };
const valueStyle = { margin: '5px 0 0 0', fontSize: '1.1em', fontWeight: 'bold' };

/* --- Стили для Sidebar --- */
const sidebarStyle = {
    padding: '30px', 
    backgroundColor: darkBeigeColor, 
    borderRadius: '15px', 
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
};

const ownerCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: lightBackground,
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.2s, box-shadow 0.2s', 
};

const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: primaryColor,
    color: 'white',
    fontSize: '1.2em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    boxShadow: '0 0 0 3px ' + primaryColor + '40',
};

const ownerNameStyle = { 
    fontSize: '1.1em', 
    fontWeight: '700', 
    color: textColor,
    textDecoration: 'none' ,
};

const ratingStyle = { 
    color: '#f9a825',
    fontSize: '0.9em',
    margin: '0'
};

const actionButtonStyle = {
    backgroundColor: primaryColor, 
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '15px 25px',
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    width: '100%',
    boxShadow: '0 5px 10px ' + primaryColor + '60', 
    transition: 'all 0.3s',
};

const disabledButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#ccc',
    boxShadow: 'none',
    cursor: 'not-allowed'
};