import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllBooks, getBookById } from '../api/bookApi';
import { getUserById } from '../api/userApi';
import { createExchangeRequest, getOutgoingExchangeRequests } from '../api/exchangeApi';
import { useAuth } from '../context/AuthContext';
import { getUserIdFromJwt } from '../utils/jwt';
import {
    isFavoriteAuthor as isFavoriteAuthorStored,
    isFavoriteBook as isFavoriteBookStored,
    subscribeFavoritesChanged,
    toggleFavoriteAuthor as toggleFavoriteAuthorStored,
    toggleFavoriteBook as toggleFavoriteBookStored,
} from '../utils/favoritesStorage';

const primaryColor = '#a89d70';
const hoverColor = '#948a65';
const darkBeigeColor = '#eae7dd';
const lightBackground = '#fdfcf7';

export default function BookDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const token = user?.token || window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
    const currentUserId = getUserIdFromJwt(token);
    const isLoggedIn = currentUserId != null;
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isOwnerHovered, setIsOwnerHovered] = useState(false);
    const [isBackHovered, setIsBackHovered] = useState(false);
    const [isFavoriteAuthor, setIsFavoriteAuthor] = useState(false);
    const [isFavoriteBook, setIsFavoriteBook] = useState(false);

    const [myOfferBooks, setMyOfferBooks] = useState([]);
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [selectedOfferedBookId, setSelectedOfferedBookId] = useState('');
    const [isSendingOffer, setIsSendingOffer] = useState(false);
    const [offerMessage, setOfferMessage] = useState(null);
    const [offerSent, setOfferSent] = useState(false);

    // стили только важный
    const avatarStyle = { width: 48, height: 48, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20, marginRight: 12 };
    const ownerNameStyle = { fontWeight: 'bold', color: primaryColor, fontSize: '1.1em', textDecoration: 'none' };
    const ratingStyle = { color: '#888', fontSize: '0.95em', margin: 0 };
    const actionButtonStyle = { padding: '12px 30px', borderRadius: 8, border: 'none', backgroundColor: primaryColor, color: '#fff', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer', marginTop: 18, transition: 'background-color 0.2s' };
    const disabledButtonStyle = { ...actionButtonStyle, backgroundColor: '#ccc', color: '#888', cursor: 'not-allowed' };

    const normalizeStatus = (status) => (status || '').toString().trim().toLowerCase();

    const offerSentStorageKey = isLoggedIn && currentUserId != null && id != null
        ? `exchange:offerSent:${currentUserId}:${id}`
        : null;

    useEffect(() => {
        if (!id) {
            setError('Ошибка: ID книги не указан.');
            setLoading(false);
            return;
        }
		let isActive = true;

        const fetchBookDetails = async () => {
            setLoading(true);
            try {
                const fetchedBook = await getBookById(id);
				let owner = null;
				if (fetchedBook && fetchedBook.ownerId != null) {
					try {
						owner = await getUserById(fetchedBook.ownerId);
					} catch (e) {
						owner = null;
					}
				}

				if (!isActive) return;
                setBook({
                    ...fetchedBook,
					ownerName: owner?.username || 'Неизвестный пользователь',
					ownerLocation: owner?.location || 'Город не указан',
					ownerRating: owner?.rating ?? null,
					ownerRatingCount: owner?.ratingCount ?? 0,
					ownerProfileImage: owner?.profileImage || null,
                    available: normalizeStatus(fetchedBook.status) === 'available',
                    coverUrl: fetchedBook?.coverUrl || '',
                    description: fetchedBook.description || 'Описание не предоставлено.'
                });
                setError(null);
            } catch (err) {
                console.error('Ошибка загрузки данных книги:', err);
                if (!isActive) return;
                if (err.response && err.response.status === 404) {
                    setError(`Книга с ID ${id} не найдена.`);
                } else {
                    setError('Не удалось загрузить данные книги. Проверьте сервер и API.');
                }
                setBook(null);
            } finally {
				if (isActive) setLoading(false);
            }
        };
        fetchBookDetails();

		return () => {
			isActive = false;
		};
    }, [id]);

    useEffect(() => {
        if (!isLoggedIn || !book?.id) {
            setIsFavoriteBook(false);
            return;
        }
        setIsFavoriteBook(isFavoriteBookStored(currentUserId, book.id));
    }, [isLoggedIn, currentUserId, book?.id]);

    useEffect(() => {
        if (!isLoggedIn) {
            setIsFavoriteAuthor(false);
            return;
        }
        const author = (book?.author || '').toString().trim();
        if (!author) {
            setIsFavoriteAuthor(false);
            return;
        }
        setIsFavoriteAuthor(isFavoriteAuthorStored(currentUserId, author));
    }, [isLoggedIn, currentUserId, book?.author]);

    useEffect(() => {
        return subscribeFavoritesChanged(() => {
            if (!isLoggedIn) return;
            if (book?.id) setIsFavoriteBook(isFavoriteBookStored(currentUserId, book.id));
            const author = (book?.author || '').toString().trim();
            if (author) setIsFavoriteAuthor(isFavoriteAuthorStored(currentUserId, author));
        });
    }, [isLoggedIn, currentUserId, book?.id, book?.author]);

    // комментарий важный ключевой
    useEffect(() => {
        let isActive = true;

        const loadMyBooks = async () => {
            if (!isLoggedIn) return;
            if (!book?.ownerId || !currentUserId) return;
            if (Number(book.ownerId) === Number(currentUserId)) return;

            try {
                const all = await getAllBooks();
                if (!isActive) return;
                const mine = Array.isArray(all)
                    ? all.filter((b) => Number(b.ownerId) === Number(currentUserId) && normalizeStatus(b.status) === 'available')
                    : [];
                setMyOfferBooks(mine);
            } catch {
                if (!isActive) return;
                setMyOfferBooks([]);
            }
        };

        loadMyBooks();
        return () => {
            isActive = false;
        };
    }, [isLoggedIn, book?.ownerId, currentUserId]);

    // комментарий важный ключевой
    useEffect(() => {
        let isActive = true;

        const hydrateOfferSentState = async () => {
            if (!isLoggedIn || !currentUserId || !book?.id) {
                if (isActive) setOfferSent(false);
                return;
            }

            // комментарий важный ключевой
            if (Number(book.ownerId) === Number(currentUserId)) {
                if (isActive) setOfferSent(false);
                return;
            }

            // комментарий важный ключевой
            if (offerSentStorageKey) {
                const hinted = localStorage.getItem(offerSentStorageKey) === '1';
                if (hinted && isActive) setOfferSent(true);
            }

            try {
                const outgoing = await getOutgoingExchangeRequests();
                const hasPending = Array.isArray(outgoing)
                    ? outgoing.some((r) => Number(r?.requestedBookId) === Number(book.id) && String(r?.status || '').toLowerCase() === 'pending')
                    : false;

                if (!isActive) return;
                setOfferSent(hasPending);
                if (offerSentStorageKey) {
                    if (hasPending) localStorage.setItem(offerSentStorageKey, '1');
                    else localStorage.removeItem(offerSentStorageKey);
                }
            } catch {
                // комментарий важный ключевой
            }
        };

        hydrateOfferSentState();

        return () => {
            isActive = false;
        };
    }, [isLoggedIn, currentUserId, book?.id, book?.ownerId, offerSentStorageKey]);

    if (loading) {
        return <div style={containerStyle}>
            <h1 style={{ ...titleStyle, textAlign: 'center' }}>Загрузка...</h1>
            <p style={{ textAlign: 'center', color: '#666' }}>Запрашиваем данные книги с ID: {id}</p>
        </div>;
    }
    if (error) {
        return <div style={{ ...containerStyle, color: 'red', textAlign: 'center' }}>
            <h1 style={titleStyle}>Ошибка загрузки</h1>
            <p>{error}</p>
            <Link to="/" style={{ ...backLinkStyle, marginLeft: 0 }}>Вернуться в каталог</Link>
        </div>;
    }
    if (!book) {
        return <div style={{ ...containerStyle, textAlign: 'center' }}>
            <p style={{ fontSize: '1.2em', color: '#666' }}>Данные книги отсутствуют.</p>
        </div>;
    }

    const toggleFavorite = () => {
        if (!isLoggedIn || !book?.id) return;
        const next = toggleFavoriteBookStored(currentUserId, book.id);
        setIsFavoriteBook(next);
    };

    const toggleFavoriteAuthor = () => {
        if (!isLoggedIn) return;
        const author = (book?.author || '').toString().trim();
        if (!author) return;
        const next = toggleFavoriteAuthorStored(currentUserId, author);
        setIsFavoriteAuthor(next);
    };

    const isOwnBook = isLoggedIn && currentUserId != null && Number(book?.ownerId) === Number(currentUserId);

    const handleSendOffer = async () => {
        if (!book?.id) return;
        if (!selectedOfferedBookId) {
            setOfferMessage('Выберите вашу книгу для обмена.');
            return;
        }

        setIsSendingOffer(true);
        setOfferMessage(null);

        try {
            await createExchangeRequest(Number(book.id), Number(selectedOfferedBookId));
            setOfferMessage('Запрос на обмен отправлен.');
            setIsOfferOpen(false);
            setOfferSent(true);
            if (offerSentStorageKey) localStorage.setItem(offerSentStorageKey, '1');
        } catch (e) {
            if (e?.response?.status === 401) {
                setOfferMessage('Сессия истекла. Войдите в аккаунт заново.');
            } else {
                setOfferMessage('Не удалось отправить запрос на обмен.');
            }
        } finally {
            setIsSendingOffer(false);
        }
    };

    const ownerInitials = (() => {
        const name = (book?.ownerName || '').trim();
        if (!name) return '??';
        return name.slice(0, 2).toUpperCase();
    })();

    return (
        <div style={containerStyle}>
            <Link
                to="/"
                style={{
                    ...backLinkStyle,
                    backgroundColor: isBackHovered ? primaryColor : 'white',
                    color: isBackHovered ? 'white' : primaryColor,
                    borderColor: isBackHovered ? primaryColor : 'rgba(168, 157, 112, 0.55)',
                    transform: isBackHovered ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: isBackHovered ? `0 5px 12px ${primaryColor}40` : 'none',
                }}
                onMouseEnter={() => setIsBackHovered(true)}
                onMouseLeave={() => setIsBackHovered(false)}
            >
                ← Назад к каталогу
            </Link>
            <div style={mainContentWrapperStyle}>
                <div style={titleHeaderStyle}>
                    <h1 style={titleStyle}>{book.title}</h1>

                    <div style={titleActionsStyle}>
                        {isOwnBook ? (
                            <Link
                                to={`/books/${book.id}/edit`}
                                style={{
                                    ...backLinkStyle,
                                    marginBottom: 0,
                                    marginLeft: 0,
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                title="Редактировать вашу книгу"
                            >
                                Редактировать
                            </Link>
                        ) : null}

                        {isLoggedIn ? (
                            <button
                                type="button"
                                onClick={toggleFavorite}
                                style={favoriteButtonStyle}
                                aria-label={isFavoriteBook ? 'Убрать из избранного' : 'Добавить в избранное'}
                                title={isFavoriteBook ? 'Убрать из избранного' : 'Добавить в избранное'}
                            >
                                <span style={{
                                    ...favoriteIconStyle,
                                    color: isFavoriteBook ? 'red' : primaryColor,
                                }}>
                                    {isFavoriteBook ? '♥' : '♡'}
                                </span>
                            </button>
                        ) : null}
                    </div>
                </div>
                <div style={contentGridStyle}>
                    {/* Левая колонка */}
                    <div style={detailColumnStyle}>
						<div style={largeBookCoverWrapStyle} aria-label={`Обложка книги ${book.title}`}>
							<div style={largeBookCoverPlaceholderStyle} aria-hidden="true">
                                нет обложки
							</div>
							{book.coverUrl ? (
								<img
									src={book.coverUrl}
									alt={`Обложка книги ${book.title}`}
									style={largeBookCoverImageStyle}
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							) : null}
						</div>
                        <h2>О книге</h2>
                        <p style={descriptionStyle}>{book.description}</p>
                        <div style={infoGridStyle}>
                            <InfoItem label="Автор:" value={book.author} action={
                                isLoggedIn ? (
                                    <button
                                        type="button"
                                        onClick={toggleFavoriteAuthor}
                                        style={{
                                            ...favoriteAuthorStyle,
                                            backgroundColor: isFavoriteAuthor ? primaryColor : 'white',
                                            color: isFavoriteAuthor ? 'white' : primaryColor,
                                        }}
                                    >
                                        {isFavoriteAuthor ? '✓ Любимый автор' : '+ Любимый автор'}
                                    </button>
                                ) : null
                            } />
                            <InfoItem label="Жанр:" value={book.genre || 'Не указан'} />
                            <InfoItem label="Состояние:" value={book.condition || 'Не указано'} />
                        </div>
                    </div>
                    {/* Правая колонка: Профиль владельца и Кнопка обмена */}
                    <div style={sidebarStyle}>
                        <h2 style={{ color: primaryColor }}>Владелец</h2>
                        <Link
                            to={isOwnBook ? '/profile' : (book?.ownerId != null ? `/users/${book.ownerId}` : '#')}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                            aria-label="Открыть профиль владельца"
                        >
                            <div
                                style={{ ...ownerCardStyle, backgroundColor: isOwnerHovered ? '#fffdf5' : lightBackground }}
                                onMouseEnter={() => setIsOwnerHovered(true)}
                                onMouseLeave={() => setIsOwnerHovered(false)}
                            >
                                <div style={avatarStyle}>
                                    {book.ownerProfileImage ? (
                                        <img
                                            src={book.ownerProfileImage}
                                            alt="Аватар владельца"
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                        />
                                    ) : (
                                        ownerInitials
                                    )}
                                </div>
                                <div style={{ flexGrow: 1 }}>
								<span style={ownerNameStyle}>{book.ownerName}</span>
                                    <p style={{ margin: '3px 0' }}>{book.ownerLocation}</p>
								<p style={ratingStyle}>
									{Number(book.ownerRatingCount || 0) > 0
										? `Рейтинг: ${Number(book.ownerRating || 0).toFixed(1)} (${Number(book.ownerRatingCount || 0)})`
										: 'не совершал/а обменов'}
								</p>
                                </div>
                            </div>
                        </Link>
                        {isLoggedIn ? (
                            isOwnBook ? (
                                <p style={{ marginTop: 18, textAlign: 'center', color: '#666', fontWeight: 'bold' }}>
                                    Ваша книга для обмена
                                </p>
                            ) : (
                                <>
                                    {offerSent ? (
                                        <div
                                            style={{
                                                marginTop: 18,
                                                padding: '12px 14px',
                                                borderRadius: 10,
                                                backgroundColor: darkBeigeColor,
                                                border: `1px solid ${primaryColor}`,
                                                color: primaryColor,
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Предложение для обмена отправлено
                                        </div>
                                    ) : (
                                        <button
                                            style={{
                                                ...(book.available ? actionButtonStyle : disabledButtonStyle),
                                                backgroundColor: book.available && isButtonHovered ? hoverColor : (book.available ? primaryColor : '#ccc')
                                            }}
                                            onMouseEnter={() => setIsButtonHovered(true)}
                                            onMouseLeave={() => setIsButtonHovered(false)}
                                            disabled={!book.available || isSendingOffer}
                                            onClick={() => {
                                                setOfferMessage(null);
                                                setIsOfferOpen((prev) => !prev);
                                            }}
                                        >
                                            {book.available ? 'Предложить обмен' : 'Книга в обмене'}
                                        </button>
                                    )}

                                    {isOfferOpen && book.available ? (
                                        <div
                                            style={{
                                                marginTop: 12,
                                                padding: 12,
                                                borderRadius: 12,
                                                backgroundColor: lightBackground,
                                                border: '1px solid rgba(168, 157, 112, 0.35)',
                                            }}
                                        >
                                            <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                                                Выберите вашу книгу, которую вы предлагаете:
                                            </p>
                                            <select
                                                value={selectedOfferedBookId}
                                                onChange={(e) => setSelectedOfferedBookId(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 12px',
                                                    borderRadius: 10,
                                                    border: `1px solid rgba(168, 157, 112, 0.55)`,
                                                    backgroundColor: 'white',
                                                    outline: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                <option value="">— Выберите книгу —</option>
                                                {myOfferBooks.map((b) => (
                                                    <option key={b.id} value={String(b.id)}>
                                                        {b.title} — {b.author}
                                                    </option>
                                                ))}
                                            </select>

                                            {myOfferBooks.length === 0 ? (
                                                <p style={{ marginTop: 10, color: '#666' }}>
                                                    У вас нет доступных книг для обмена.
                                                </p>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOffer}
                                                        disabled={isSendingOffer}
                                                        style={{ ...actionButtonStyle, marginTop: 0, flex: 1 }}
                                                    >
                                                        {isSendingOffer ? 'Отправляем...' : 'Отправить запрос'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsOfferOpen(false);
                                                            setOfferMessage(null);
                                                        }}
                                                        style={{ ...disabledButtonStyle, marginTop: 0, flex: 1, backgroundColor: '#eee', color: '#444', cursor: 'pointer' }}
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            )}

                                            {offerMessage ? (
                                                <p style={{ marginTop: 10, color: offerMessage.includes('не удалось') || offerMessage.includes('истекла') ? 'red' : primaryColor, fontWeight: 'bold' }}>
                                                    {offerMessage}
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </>
                            )
                        ) : null}
                        <p style={{ fontSize: '0.9em', color: '#777', marginTop: '15px', textAlign: 'center' }}>
                            *Обмен осуществляется по взаимному согласию сторон.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// вспомогательный компонент для
const InfoItem = ({ label, value, action }) => (
    <div style={infoItemStyle}>
        <p style={labelStyle}>{label}</p>
        <p style={valueStyle}>{value}</p>
        {action}
    </div>
);


// стили изменений без
const containerStyle = { 
    maxWidth: '1000px', 
    margin: '0 auto',
    paddingTop: '20px'
};

const mainContentWrapperStyle = {
    padding: '0 10px',
};


const backLinkStyle = { 
    display: 'inline-flex', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px', 
    textDecoration: 'none', 
    transition: 'all 0.2s ease-out',
    padding: '10px 14px',
    borderRadius: '10px',
    fontWeight: 'bold', 
    fontSize: '1.02em',
    marginLeft: '0',
    border: '1px solid rgba(168, 157, 112, 0.55)',
};

const titleHeaderStyle = { 
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    marginBottom: '30px', 
    borderBottom: '1px solid ' + primaryColor,
    paddingBottom: '10px' 
};

const titleActionsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    flex: '0 0 auto',
};

const titleStyle = {
    margin: '0',
    fontSize: '2em',
    flex: '1 1 auto',
    minWidth: 0,
    paddingRight: 12,
    lineHeight: 1.15,
};
const favoriteButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: '9999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(168, 157, 112, 0.55)',
    backgroundColor: 'rgba(253, 252, 247, 0.92)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.10)',
    padding: 0,
};

const favoriteIconStyle = {
    fontSize: 22,
    lineHeight: 1,
    transform: 'translateY(-1px)',
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

const largeBookCoverWrapStyle = {
    width: '250px',
    height: '360px',
    borderRadius: '10px',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
    margin: '0 0 30px 0',
    position: 'relative',
    overflow: 'hidden',
};

const largeBookCoverPlaceholderStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: darkBeigeColor,
    backgroundImage: 'linear-gradient(135deg, rgba(168, 157, 112, 0.22) 0%, rgba(168, 157, 112, 0.06) 60%, rgba(168, 157, 112, 0.00) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '1.05em',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    userSelect: 'none',
};

const largeBookCoverImageStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
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

/* стили важный для */
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
    borderRadius: '10px'
}