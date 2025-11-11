import React, { useState, useEffect } from 'react'; // добавлено useEffect
import { Link } from 'react-router-dom';
import { getAllBooks } from '../api/bookApi'; // импорт реальной функции API



// --- ЕДИНАЯ ПАЛИТРА ---
const primaryColor = '#a89d70';       // основной бежевый акцент
const hoverColor = '#948a65';         // бежевый акцент для наведения
const cardBackground = '#eae7dd';     // фон карточек
const textColor = '#3c3838';          // основной текст

// --- КОМПОНЕНТ КАРТОЧКИ ---
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
                {/* пока нет реальных URL обложек, используем заглушку */}
                <div style={bookCoverPlaceholderStyle}>обложка</div> 
            </div>
            
            <h3 style={titleStyle}>{book.title}</h3>
            <p style={authorStyle}>{book.author}</p>
            <p style={statusStyle}>статус: <strong>{book.status}</strong></p>
            
            <Link 
                to={`/books/${book.id}`} 
                style={{...linkStyle, color: isLinkHovered ? hoverColor : primaryColor}}
                onMouseEnter={() => setIsLinkHovered(true)}
                onMouseLeave={() => setIsLinkHovered(false)}
            >
                подробнее &rarr;
            </Link>

            {/* кнопка избранного пока без логики */}
            <button style={favoriteButtonStyle}>
                {false ? '❤️' : '🤍'} 
            </button>
        </div>
    );
};

// --- ОСНОВНОЙ КОМПОНЕНТ КАТАЛОГА ---
export default function Catalog() { // убрал пропс isFavorites для простоты
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // функция для загрузки данных с бэкенда
    const fetchBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(data);
            setError(null);
        } catch (err) {
            setError('не удалось загрузить список книг. проверьте, запущен ли сервер.');
            console.error('error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    // загрузка данных при монтировании
    useEffect(() => {
        fetchBooks();
    }, []);


    if (loading) {
        return <div style={{...catalogContainerStyle, textAlign: 'center', paddingTop: '50px'}}>загрузка каталога...</div>;
    }

    if (error) {
        return <div style={{...catalogContainerStyle, textAlign: 'center', paddingTop: '50px', color: 'red'}}>ошибка: {error}</div>;
    }
    
    const title = '📚 каталог книг';
    
    return (
        <div style={catalogContainerStyle}>
            <h1>{title}</h1>
            
            {books.length === 0 ? (
                <p style={{fontSize: '1.2em', color: '#666'}}>
                    пока нет книг для обмена. <Link to="/add-book" style={{color: primaryColor}}>добавьте первую!</Link>
                </p>
            ) : (
                <div style={bookGridStyle}>
                    {books.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Стили (без изменений) ---

const statusStyle = {
    fontSize: '0.9em',
    color: '#666',
    margin: '0 0 10px 0',
}

const bookCoverPlaceholderStyle = {
    backgroundColor: '#ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#666',
    fontSize: '1.2em',
    fontWeight: 'bold',
};

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
    transition: 'all 0.3s ease-in-out', 
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


const titleStyle = {
    fontSize: '1.25em', 
    fontWeight: '700', 
    color: textColor,
    margin: '10px 0 5px 0',
};

const authorStyle = {
    fontSize: '0.95em',
    color: '#666', 
    margin: '0 0 10px 0',
    fontStyle: 'italic', 
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
    transition: 'color 0.2s', 
    textTransform: 'uppercase' 
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