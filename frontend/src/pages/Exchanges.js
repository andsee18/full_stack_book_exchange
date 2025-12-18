import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllBooks } from '../api/BookApi';
import { getUserById } from '../api/userApi';
import { getMyRatedExchangeIds, rateExchange } from '../api/ratingApi';
import {
    acceptExchangeRequest,
    cancelExchangeRequest,
    getIncomingExchangeRequests,
    getOutgoingExchangeRequests,
    rejectExchangeRequest,
} from '../api/exchangeApi';

// бежевая палитра для
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 
const textColor = '#3c3838';      
const lightBackground = '#fdfcf7';

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

// вспомогательный компонент для
const ExchangeBookItem = ({ book, userLabel, isYours }) => (
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
            {userLabel ? (
                <p style={bookOwnerStyle}>
                    {userLabel}{isYours ? ' (ваша книга)' : ''}
                </p>
            ) : null}
        </div>
    </div>
);

// основной компонент элемента
const ExchangeItem = ({ exchange }) => {
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
            exchange.onReject?.(exchange.id);
        } else {
            exchange.onCancel?.(exchange.id);
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
        <div style={itemContainerStyle}>
            
            {/* 1. Верхняя книга (Предложенная) */}
            <ExchangeBookItem
                book={exchange.bookOffered}
                userLabel={exchange.bookOfferedUserLabel}
                isYours={exchange.bookOfferedIsYours}
            />
            
            {/* Разделитель с иконкой обмена */}
            <div style={separatorStyle}>
                <span style={exchangeIconStyle}>⟲</span>
            </div>
            
            {/* 2. Нижняя книга (Запрашиваемая) */}
            <ExchangeBookItem
                book={exchange.bookRequested}
                userLabel={exchange.bookRequestedUserLabel}
                isYours={exchange.bookRequestedIsYours}
            />
            
            {/* 3. Статус */}
            <div style={statusBadgeStyle(exchange.status)}>
                {formatExchangeStatusRu(exchange.status)}
            </div>

            {/* 4. Кнопки действий (только для входящих) */}
            {canAccept && (
                <div style={actionButtonsContainerStyle}>
                    <button
                        style={{ ...confirmButtonStyle, backgroundColor: isConfirmHovered ? '#9fd0a3' : confirmButtonStyle.backgroundColor }}
                        onMouseEnter={() => setIsConfirmHovered(true)}
                        onMouseLeave={() => setIsConfirmHovered(false)}
                        onClick={() => exchange.onAccept?.(exchange.id)}
                    >
                        Подтвердить обмен
                    </button>
                </div>
            )}
            
            {/* Крестик: отклонить (incoming) или отменить (outgoing) */}
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

// главный компонент страницы
export default function Exchanges() {
    const { user } = useAuth();
    const isLoggedIn = !!user;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [booksCatalog, setBooksCatalog] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [exchangeUsersById, setExchangeUsersById] = useState({});
    const [ratedExchangeIds, setRatedExchangeIds] = useState(new Set());

    const booksById = useMemo(() => {
        const map = new Map();
        (booksCatalog || []).forEach((b) => {
            if (b?.id != null) map.set(Number(b.id), b);
        });
        return map;
    }, [booksCatalog]);

    const exchanges = useMemo(() => {
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
            bookOfferedUserLabel: isIncoming
                ? (exchangeUsersById?.[Number(r.requesterId)] || `Пользователь #${r.requesterId}`)
                : 'Вы',
            bookRequestedUserLabel: isIncoming
                ? 'Вы'
                : (exchangeUsersById?.[Number(r.recipientId)] || `Пользователь #${r.recipientId}`),
            isRated: ratedExchangeIds?.has?.(Number(r.id)),
        });

        const merged = [
            ...(Array.isArray(incomingRequests) ? incomingRequests.map((r) => normalize(r, true)) : []),
            ...(Array.isArray(outgoingRequests) ? outgoingRequests.map((r) => normalize(r, false)) : []),
        ];
        merged.sort((a, b) => Number(b.id) - Number(a.id));
        return merged;
    }, [booksById, incomingRequests, outgoingRequests, exchangeUsersById, ratedExchangeIds]);

    const handleRate = async (exchangeId, stars) => {
        await rateExchange(Number(exchangeId), Number(stars));
        setRatedExchangeIds((prev) => {
            const next = new Set(prev);
            next.add(Number(exchangeId));
            return next;
        });
    };

    const reload = async (options = {}) => {
        if (!isLoggedIn) return;

        const silent = !!options?.silent;
        if (!silent) setIsLoading(true);
        setError(null);
        try {
            const [incoming, outgoing, allBooks, rated] = await Promise.all([
                getIncomingExchangeRequests(),
                getOutgoingExchangeRequests(),
                getAllBooks(),
                getMyRatedExchangeIds().catch(() => []),
            ]);

            setRatedExchangeIds(
                new Set((Array.isArray(rated) ? rated : []).map((x) => Number(x)).filter((x) => Number.isFinite(x)))
            );

            // комментарий важный ключевой
            const involvedUserIds = new Set();
            (Array.isArray(incoming) ? incoming : []).forEach((r) => {
                if (r?.requesterId != null) involvedUserIds.add(Number(r.requesterId));
                if (r?.recipientId != null) involvedUserIds.add(Number(r.recipientId));
            });
            (Array.isArray(outgoing) ? outgoing : []).forEach((r) => {
                if (r?.requesterId != null) involvedUserIds.add(Number(r.requesterId));
                if (r?.recipientId != null) involvedUserIds.add(Number(r.recipientId));
            });

            const missingUserIds = Array.from(involvedUserIds).filter((id) => !exchangeUsersById?.[id]);
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

            setBooksCatalog(Array.isArray(allBooks) ? allBooks : []);
            setIncomingRequests(Array.isArray(incoming) ? incoming : []);
            setOutgoingRequests(Array.isArray(outgoing) ? outgoing : []);
        } catch (e) {
            setError('Не удалось загрузить обмены. Проверьте сервер.');
            if (!silent) {
                setIncomingRequests([]);
                setOutgoingRequests([]);
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) return;

        reload();
        const intervalId = setInterval(() => {
            reload({ silent: true });
        }, 7000);

        return () => clearInterval(intervalId);
        // комментарий важный ключевой
    }, [isLoggedIn]);

    const handleAccept = async (id) => {
        try {
            await acceptExchangeRequest(id);
            await reload();
        } catch {
            alert('Не удалось подтвердить обмен.');
            await reload({ silent: true });
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectExchangeRequest(id);
            await reload();
        } catch {
            alert('Не удалось отказать в обмене.');
            await reload({ silent: true });
        }
    };

    const handleCancel = async (id) => {
        try {
            await cancelExchangeRequest(id);
            await reload();
        } catch {
            alert('Не удалось отменить запрос на обмен.');
            await reload({ silent: true });
        }
    };

    return (
        <div style={pageContainerStyle}>
            
            <Link to="/" style={backLinkStyle}>&larr; Назад</Link>
            
            {!isLoggedIn ? (
                <p style={{ marginTop: '20px' }}>Войдите в аккаунт, чтобы увидеть обмены.</p>
            ) : isLoading ? (
                <p style={{ marginTop: '20px' }}>Загрузка...</p>
            ) : error ? (
                <p style={{ marginTop: '20px', color: 'red' }}>{error}</p>
            ) : exchanges.length === 0 ? (
                <p style={{ marginTop: '20px' }}>Пока нет активных обменов.</p>
            ) : (
                <div style={listContainerStyle}>
                    {exchanges.map((exchange) => (
                        <ExchangeItem
                            key={exchange.id}
                            exchange={{
                                ...exchange,
                                onAccept: handleAccept,
                                onReject: handleReject,
                                onCancel: handleCancel,
                                onRate: handleRate,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// стили важный ключевой

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

// стили контейнера одного
const itemContainerStyle = {
    backgroundColor: darkBeigeColor, 
    borderRadius: '10px',
    padding: '15px 20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    position: 'relative',
};

// стили одной для
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

const bookOwnerStyle = {
    margin: '4px 0 0 0',
    fontSize: '0.8em',
    color: textColor,
    opacity: 0.72,
};

// стили разделителя важный
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

// стили бейджа статуса
const statusBadgeStyle = (status) => {
    const s = (status || '').toString().trim().toLowerCase();

    let backgroundColor = '#ccc';
    let color = textColor;

    if (s === 'pending') {
        backgroundColor = '#fce4a6';
    } else if (s === 'accepted') {
        backgroundColor = '#c8d3b0';
    } else if (s === 'rejected' || s === 'cancelled') {
        backgroundColor = '#ff8a8a';
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

// стили кнопок действий
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