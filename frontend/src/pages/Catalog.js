import React, { useEffect, useMemo, useState } from 'react'; // добавлено useEffect
import { Link } from 'react-router-dom';
import { getAllBooks } from '../api/bookApi';
import { useAuth } from '../context/AuthContext';
import { getUserIdFromJwt } from '../utils/jwt';
import {
    isFavoriteBook,
    subscribeFavoritesChanged,
    toggleFavoriteBook,
} from '../utils/favoritesStorage';




const primaryColor = '#a89d70';       // основной бежевый акцент
const hoverColor = '#948a65';         // бежевый акцент для наведения
const cardBackground = '#eae7dd';     // фон карточек
const textColor = '#3c3838';          // основной текст

const BookCard = ({ book, isLoggedIn, currentUserId, favoritesTick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLinkHovered, setIsLinkHovered] = useState(false);

    const isFav = isLoggedIn ? isFavoriteBook(currentUserId, book?.id) : false;

    const handleToggleFavorite = () => {
        if (!isLoggedIn) return;
        toggleFavoriteBook(currentUserId, book?.id);
        // комментарий важный ключевой
    };

    return (
        <div 
            style={{...cardStyle, transform: isHovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: isHovered ? '0 10px 20px rgba(0, 0, 0, 0.15)' : '0 5px 15px rgba(0, 0, 0, 0.08)'}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            
            <div style={imageWrapperStyle}>
                <div style={bookCoverPlaceholderStyle} aria-hidden="true">нет обложки</div>
                {book.coverUrl ? (
                    <img
                        src={book.coverUrl}
                        alt={`Обложка ${book.title}`}
                        style={bookCoverImageStyle}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : null}
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

            {/* Избранное показываем только если пользователь вошёл */}
            {isLoggedIn ? (
                <button
                    type="button"
                    style={favoriteButtonStyle}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFavorite();
                    }}
                    aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                    title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                >
                    <span
                        style={{
                            ...favoriteIconStyle,
                            color: isFav ? 'red' : primaryColor,
                        }}
                    >
                        {isFav ? '♥' : '♡'}
                    </span>
                </button>
            ) : null}
        </div>
    );
};

// основной компонент каталога
export default function Catalog({ isFavorites = false }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const token = user?.token || window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
    const currentUserId = getUserIdFromJwt(token);
    const isLoggedIn = currentUserId != null;
    const [favoritesTick, setFavoritesTick] = useState(0);

    const [titleQuery, setTitleQuery] = useState('');
    const [authorQuery, setAuthorQuery] = useState('');
    const [conditionFilter, setConditionFilter] = useState('');
    const [sortMode, setSortMode] = useState('default');

    // функция загрузки для
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

    // загрузка данных при
    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        return subscribeFavoritesChanged(() => {
            setFavoritesTick((x) => x + 1);
        });
    }, []);

    const baseBooks = useMemo(() => {
        if (!Array.isArray(books)) return [];
        if (!isFavorites) return books;
        if (!isLoggedIn) return [];
        return books.filter((b) => isFavoriteBook(currentUserId, b?.id));
        // комментарий важный ключевой
    }, [books, isFavorites, isLoggedIn, currentUserId, favoritesTick]);

    const filteredBooks = useMemo(() => {
        const norm = (v) => String(v || '').trim().toLowerCase();
        const qTitle = norm(titleQuery);
        const qAuthor = norm(authorQuery);
        const qCondition = String(conditionFilter || '').trim();

        let out = baseBooks;

        if (qTitle) {
            out = out.filter((b) => norm(b?.title).includes(qTitle));
        }
        if (qAuthor) {
            out = out.filter((b) => norm(b?.author).includes(qAuthor));
        }
        if (qCondition) {
            out = out.filter((b) => String(b?.condition || '').trim() === qCondition);
        }

        if (sortMode === 'title-asc') {
            out = [...out].sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || ''), 'ru', { sensitivity: 'base' }));
        } else if (sortMode === 'title-desc') {
            out = [...out].sort((a, b) => String(b?.title || '').localeCompare(String(a?.title || ''), 'ru', { sensitivity: 'base' }));
        }

        return out;
    }, [baseBooks, titleQuery, authorQuery, conditionFilter, sortMode]);

    const conditionOptions = useMemo(
        () => ['Новое', 'Очень хорошее', 'Хорошее', 'Удовлетворительное', 'Плохое'],
        []
    );


    if (loading) {
        return <div style={{...catalogContainerStyle, textAlign: 'center', padding: '50px 0 20px 0'}}>загрузка каталога...</div>;
    }

    if (error) {
        return <div style={{...catalogContainerStyle, textAlign: 'center', padding: '50px 0 20px 0', color: 'red'}}>ошибка: {error}</div>;
    }

     return (
         <div style={catalogContainerStyle}>
             <h1 style={catalogTitleStyle}>Каталог книг</h1>

            {(!isFavorites || isLoggedIn) ? (
                <div style={filtersBarStyle}>
                    <input
                        value={titleQuery}
                        onChange={(e) => setTitleQuery(e.target.value)}
                        placeholder="поиск по названию"
                        style={filterInputStyle}
                    />
                    <input
                        value={authorQuery}
                        onChange={(e) => setAuthorQuery(e.target.value)}
                        placeholder="поиск по автору"
                        style={filterInputStyle}
                    />
                    <select
                        value={conditionFilter}
                        onChange={(e) => setConditionFilter(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="">все состояния</option>
                        {conditionOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="default">сортировка: по умолчанию</option>
                        <option value="title-asc">по названию: а-я</option>
                        <option value="title-desc">по названию: я-а</option>
                    </select>
                </div>
            ) : null}
            
            {isFavorites && !isLoggedIn ? (
                <p style={{ fontSize: '1.1em', color: '#666' }}>
                    войдите в аккаунт, чтобы видеть избранное.
                </p>
            ) : filteredBooks.length === 0 ? (
                <p style={{fontSize: '1.2em', color: '#666'}}>
                    пока нет книг для обмена. <Link to="/add-book" style={{color: primaryColor}}>добавьте первую!</Link>
                </p>
            ) : (
                <div style={bookGridStyle}>
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            isLoggedIn={isLoggedIn}
                            currentUserId={currentUserId}
                            favoritesTick={favoritesTick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// стили изменений без

const statusStyle = {
    fontSize: '0.9em',
    color: '#666',
    margin: '0 0 10px 0',
}

const bookCoverPlaceholderStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: cardBackground,
    backgroundImage: 'linear-gradient(135deg, rgba(168, 157, 112, 0.22) 0%, rgba(168, 157, 112, 0.06) 60%, rgba(168, 157, 112, 0.00) 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#666',
    fontSize: '1.05em',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    userSelect: 'none',
};

const bookCoverImageStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
};

const catalogContainerStyle = { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px 0' 
};

const catalogTitleStyle = {
    margin: '10px 0 20px 0',
    textAlign: 'center',
    color: textColor,
    fontWeight: 800,
    letterSpacing: '0.5px',
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
        position: 'relative',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
};


const titleStyle = {
    fontSize: '1.25em', 
    fontWeight: '700', 
    color: textColor,
       margin: '10px 0 5px 0',
       lineHeight: '1.2em',
       maxHeight: '2.4em', // 2 строки
       overflow: 'hidden',
       display: '-webkit-box',
       WebkitLineClamp: 2,
       WebkitBoxOrient: 'vertical',
};

const authorStyle = {
    fontSize: '0.95em',
    color: '#666', 
    margin: '0 0 10px 0',
    fontStyle: 'italic', 
       lineHeight: '1.2em',
       maxHeight: '1.2em', // 1 строка
       overflow: 'hidden',
       whiteSpace: 'nowrap',
       textOverflow: 'ellipsis',
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
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '34px',
    height: '34px',
    borderRadius: '9999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(168, 157, 112, 0.55)',
    backgroundColor: 'rgba(253, 252, 247, 0.92)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.10)',
    padding: 0,
    zIndex: 3,
};

const favoriteIconStyle = {
    fontSize: '20px',
    lineHeight: 1,
    color: primaryColor,
    transform: 'translateY(-1px)',
};

const filtersBarStyle = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 0 18px 0',
};

const filterInputStyle = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.15)',
    backgroundColor: 'white',
    minWidth: 220,
    outline: 'none',
};

const filterSelectStyle = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.15)',
    backgroundColor: 'white',
    outline: 'none',
};