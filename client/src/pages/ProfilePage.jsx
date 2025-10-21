import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    // Временные данные
    const userBooks = [
        { id: 101, title: 'Преступление и наказание', status: 'На обмене' },
        { id: 102, title: 'Алиса в Стране чудес', status: 'Доступна' },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>👤 Личный кабинет и Моя библиотека</h1>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '30px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <h2>Привет, Пользователь!</h2>
                <p>Email: user@example.com</p>
                <p>Местоположение: Москва</p>
                <button style={{ padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', borderRadius: '4px' }}>Редактировать профиль</button>
                <button style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Выход</button>
            </div>

            <h2>📚 Мои книги на обмен</h2>
            
            {/* Кнопка для добавления книги (маршрут будет реализован позже) */}
            <Link to="/add-book" style={{ display: 'inline-block', padding: '10px 15px', backgroundColor: 'teal', color: 'white', textDecoration: 'none', borderRadius: '4px', marginBottom: '15px' }}>
                + Добавить новую книгу
            </Link>

            {/* Каркас для списка книг пользователя */}
            <div style={{ border: '1px solid #eee', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                {userBooks.map(book => (
                    <div key={book.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dotted #eee' }}>
                        <span style={{ fontWeight: 'bold' }}>{book.title}</span>
                        <div>
                            <span style={{ marginRight: '15px', color: book.status === 'На обмене' ? 'orange' : 'green' }}>Статус: {book.status}</span>
                            <button style={{ marginRight: '5px' }}>Редактировать</button>
                            <button>Удалить</button>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '20px' }}>
                <Link to="/">← На главную</Link>
            </p>
        </div>
    );
};

export default ProfilePage;