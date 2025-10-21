import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BookDetailsPage = () => {
    // Получаем динамический ID книги из URL (например, /book/42)
    const { bookId } = useParams();

    // Временные данные для демонстрации
    const book = {
        id: bookId,
        title: 'Унесённые ветром',
        author: 'Маргарет Митчелл',
        owner: 'Ольга П. (Москва)',
        condition: 'Хорошее',
        description: 'Классический роман, прочитан один раз.'
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
            <Link to="/">← Назад к ленте</Link>
            
            <h1 style={{ marginTop: '20px' }}>📖 {book.title}</h1>
            
            <div style={{ display: 'flex', gap: '40px', marginTop: '30px' }}>
                {/* Левая колонка: Обложка и действие */}
                <div style={{ flexShrink: 0 }}>
                    <img src="https://via.placeholder.com/300x450?text=Обложка" alt={`Обложка ${book.title}`} style={{ display: 'block', marginBottom: '20px' }} />
                    <button 
                        style={{ padding: '15px 25px', backgroundColor: 'green', color: 'white', border: 'none', fontSize: '1.1em', cursor: 'pointer' }}
                        // Эта логика будет реализована в следующих ЛР
                        onClick={() => alert(`Запрос на обмен книги ${book.title} отправлен!`)}
                    >
                        Запросить обмен
                    </button>
                </div>

                {/* Правая колонка: Детали */}
                <div>
                    <h2>Информация о книге</h2>
                    <p><strong>Автор:</strong> {book.author}</p>
                    <p><strong>Владелец:</strong> {book.owner}</p>
                    <p><strong>Состояние:</strong> {book.condition}</p>
                    
                    <h3 style={{ marginTop: '20px' }}>Описание</h3>
                    <p>{book.description}</p>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsPage;