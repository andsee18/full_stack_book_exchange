import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    // Временные данные
    const userBooks = [
        { id: 101, title: 'Преступление и наказание' },
        { id: 102, title: 'Алиса в Стране чудес' },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>👤 Личный кабинет и Моя библиотека</h1>
            
            <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '30px' }}>
                <h2>Привет, Пользователь!</h2>
                <p>Email: user@example.com</p>
                <button style={{ padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}>Редактировать профиль</button>
                <button style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>Выход</button>
            </div>

            <h2>Мои книги на обмен (В разработке)</h2>
            <Link to="/add-book" style={{ display: 'inline-block', padding: '10px 15px', backgroundColor: 'teal', color: 'white', textDecoration: 'none', borderRadius: '4px', marginBottom: '15px' }}>
                + Добавить новую книгу
            </Link>

            {/* Каркас для списка книг пользователя */}
            <div style={{ border: '1px solid #eee', padding: '15px' }}>
                {userBooks.map(book => (
                    <div key={book.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dotted #eee' }}>
                        <span>{book.title}</span>
                        <div>
                            <button style={{ marginRight: '5px' }}>Редактировать</button>
                            <button>Удалить</button>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '20px' }}>
                <Link to="/">На главную</Link>
            </p>
        </div>
    );
};

export default ProfilePage;