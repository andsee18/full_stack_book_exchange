import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../api/userApi';
import { deleteBook, getAllBooks } from '../api/BookApi';
import {
    acceptExchangeRequest,
    cancelExchangeRequest,
    clearMyExchangeHistory,
    getIncomingExchangeRequests,
    getOutgoingExchangeRequests,
    rejectExchangeRequest,
} from '../api/exchangeApi';
import { getMyRatedExchangeIds, rateExchange } from '../api/ratingApi';
import { getUserIdFromJwt } from '../utils/jwt';
import {
    getFavoriteAuthors,
    getFavoriteBookIds,
    subscribeFavoritesChanged,
    toggleFavoriteAuthor,
    toggleFavoriteBook,
} from '../utils/favoritesStorage';

// единая палитра важный
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 
const textColor = '#3c3838';      
const lightBackground = '#fdfcf7';
const successColor = '#98c19d';      
const successHoverColor = '#80a384'; 
const errorColor = '#e8a8a8';        

const formatBookStatusRu = (status) => {
    const s = (status || '').toString().trim().toLowerCase();

    switch (s) {
        case 'available':
            return 'Доступна для обмена';
        case 'exchanged':
            return 'Доступна для обмена';
        case 'reserved':
            return 'Забронирована';
        case 'unavailable':
            return 'Недоступна';
        default:
            return status || '—';
    }
};

const formatExchangeStatusRu = (status) => {
    const s = (status || '').toString().trim().toLowerCase();
    switch (s) {
        case 'pending':
            return 'Ожидание подтверждения';
        case 'accepted':
            return 'Принято';
        case 'rejected':
            return 'Отклонено';
        case 'cancelled':
            return 'Отменено';
        default:
            return status || '—';
    }
};

// вспомогательные компоненты для

const ExchangeBookItem = ({ book, userLabel, isYours }) => (
    <div style={exchangeBookItemStyle}>
        <div style={bookCoverPlaceholderStyle}>
			<div style={bookCoverFallbackStyle} aria-hidden="true">
				<div style={bookCoverFallbackMarkStyle} />
			</div>
            {book.coverUrl ? (
                <img
                    src={book.coverUrl}
                    alt={`Обложка ${book.title}`}
                    style={bookCoverStyle}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : null}
        </div>
        <div style={{ flexGrow: 1 }}>
            <Link to={`/books/${book.id}`} style={bookTitleStyle}>{book.title}</Link>
            <p style={bookAuthorStyle}>{book.author}</p>
            {userLabel ? (
                <p style={bookOwnerStyle}>
                    {userLabel}{isYours ? ' (ваша книга)' : ''}
                </p>
            ) : null}
        </div>
    </div>
);

const ExchangeItem = ({ exchange, onAccept, onReject, onCancel }) => {
    const isPending = exchange.status === 'pending';
    const canAccept = exchange.isIncoming && isPending;
    const canClose = isPending;

    const [isConfirmHovered, setIsConfirmHovered] = useState(false);
    const [isCloseHovered, setIsCloseHovered] = useState(false);

    const [hoverStar, setHoverStar] = useState(0);
    const [isRating, setIsRating] = useState(false);
    const [ratedLocal, setRatedLocal] = useState(false);

    const handleClose = () => {
        if (!canClose) return;
        const ok = window.confirm(exchange.isIncoming ? 'Отклонить предложение обмена?' : 'Отменить запрос на обмен?');
        if (!ok) return;
        if (exchange.isIncoming) {
            onReject?.(exchange.id);
        } else {
            onCancel?.(exchange.id);
        }
    };

    const canRate = exchange.status === 'accepted' && !exchange.isRated && !ratedLocal;
    const otherUserLabel = exchange.isIncoming ? exchange.bookOfferedUserLabel : exchange.bookRequestedUserLabel;

    const handleRate = async (stars) => {
        if (!canRate || isRating) return;
        setIsRating(true);
        try {
            await exchange.onRate?.(exchange.id, stars);
            setRatedLocal(true);
        } catch {
            alert('Не удалось отправить оценку.');
        } finally {
            setIsRating(false);
        }
    };

    return (
        <div style={exchangeItemContainerStyle}>
            
            <ExchangeBookItem
                book={exchange.bookOffered}
                userLabel={exchange.bookOfferedUserLabel}
                isYours={exchange.bookOfferedIsYours}
            />
            
            <div style={separatorStyle}>
                <span style={exchangeIconStyle}>⟲</span>
            </div>
            
            <ExchangeBookItem
                book={exchange.bookRequested}
                userLabel={exchange.bookRequestedUserLabel}
                isYours={exchange.bookRequestedIsYours}
            />
            
            <div style={statusBadgeStyle(exchange.status)}>
                {formatExchangeStatusRu(exchange.status)}
            </div>

            {canAccept && (
                <div style={actionButtonsContainerStyle}>
                    <button 
                        style={{...confirmButtonStyle, backgroundColor: isConfirmHovered ? successHoverColor : successColor}}
                        onMouseEnter={() => setIsConfirmHovered(true)}
                        onMouseLeave={() => setIsConfirmHovered(false)}
                        onClick={() => onAccept?.(exchange.id)}
                    >
                        Подтвердить обмен
                    </button>
                </div>
            )}
            
            {canClose ? (
                <button
                    type="button"
                    onClick={handleClose}
                    onMouseEnter={() => setIsCloseHovered(true)}
                    onMouseLeave={() => setIsCloseHovered(false)}
                    style={{
                        ...closeButtonStyle,
                        color: isCloseHovered ? textColor : closeButtonStyle.color,
                        backgroundColor: isCloseHovered ? 'rgba(0,0,0,0.06)' : 'transparent',
                    }}
                    aria-label={exchange.isIncoming ? 'Отклонить обмен' : 'Отменить обмен'}
                    title={exchange.isIncoming ? 'Отклонить' : 'Отменить'}
                >
                    ✕
                </button>
            ) : null}

            {canRate ? (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${darkBeigeColor}` }}>
                    <div style={{ marginBottom: 6, color: '#555', fontWeight: 'bold' }}>
                        Оцените пользователя: {otherUserLabel || 'партнёр по обмену'}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map((n) => {
                            const filled = (hoverStar || 0) >= n;
                            return (
                                <button
                                    key={n}
                                    type="button"
                                    onMouseEnter={() => setHoverStar(n)}
                                    onMouseLeave={() => setHoverStar(0)}
                                    onClick={() => handleRate(n)}
                                    disabled={isRating}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: isRating ? 'not-allowed' : 'pointer',
                                        fontSize: 22,
                                        lineHeight: 1,
                                        color: filled ? primaryColor : '#c8c0aa',
                                        padding: '2px 3px',
                                    }}
                                    aria-label={`Поставить ${n} из 5`}
                                    title={`${n} / 5`}
                                >
                                    {filled ? '★' : '☆'}
                                </button>
                            );
                        })}
                        {isRating ? <span style={{ color: '#666', fontSize: 13 }}>Отправка...</span> : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
// конец вспомогательных компонентов


// компоненты содержимого вкладок

const MyBooks = ({ books, isLoading, error, onDelete }) => (
    <div style={contentStyle}>
        <h2>Мои книги для обмена ({books.length} шт.)</h2>

        {isLoading ? (
            <p>Загрузка...</p>
        ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
        ) : books.length === 0 ? (
            <>
                <p>Вы еще не добавляли книги для обмена.</p>
            </>
        ) : (
            <>
                <div style={myBooksListStyle}>
                    {books.map((b) => (
                        <div key={b.id} style={myBookCardStyle}>
                            <div style={{ flexGrow: 1 }}>
                                <Link to={`/books/${b.id}`} style={myBookTitleStyle}>{b.title}</Link>
                                <p style={myBookMetaStyle}>{b.author}</p>
                            </div>
                            <div style={myBookActionsStyle}>
                                <span style={myBookStatusStyle}>{formatBookStatusRu(b.status)}</span>
                                <Link
                                    to={`/books/${b.id}/edit`}
                                    style={myBookEditLinkStyle}
                                >
                                    Редактировать
                                </Link>
                                <button
                                    type="button"
                                    style={myBookDeleteButtonStyle}
                                    onClick={() => onDelete?.(b)}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
);

const Exchanges = ({ exchanges, isLoading, error, onAccept, onReject, onCancel, onRate, ratedExchangeIds, onClearHistory, canClearHistory, usersById }) => (
    <div style={contentStyle}>
        <div style={exchangesHeaderRowStyle}>
            <h2 style={{ margin: 0 }}>Активные обмены</h2>
            <button
                type="button"
                onClick={onClearHistory}
                disabled={!canClearHistory}
                style={{
                    ...clearHistoryButtonStyle,
                    opacity: canClearHistory ? 1 : 0.55,
                    cursor: canClearHistory ? 'pointer' : 'not-allowed',
                }}
                title={canClearHistory ? 'Скрыть историю (принято/отклонено/отменено) только для вас' : 'Нет истории для очистки'}
            >
                Очистить историю
            </button>
        </div>
        <p style={{ marginBottom: '20px' }}>Список ваших запросов на обмен и входящих предложений.</p>

        {isLoading ? (
            <p>Загрузка...</p>
        ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
        ) : exchanges.length === 0 ? (
            <p>Пока нет активных обменов.</p>
        ) : (
            <div style={listContainerStyle}>
                {exchanges.map((exchange) => (
                    <ExchangeItem
                        key={exchange.id}
                        exchange={{
                            ...exchange,
                            isRated: ratedExchangeIds?.has?.(Number(exchange.id)),
                            onRate,
                            bookOfferedUserLabel: exchange.isIncoming
                                ? (usersById?.[Number(exchange.requesterId)] || `Пользователь #${exchange.requesterId}`)
                                : 'Вы',
                            bookRequestedUserLabel: exchange.isIncoming
                                ? 'Вы'
                                : (usersById?.[Number(exchange.recipientId)] || `Пользователь #${exchange.recipientId}`),
                        }}
                        onAccept={onAccept}
                        onReject={onReject}
                        onCancel={onCancel}
                    />
                ))}
            </div>
        )}
    </div>
);

const Favorites = ({ isLoggedIn, currentUserId, booksCatalog, favoritesTick }) => {
    const [expandedAuthorKey, setExpandedAuthorKey] = useState(null);

    const normalize = (s) => (s || '').toString().trim().toLowerCase();

    const favBookIds = useMemo(() => {
        void favoritesTick;
        if (!isLoggedIn) return new Set();
        return getFavoriteBookIds(currentUserId);
    }, [isLoggedIn, currentUserId, favoritesTick]);

    const favAuthors = useMemo(() => {
        void favoritesTick;
        if (!isLoggedIn) return [];
        return getFavoriteAuthors(currentUserId);
    }, [isLoggedIn, currentUserId, favoritesTick]);

    const favBooks = useMemo(() => {
        if (!isLoggedIn) return [];
        const all = Array.isArray(booksCatalog) ? booksCatalog : [];
        return all.filter((b) => favBookIds.has(Number(b?.id)));
    }, [isLoggedIn, booksCatalog, favBookIds]);

    const booksByAuthor = useCallback((author) => {
        if (!isLoggedIn) return [];
        const key = normalize(author);
        if (!key) return [];
        const all = Array.isArray(booksCatalog) ? booksCatalog : [];
        return all.filter((b) => normalize(b?.author) === key);
    }, [isLoggedIn, booksCatalog]);

    const handleRemoveBook = (bookId) => {
        if (!isLoggedIn) return;
        toggleFavoriteBook(currentUserId, bookId);
    };

    const handleRemoveAuthor = (author) => {
        if (!isLoggedIn) return;
        toggleFavoriteAuthor(currentUserId, author);
        const key = normalize(author);
        if (expandedAuthorKey && key && expandedAuthorKey === key) {
            setExpandedAuthorKey(null);
        }
    };

    const handleToggleExpandAuthor = (author) => {
        const key = normalize(author);
        if (!key) return;
        setExpandedAuthorKey((prev) => (prev === key ? null : key));
    };

    return (
        <div style={contentStyle}>
            <h2>Избранное</h2>

            {!isLoggedIn ? (
                <p style={{ color: '#666' }}>Войдите в аккаунт, чтобы пользоваться избранным.</p>
            ) : (
                <>
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 10px 0', color: textColor }}>Избранные книги</h3>
                        {favBooks.length === 0 ? (
                            <p style={{ color: '#666', margin: 0 }}>Пока нет избранных книг.</p>
                        ) : (
                            <div style={listContainerStyle}>
                                {favBooks.map((b) => (
                                    <div key={b.id} style={favoriteRowStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                            <div style={bookCoverPlaceholderStyle}>
                                                                    <div style={bookCoverFallbackStyle} aria-hidden="true">
                                                                        <div style={bookCoverFallbackMarkStyle} />
                                                                    </div>
                                                                {b.coverUrl ? (
                                                                    <img
                                                                        src={b.coverUrl}
                                                                        alt={`Обложка ${b.title}`}
                                                                        style={bookCoverStyle}
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : null}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <Link to={`/books/${b.id}`} style={bookTitleStyle}>{b.title}</Link>
                                                <p style={bookAuthorStyle}>{b.author}</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBook(b.id)}
                                            style={favoriteRemoveButtonStyle}
                                            aria-label="Убрать из избранного"
                                            title="Убрать из избранного"
                                        >
                                            ♥
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: textColor }}>Любимые авторы</h3>
                        {favAuthors.length === 0 ? (
                            <p style={{ color: '#666', margin: 0 }}>Пока нет любимых авторов.</p>
                        ) : (
                            <div style={listContainerStyle}>
                                {favAuthors.map((a) => (
                                    <div key={a}>
                                        <div style={favoriteRowStyle}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleExpandAuthor(a)}
                                                style={favoriteAuthorButtonStyle}
                                                aria-label={`Показать книги автора ${a}`}
                                                title="Показать книги этого автора"
                                            >
                                                <span style={{ fontWeight: 'bold', color: textColor }}>{a}</span>
                                                <span style={{ color: '#666', fontSize: 13 }}>
                                                    {expandedAuthorKey === normalize(a) ? '▲' : '▼'}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAuthor(a)}
                                                style={favoriteRemoveButtonStyle}
                                                aria-label="Убрать автора из любимых"
                                                title="Убрать автора из любимых"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {expandedAuthorKey === normalize(a) ? (
                                            <div style={{ marginTop: 10, marginLeft: 8 }}>
                                                {(() => {
                                                    const list = booksByAuthor(a);
                                                    if (list.length === 0) {
                                                        return <p style={{ margin: 0, color: '#666' }}>Книг этого автора пока нет в каталоге.</p>;
                                                    }
                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                            {list.map((b) => (
                                                                <div key={b.id} style={favoriteRowCompactStyle}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                                                        <div style={bookCoverPlaceholderStyle}>
                                                                            <div style={bookCoverFallbackStyle} aria-hidden="true">
                                                                                <div style={bookCoverFallbackMarkStyle} />
                                                                            </div>
                                                                            {b.coverUrl ? (
                                                                                <img
                                                                                    src={b.coverUrl}
                                                                                    alt={`Обложка ${b.title}`}
                                                                                    style={bookCoverStyle}
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                            ) : null}
                                                                        </div>
                                                                        <div style={{ minWidth: 0 }}>
                                                                            <Link to={`/books/${b.id}`} style={bookTitleStyle}>{b.title}</Link>
                                                                            <p style={bookAuthorStyle}>{b.author}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// вспомогательный компонент для
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
            Настройки
        </Link>
    );
};


// главный компонент профиля

export default function Profile() {
    const [activeTab, setActiveTab] = useState('books');
    const { user } = useAuth();

    const token = user?.token || localStorage.getItem('jwtToken');
    const currentUserId = useMemo(() => getUserIdFromJwt(token), [token]);

    const [currentUser, setCurrentUser] = useState(null);
    const [myBooks, setMyBooks] = useState([]);
    const [booksCatalog, setBooksCatalog] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingExchanges, setLoadingExchanges] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [exchangeError, setExchangeError] = useState(null);
    const [exchangeItems, setExchangeItems] = useState([]);
    const [exchangeUsersById, setExchangeUsersById] = useState({});
    const [ratedExchangeIds, setRatedExchangeIds] = useState(new Set());
    const [favoritesTick, setFavoritesTick] = useState(0);

    const exchangeUsersByIdRef = useRef({});

    useEffect(() => {
        exchangeUsersByIdRef.current = exchangeUsersById || {};
    }, [exchangeUsersById]);

    useEffect(() => {
        return subscribeFavoritesChanged(() => {
            setFavoritesTick((x) => x + 1);
        });
    }, []);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            if (!currentUserId) {
                setCurrentUser(null);
                setMyBooks([]);
                setProfileError('Вы не вошли в аккаунт.');
                return;
            }

            setProfileError(null);
            setLoadingBooks(true);

            try {
                const [u, allBooks] = await Promise.all([
                    getUserById(currentUserId),
                    getAllBooks(),
                ]);

                if (!isActive) return;

                setCurrentUser(u);
                setBooksCatalog(Array.isArray(allBooks) ? allBooks : []);
                const mine = Array.isArray(allBooks)
                    ? allBooks.filter((b) => Number(b.ownerId) === Number(currentUserId))
                    : [];
                setMyBooks(mine);
            } catch (e) {
                if (!isActive) return;
                setProfileError('Не удалось загрузить профиль. Проверьте сервер.');
                setCurrentUser(null);
                setMyBooks([]);
                setBooksCatalog([]);
            } finally {
                if (!isActive) return;
                setLoadingBooks(false);
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, [currentUserId]);

    const booksById = useMemo(() => {
        const map = new Map();
        (booksCatalog || []).forEach((b) => {
            if (b?.id != null) map.set(Number(b.id), b);
        });
        return map;
    }, [booksCatalog]);

    const reloadExchanges = useCallback(async (options = {}) => {
        if (!currentUserId) return;

        const silent = !!options?.silent;

        setExchangeError(null);
        if (!silent) setLoadingExchanges(true);

        try {
            const [incoming, outgoing, rated] = await Promise.all([
                getIncomingExchangeRequests(),
                getOutgoingExchangeRequests(),
                getMyRatedExchangeIds().catch(() => []),
            ]);

            setRatedExchangeIds(
                new Set((Array.isArray(rated) ? rated : []).map((x) => Number(x)).filter((x) => Number.isFinite(x)))
            );

            // комментарий важный ключевой
            const involvedUserIds = new Set([Number(currentUserId)]);
            (Array.isArray(incoming) ? incoming : []).forEach((r) => {
                if (r?.requesterId != null) involvedUserIds.add(Number(r.requesterId));
                if (r?.recipientId != null) involvedUserIds.add(Number(r.recipientId));
            });
            (Array.isArray(outgoing) ? outgoing : []).forEach((r) => {
                if (r?.requesterId != null) involvedUserIds.add(Number(r.requesterId));
                if (r?.recipientId != null) involvedUserIds.add(Number(r.recipientId));
            });

            const knownUsers = exchangeUsersByIdRef.current || {};
            const missingUserIds = Array.from(involvedUserIds).filter((id) => !knownUsers?.[id]);
            if (missingUserIds.length) {
                Promise.all(
                    missingUserIds.map(async (id) => {
                        try {
                            const u = await getUserById(id);
                            return [id, u?.username || `Пользователь #${id}`];
                        } catch {
                            return [id, `Пользователь #${id}`];
                        }
                    })
                ).then((pairs) => {
                    setExchangeUsersById((prev) => {
                        const next = { ...prev };
                        pairs.forEach(([id, name]) => {
                            next[id] = name;
                        });
                        return next;
                    });
                });
            }

            const toBookVm = (bookId) => {
                const book = booksById.get(Number(bookId));
                return {
                    id: bookId,
                    title: book?.title || `Книга удалена (#${bookId})`,
                    author: book?.author || '',
                    coverUrl: book?.coverUrl,
                };
            };

            const normalize = (r, isIncoming) => ({
                id: r.id,
                status: r.status,
                isIncoming,
                requesterId: r.requesterId,
                recipientId: r.recipientId,
                bookOffered: toBookVm(r.offeredBookId),
                bookRequested: toBookVm(r.requestedBookId),
                bookOfferedIsYours: !isIncoming,
                bookRequestedIsYours: isIncoming,
            });

            const merged = [
                ...(Array.isArray(incoming) ? incoming.map((r) => normalize(r, true)) : []),
                ...(Array.isArray(outgoing) ? outgoing.map((r) => normalize(r, false)) : []),
            ];
            merged.sort((a, b) => Number(b.id) - Number(a.id));
            setExchangeItems(merged);
        } catch {
            setExchangeError('Не удалось загрузить обмены. Проверьте сервер.');
            setExchangeItems([]);
        } finally {
            if (!silent) setLoadingExchanges(false);
        }
    }, [currentUserId, booksById]);

    const handleRateExchange = async (exchangeId, stars) => {
        await rateExchange(Number(exchangeId), Number(stars));
        setRatedExchangeIds((prev) => {
            const next = new Set(prev);
            next.add(Number(exchangeId));
            return next;
        });
    };

    const canClearHistory = useMemo(
        () => (exchangeItems || []).some((x) => (x?.status || '').toString().trim().toLowerCase() !== 'pending'),
        [exchangeItems]
    );

    const handleClearHistory = async () => {
        const ok = window.confirm('Очистить историю обменов? Активные (в ожидании) останутся.');
        if (!ok) return;
        try {
            await clearMyExchangeHistory();
            await reloadExchanges();
        } catch {
            alert('Не удалось очистить историю обменов. Проверьте сервер.');
            await reloadExchanges({ silent: true });
        }
    };

    useEffect(() => {
        if (activeTab !== 'exchanges' || !currentUserId) return;

        reloadExchanges();
        const intervalId = setInterval(() => {
            reloadExchanges({ silent: true });
        }, 7000);

        return () => clearInterval(intervalId);
    }, [activeTab, currentUserId, reloadExchanges]);

    const handleDeleteMyBook = async (book) => {
        if (!book?.id) return;
        const ok = window.confirm(`Удалить книгу "${book.title}"?`);
        if (!ok) return;

        try {
            await deleteBook(book.id);
            setMyBooks((prev) => prev.filter((b) => Number(b.id) !== Number(book.id)));
            setBooksCatalog((prev) => prev.filter((b) => Number(b.id) !== Number(book.id)));
            // комментарий важный ключевой
            await reloadExchanges({ silent: true });
        } catch {
            alert('Не удалось удалить книгу. Проверьте права и сервер.');
        }
    };

    const reloadAllBooks = async () => {
        const allBooks = await getAllBooks();
        setBooksCatalog(Array.isArray(allBooks) ? allBooks : []);
        const mine = Array.isArray(allBooks)
            ? allBooks.filter((b) => Number(b.ownerId) === Number(currentUserId))
            : [];
        setMyBooks(mine);
    };

    const handleAcceptExchange = async (exchangeId) => {
        try {
            await acceptExchangeRequest(exchangeId);
            await reloadAllBooks();
            await reloadExchanges();
        } catch {
            alert('Не удалось подтвердить обмен.');
            await reloadAllBooks();
            await reloadExchanges({ silent: true });
        }
    };

    const handleRejectExchange = async (exchangeId) => {
        try {
            await rejectExchangeRequest(exchangeId);
            await reloadExchanges();
        } catch {
            alert('Не удалось отказать в обмене.');
            await reloadExchanges({ silent: true });
        }
    };

    const handleCancelExchange = async (exchangeId) => {
        try {
            await cancelExchangeRequest(exchangeId);
            await reloadExchanges();
        } catch {
            alert('Не удалось отменить запрос на обмен.');
            await reloadExchanges({ silent: true });
        }
    };

    const initials = useMemo(() => {
        const name = (currentUser?.username || '').trim();
        if (!name) return '??';
        return name.slice(0, 2).toUpperCase();
    }, [currentUser?.username]);

    const renderContent = () => {
        switch (activeTab) {
            case 'exchanges':
                return (
                    <Exchanges
                        exchanges={exchangeItems}
                        isLoading={loadingExchanges}
                        error={exchangeError}
                        onAccept={handleAcceptExchange}
                        onReject={handleRejectExchange}
                        onCancel={handleCancelExchange}
                        onRate={handleRateExchange}
                        ratedExchangeIds={ratedExchangeIds}
                        onClearHistory={handleClearHistory}
                        canClearHistory={canClearHistory}
                        usersById={exchangeUsersById}
                    />
                );
            case 'favorites':
                return (
                    <Favorites
                        isLoggedIn={!!currentUserId}
                        currentUserId={currentUserId}
                        booksCatalog={booksCatalog}
                        favoritesTick={favoritesTick}
                    />
                );
            case 'books':
            default:
                return (
                    <MyBooks
                        books={myBooks}
                        isLoading={loadingBooks}
                        error={profileError}
                        onDelete={handleDeleteMyBook}
                    />
                );
        }
    };

    return (
        <div style={profileContainerStyle}>
            
            <div style={headerStyle}>
                
                <div style={userInfoStyle}>
                    <div style={avatarStyle}>
                        {currentUser?.profileImage ? (
                            <img src={currentUser.profileImage} alt="Аватар" style={avatarImgStyle} />
                        ) : (
                            initials
                        )}
                    </div> 
                    <div>
                        <h1 style={{color: primaryColor, margin: '0 0 5px 0'}}>
                            {currentUser?.username || 'Профиль'}
                        </h1>
                        <p style={{ margin: '0 0 6px 0', color: '#666' }}>
                            E-mail: {currentUser?.email || '—'}
                        </p>
                        <p style={{ margin: 0, color: '#666' }}>
                            Рейтинг: {Number(currentUser?.ratingCount || 0) > 0
                                ? `${Number(currentUser?.rating || 0).toFixed(1)} (${Number(currentUser?.ratingCount || 0)})`
                                : 'не совершал/а обменов'}
                        </p>
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

// вспомогательный компонент для
const TabButton = ({ title, tabKey, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(tabKey)} 
        style={tabKey === activeTab ? activeTabStyle : inactiveTabStyle}
    >
        {title}
    </button>
);


// стили профиля важный

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

const avatarImgStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
};

const myBooksListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '15px',
};

const myBookCardStyle = {
    backgroundColor: lightBackground,
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    border: '1px solid #e0e0e0',
};

const myBookTitleStyle = {
    fontWeight: 'bold',
    color: textColor,
    textDecoration: 'none',
    display: 'block',
};

const myBookMetaStyle = {
    margin: '4px 0 0 0',
    fontSize: '0.9em',
    color: '#666',
};

const myBookStatusStyle = {
    fontSize: '0.85em',
    fontWeight: 'bold',
    color: primaryColor,
    whiteSpace: 'nowrap',
};

const myBookActionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
};

const myBookEditLinkStyle = {
    padding: '8px 10px',
    borderRadius: '8px',
    border: `1px solid ${primaryColor}`,
    color: primaryColor,
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.85em',
    backgroundColor: 'white',
};

const myBookDeleteButtonStyle = {
    backgroundColor: errorColor,
    color: textColor,
    border: 'none',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85em',
    transition: 'background-color 0.2s',
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
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
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
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
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

// стили обменов важный

const listContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', 
    marginTop: '15px',
};

const favoriteRowStyle = {
    backgroundColor: lightBackground,
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    border: '1px solid #e0e0e0',
};

const favoriteAuthorButtonStyle = {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
};

const favoriteRowCompactStyle = {
    backgroundColor: 'rgba(253, 252, 247, 0.75)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    border: '1px solid rgba(224, 224, 224, 0.8)',
};

const favoriteRemoveButtonStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '9999px',
    border: '1px solid rgba(168, 157, 112, 0.55)',
    backgroundColor: 'rgba(253, 252, 247, 0.92)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    lineHeight: 1,
    color: 'red',
    boxShadow: '0 4px 10px rgba(0,0,0,0.10)',
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
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: darkBeigeColor,
    backgroundImage: 'linear-gradient(135deg, rgba(168, 157, 112, 0.22) 0%, rgba(168, 157, 112, 0.06) 60%, rgba(168, 157, 112, 0.00) 100%)',
    border: '1px solid rgba(168, 157, 112, 0.25)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const bookCoverFallbackStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
};

const bookCoverFallbackMarkStyle = {
    width: '70%',
    height: '45%',
    borderRadius: 8,
    backgroundColor: 'rgba(120, 120, 120, 0.18)',
    backgroundImage: 'linear-gradient(180deg, rgba(120, 120, 120, 0.22) 0%, rgba(120, 120, 120, 0.10) 100%)',
    filter: 'blur(0.6px)',
    opacity: 0.85,
};

const bookCoverStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
    display: 'block',
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

const bookOwnerStyle = {
    margin: '4px 0 0 0',
    fontSize: '0.78em',
    color: textColor,
    opacity: 0.72,
};

const exchangesHeaderRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
};

const clearHistoryButtonStyle = {
    border: `1px solid ${darkBeigeColor}`,
    backgroundColor: 'white',
    color: textColor,
    padding: '10px 12px',
    borderRadius: '10px',
    fontWeight: 600,
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

// стили бейджа статуса
const statusBadgeStyle = (status) => {
    const s = (status || '').toString().trim().toLowerCase();

    let backgroundColor = '#ccc';
    let color = textColor;
    let shadow = 'none';

    if (s === 'pending') {
        backgroundColor = '#fce29e';
        shadow = '0 2px 5px rgba(252, 226, 158, 0.5)';
    } else if (s === 'accepted') {
        backgroundColor = successColor;
        color = 'white';
    } else if (s === 'rejected' || s === 'cancelled') {
        backgroundColor = errorColor;
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

const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.1em',
    lineHeight: '30px',
    cursor: 'pointer',
    color: '#666',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
};