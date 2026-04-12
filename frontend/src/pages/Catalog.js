import React, { useEffect, useState, useCallback } from 'react'; // добавлено useEffect
import { Link, useSearchParams } from 'react-router-dom';
import { getAllBooks } from '../api/bookApi';
import { useAuth } from '../context/AuthContext';
import { getUserIdFromJwt } from '../utils/jwt';
import {
    isFavoriteBook,
    toggleFavoriteBook,
} from '../utils/favoritesStorage';
import { Helmet } from 'react-helmet-async';

const primaryColor = '#a89d70';       // основной цвет
const hoverColor = '#948a65';         // цвет при наведении
const cardBackground = '#eae7dd';     // фон карточки
const textColor = '#3c3838';          // цвет текста

const GENRE_OPTIONS = ['Фантастика', 'Классика', 'Детектив', 'Роман', 'Фэнтези', 'Приключения', 'Другое'];
const CONDITION_OPTIONS = ['Новое', 'Очень хорошее', 'Хорошее', 'Удовлетворительное', 'Плохое'];

const BookCard = ({ book, isLoggedIn, currentUserId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLinkHovered, setIsLinkHovered] = useState(false);

    const isFav = isLoggedIn ? isFavoriteBook(currentUserId, book?.id) : false;

    const handleToggleFavorite = () => {
        if (!isLoggedIn) return;
        toggleFavoriteBook(currentUserId, book?.id);
        // переключение избранного
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
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : null}
            </div>

            <h3 style={titleStyle}>{book.title}</h3>
            <p style={authorStyle}>{book.author}</p>
            <p style={statusStyle}>статус: <strong>{book.status === 'available' ? 'доступна' : (book.status === 'exchanged' ? 'совершена' : 'в обмене')}</strong></p>

            <Link
                to={`/books/${book.id}`}
                style={{...linkStyle, color: isLinkHovered ? hoverColor : primaryColor}}
                onMouseEnter={() => setIsLinkHovered(true)}
                onMouseLeave={() => setIsLinkHovered(false)}
            >
                подробнее &rarr;
            </Link>

            {/* кнопка избранного только для авторизованных */}
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
    const { isLoggedIn } = useAuth();
    const currentUserId = getUserIdFromJwt();

    const [searchParams, setSearchParams] = useSearchParams();

    // параметры фильтрации из url
    const query = searchParams.get('query') || '';
    const genre = searchParams.get('genre') || '';
    const condition = searchParams.get('condition') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const [pageSize] = useState(6);

    const [titleQuery, setTitleQuery] = useState(query);
    const [conditionFilter, setConditionFilter] = useState(condition);
    const [genreFilter, setGenreFilter] = useState(genre);
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTitleQuery(query);
        setGenreFilter(genre);
        setConditionFilter(condition);
    }, [query, genre, condition]);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllBooks({
                query: titleQuery || undefined,
                genre: genreFilter || undefined,
                condition: conditionFilter || undefined,
                page: page,
                size: pageSize
            });
            // странице избранного фильтруем локально
            if (isFavorites && isLoggedIn) {
                const favBooks = data.books.filter(b => isFavoriteBook(currentUserId, b.id));
                setBooks(favBooks);
                setTotalPages(1);
            } else {
                setBooks(data.books || []);
                setTotalPages(data.totalPages || 0);
            }
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [titleQuery, genreFilter, conditionFilter, page, pageSize, isFavorites, isLoggedIn, currentUserId]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const getNewParams = (updates) => {
        const params = {};
        if (titleQuery) params.query = titleQuery;
        if (genreFilter) params.genre = genreFilter;
        if (conditionFilter) params.condition = conditionFilter;
        if (page > 0) params.page = page;

        return { ...params, ...updates };
    };

    const handleSearchChange = (val) => {
        setSearchParams(getNewParams({ query: val, page: 0 }));
    };

    const handleGenreChange = (val) => {
        setSearchParams(getNewParams({ genre: val, page: 0 }));
    };

    const handleConditionChange = (val) => {
        setSearchParams(getNewParams({ condition: val, page: 0 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setSearchParams(getNewParams({ page: newPage }));
            window.scrollTo(0, 0);
        }
    };

    if (loading && books.length === 0) {
        return <div style={{...catalogContainerStyle, textAlign: 'center', padding: '50px 0 20px 0'}}>загрузка каталога...</div>;
    }

    if (error) {
        return <div style={{...catalogContainerStyle, textAlign: 'center', padding: '50px 0 20px 0', color: 'red'}}>ошибка: {error}</div>;
    }

    return (
        <div style={catalogContainerStyle}>
            <Helmet>
                <title>{isFavorites ? 'Избранное' : 'Каталог книг - BookExchange'}</title>
                <meta name="description" content={isFavorites ? 'Ваши избранные книги' : 'Обменивайтесь книгами с другими пользователями. Находите интересные издания в нашем каталоге.'} />
                <link rel="canonical" href={window.location.href} />
                <meta property="og:title" content={isFavorites ? 'Избранное' : 'Каталог книг'} />
                <meta property="og:description" content="Лучший сервис для обмена книгами." />
                <meta property="og:type" content="website" />
            </Helmet>
            <h1 style={catalogTitleStyle}>{isFavorites ? 'Избранное' : 'Каталог книг'}</h1>

           {(!isFavorites || isLoggedIn) ? (
               <div style={filtersBarStyle}>
                   <input
                       value={titleQuery}
                       onChange={(e) => handleSearchChange(e.target.value)}
                       placeholder="поиск по названию или автору"
                       style={filterInputStyle}
                   />

                   <select
                       value={genreFilter}
                       onChange={(e) => handleGenreChange(e.target.value)}
                       style={filterSelectStyle}
                   >
                       <option value="">все жанры</option>
                       {GENRE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>

                   <select
                       value={conditionFilter}
                       onChange={(e) => handleConditionChange(e.target.value)}
                       style={filterSelectStyle}
                   >
                       <option value="">любое состояние</option>
                       {CONDITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
               </div>
           ) : null}

            {books.length > 0 ? (
                <>
                    <div style={booksGridStyle}>
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                isLoggedIn={isLoggedIn}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>

                    {/* Пагинация */}
                    {!isFavorites && totalPages > 1 && (
                        <div style={paginationContainerStyle}>
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                style={pageButtonStyle}
                            >
                                Назад
                            </button>
                            <span style={pageInfoStyle}>
                                Страница {page + 1} из {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages - 1}
                                style={pageButtonStyle}
                            >
                                Вперед
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={emptyStateStyle}>
                    {isFavorites ? 'в избранном пока пусто' : 'книг не найдено'}
                </div>
            )}
        </div>
    );
};

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

const booksGridStyle = {
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
    padding: '10px',
    borderRadius: '10px',
    border: `1px solid ${primaryColor}`,
    outline: 'none',
    backgroundColor: '#fff',
    color: textColor,
    flex: '1',
    minWidth: '150px'
};

const paginationContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40px',
    gap: '20px'
};

const pageButtonStyle = {
    padding: '8px 16px',
    backgroundColor: cardBackground,
    border: `1px solid ${primaryColor}`,
    borderRadius: '8px',
    cursor: 'pointer',
    color: textColor
};

const pageInfoStyle = {
    color: textColor,
    fontWeight: '500'
};

const emptyStateStyle = {
    textAlign: 'center',
    padding: '100px 0',
    fontSize: '18px',
    color: '#777'
};

