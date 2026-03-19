import React, { useEffect, useRef, useState } from 'react';
import { createBook } from '../api/bookApi'; // импорт функции для отправки книги
import { lookupCoverUrlByTitleAuthor } from '../api/coverApi';

// палитра важный ключевой
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 


// жанры состояния важный
const GENRES = [
    'Роман',
    'Фантастика',
    'Детектив',
    'Приключения',
    'Научная литература',
    'Детская',
    'Фэнтези',
    'Поэзия',
    'Другое'
];
const CONDITIONS = [
    'Новое',
    'Очень хорошее',
    'Хорошее',
    'Удовлетворительное',
    'Плохое'
];

export default function AddBook() {
    // состояние всех для
    const [bookData, setBookData] = useState({
        title: '',
        author: '',
        genre: GENRES[0],
        description: '',
        condition: CONDITIONS[0],
        coverUrl: '',
        status: 'available' // статус по умолчанию
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [coverTouched, setCoverTouched] = useState(false);
    const [coverLookupStatus, setCoverLookupStatus] = useState('');
    const lookupTimerRef = useRef(null);

    // обработчик изменений важный
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'coverUrl') {
            setCoverTouched(true);
        }
    };

    const handleCoverFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setBookData(prev => ({
                ...prev,
                coverUrl: String(reader.result || '')
            }));
            setCoverTouched(true);
        };
        reader.readAsDataURL(file);
    };

    const tryAutoFillCover = async ({ force } = { force: false }) => {
        const title = (bookData.title || '').trim();
        const author = (bookData.author || '').trim();

        if (title.length < 2 || author.length < 2) {
            if (force) setCoverLookupStatus('');
            return;
        }

        if (!force && coverTouched) return;

        setCoverLookupStatus('Ищу обложку...');
        const url = await lookupCoverUrlByTitleAuthor(title, author);
        if (url) {
            setBookData(prev => ({
                ...prev,
                coverUrl: url
            }));
            if (!force) setCoverTouched(false);
            setCoverLookupStatus('Обложка найдена и подставлена автоматически.');
        } else {
            setCoverLookupStatus('Обложку не удалось найти автоматически.');
        }
    };

    // авто подбора обложки
    useEffect(() => {
        if (lookupTimerRef.current) {
            clearTimeout(lookupTimerRef.current);
        }

        const title = (bookData.title || '').trim();
        const author = (bookData.author || '').trim();

        if (title.length < 2 || author.length < 2) {
            setCoverLookupStatus('');
            return;
        }

        if (coverTouched) return;

        lookupTimerRef.current = setTimeout(() => {
            tryAutoFillCover({ force: false });
        }, 650);

        return () => {
            if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
        };
        // комментарий важный ключевой
    }, [bookData.title, bookData.author, coverTouched]);

    // обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);



        try {
            // отправка данных важный
            const newBook = await createBook(bookData); 
            
            setMessage(`книга "${newBook.title}" успешно добавлена! id: ${newBook.id}`);
            
            // очистка формы после
            setBookData({
                title: '',
                author: '',
                genre: GENRES[0],
                description: '',
                condition: CONDITIONS[0],
                coverUrl: '',
                status: 'available'
            });
            setCoverTouched(false);
            setCoverLookupStatus('');

        } catch (error) {
            // обработка ошибки например
            let errorMessage = 'ошибка при добавлении книги. проверьте консоль.';
            if (error.response && error.response.status === 400) {
                errorMessage = 'ошибка: пользователь с таким id не найден. проверьте owner id.';
            }
            setMessage(errorMessage);
            setIsError(true);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={headerStyle}>Добавить книгу для обмена</h1>
                
                {/* сообщение об успехе/ошибке */}
                {message && (
                    <p style={{ ...messageStyle, color: isError ? 'red' : primaryColor }}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
                    {/* поле: название */}
                    <input
                        type="text"
                        name="title"
                        placeholder="название книги"
                        value={bookData.title}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    {/* поле: автор */}
                    <input
                        type="text"
                        name="author"
                        placeholder="автор"
                        value={bookData.author}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    {/* фото/обложка */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={labelStyle}>Фото / обложка (URL)</label>
                        <input
                            type="url"
                            name="coverUrl"
                            placeholder="вставьте ссылку на картинку (необязательно)"
                            value={bookData.coverUrl}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
                            <label style={fileLabelStyle}>
                                Загрузить фото
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => tryAutoFillCover({ force: true })}
                                style={secondaryButtonStyle}
                            >
                                Подобрать автоматически
                            </button>
                        </div>
                        {coverLookupStatus ? (
                            <div style={{ marginTop: 8, color: '#666', fontSize: '0.9em' }}>
                                {coverLookupStatus}
                            </div>
                        ) : null}
                        {bookData.coverUrl ? (
                            <div style={{ marginTop: 12 }}>
                                <div style={{ marginBottom: 8, color: '#666', fontSize: '0.9em' }}>Предпросмотр:</div>
                                <img
                                    src={bookData.coverUrl}
                                    alt="Обложка"
                                    style={coverPreviewStyle}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* поле: жанр (select) */}
                    <select
                        name="genre"
                        value={bookData.genre}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        {GENRES.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>

                    {/* поле: описание */}
                    <textarea
                        name="description"
                        placeholder="краткое описание"
                        value={bookData.description}
                        onChange={handleChange}
                        required
                        style={{...inputStyle, height: '100px'}}
                    />

                    {/* поле: состояние (select) */}
                    <select
                        name="condition"
                        value={bookData.condition}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        {CONDITIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>



                    {/* поле: статус (скрыто, по умолчанию 'available') */}
                    <input
                        type="hidden"
                        name="status"
                        value={bookData.status}
                    />

                    <button type="submit" style={buttonStyle}>
                        Добавить книгу
                    </button>
                </form>
            </div>
        </div>
    );
}

// стили важный ключевой
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh', 
};

const cardStyle = {
    backgroundColor: darkBeigeColor,
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
};

const headerStyle = {
    color: primaryColor,
    marginBottom: '30px',
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
};

const inputStyle = {
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
    backgroundColor: 'white',
};

const labelStyle = {
    display: 'block',
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#666',
};

const fileLabelStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: 6,
    border: `1px solid ${primaryColor}`,
    color: primaryColor,
    background: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const secondaryButtonStyle = {
    padding: '10px 14px',
    borderRadius: 6,
    border: `1px solid ${primaryColor}`,
    color: primaryColor,
    background: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const coverPreviewStyle = {
    width: '100%',
    maxHeight: 260,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.08)',
};

const buttonStyle = {
    backgroundColor: primaryColor,
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
};

const messageStyle = {
    marginBottom: '15px',
    fontWeight: 'bold',
};