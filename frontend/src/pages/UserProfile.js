import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserById } from '../api/userApi';
import { getAllBooks } from '../api/BookApi';

const primaryColor = '#a89d70';
const darkBeigeColor = '#eae7dd';
const textColor = '#3c3838';
const lightBackground = '#fdfcf7';

const normalizeStatus = (status) => (status || '').toString().trim().toLowerCase();

export default function UserProfile() {
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [books, setBooks] = useState([]);

    const userId = useMemo(() => {
        const n = Number(id);
        return Number.isFinite(n) ? n : null;
    }, [id]);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            if (!userId) {
                setError('Некорректный ID пользователя.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const [u, allBooks] = await Promise.all([
                    getUserById(userId),
                    getAllBooks(),
                ]);

                if (!isActive) return;

                setProfileUser(u);
                const availableBooks = Array.isArray(allBooks)
                    ? allBooks.filter((b) => Number(b?.ownerId) === Number(userId) && normalizeStatus(b?.status) === 'available')
                    : [];
                setBooks(availableBooks);
            } catch (e) {
                if (!isActive) return;
                if (e?.response?.status === 404) {
                    setError('Пользователь не найден.');
                } else {
                    setError('Не удалось загрузить профиль пользователя. Проверьте сервер.');
                }
                setProfileUser(null);
                setBooks([]);
            } finally {
                if (!isActive) return;
                setIsLoading(false);
            }
        };

        load();
        return () => {
            isActive = false;
        };
    }, [userId]);

    const initials = useMemo(() => {
        const name = (profileUser?.username || '').trim();
        if (!name) return '??';
        return name.slice(0, 2).toUpperCase();
    }, [profileUser?.username]);

    const ratingCount = Number(profileUser?.ratingCount || 0);
    const ratingValue = profileUser?.rating;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32, background: lightBackground, minHeight: 'calc(100vh - 120px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h1 style={{ margin: 0, color: textColor }}>Профиль пользователя</h1>
                <Link to="/" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 'bold' }}>← В каталог</Link>
            </div>

            {isLoading ? (
                <p>Загрузка...</p>
            ) : error ? (
                <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: `1px solid ${darkBeigeColor}` }}>
                    <p style={{ margin: 0, color: '#b00', fontWeight: 'bold' }}>{error}</p>
                </div>
            ) : !profileUser ? (
                <p>Пользователь не найден.</p>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${darkBeigeColor}`, marginBottom: 22 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: darkBeigeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: textColor, fontSize: 22, overflow: 'hidden' }}>
                            {profileUser.profileImage ? (
                                <img src={profileUser.profileImage} alt="Аватар" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            ) : (
                                initials
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                                <h2 style={{ margin: 0, color: primaryColor }}>{profileUser.username}</h2>
                                {profileUser.location ? (
                                    <span style={{ color: '#666' }}>{profileUser.location}</span>
                                ) : null}
                            </div>
                            <div style={{ marginTop: 6, color: '#555' }}>
                                <div>Почта: {profileUser.email || '—'}</div>
                                <div>
                                    Рейтинг:{' '}
                                    {ratingCount > 0
                                        ? `${Number(ratingValue || 0).toFixed(1)} (${ratingCount})`
                                        : 'не совершал/а обменов'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${darkBeigeColor}` }}>
                        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Книги для обмена ({books.length})</h3>
                        {books.length === 0 ? (
                            <p style={{ margin: 0, color: '#666' }}>Нет доступных книг для обмена.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                                {books.map((b) => (
                                    <div key={b.id} style={{ padding: 14, borderRadius: 14, border: `1px solid ${darkBeigeColor}`, background: lightBackground }}>
                                        <Link to={`/books/${b.id}`} style={{ display: 'block', color: textColor, fontWeight: 'bold', textDecoration: 'none', marginBottom: 6 }}>
                                            {b.title}
                                        </Link>
                                        <div style={{ color: '#666', fontSize: 14 }}>{b.author}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
