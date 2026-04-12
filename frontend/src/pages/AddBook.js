import React, { useState } from 'react';
import { createBook, searchGoogleBooks } from '../api/bookApi';
import { Helmet } from 'react-helmet-async';

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
        status: 'available'
    });
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // обработчик изменений важный
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCoverFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setCoverPreview(String(reader.result || ''));
        };
        reader.readAsDataURL(file);
    };

    // обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            const formData = new FormData();
            // добавляем объект книги типом
            formData.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));

            if (coverFile) {
                formData.append('cover', coverFile);
            }

            const newBook = await createBook(formData);

            setMessage(`книга "${newBook.title}" успешно добавлена!`);

            setBookData({
                title: '',
                author: '',
                genre: GENRES[0],
                description: '',
                condition: CONDITIONS[0],
                status: 'available'
            });
            setCoverFile(null);
            setCoverPreview('');

        } catch (error) {
            let errorMessage = 'ошибка при добавлении книги.';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') errorMessage = error.response.data;
                else if (error.response.data.message) errorMessage = error.response.data.message;
            }
            setMessage(errorMessage);
            setIsError(true);
        }
    };

    const handleGoogleSearch = async () => {
        if (!bookData.title) return;
        setIsSearching(true);
        try {
            const results = await searchGoogleBooks(bookData.title);
            setSearchResults(results);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectGoogleBook = (gBook) => {
        const info = gBook.volumeInfo;

        const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';

        setBookData({
            ...bookData,
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : '',
            description: info.description || '',
            genre: (info.categories && GENRES.includes(info.categories[0])) ? info.categories[0] : GENRES[0],
            coverUrl: coverUrl
        });

        if (coverUrl) {
           setCoverPreview(coverUrl);
        }

        setSearchResults([]);
    };

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Добавить книгу - BookExchange</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div style={cardStyle}>
                <h1 style={headerStyle}>Добавить книгу для обмена</h1>
                
                {/* поиск в Google Books */}
                <div style={{ marginBottom: 20, textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="text"
                            placeholder="поиск по названию для автозаполнения"
                            value={bookData.title}
                            onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={handleGoogleSearch}
                            disabled={isSearching}
                            style={{ ...buttonStyle, marginTop: 0, width: 'auto', padding: '0 15px' }}
                        >
                            {isSearching ? '...' : 'Найти'}
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <ul style={{
                            listStyle: 'none',
                            padding: 10,
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            marginTop: 5,
                            backgroundColor: 'white',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {searchResults.map(b => (
                                <li key={b.id} onClick={() => selectGoogleBook(b)} style={{
                                    padding: '5px 0',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    fontSize: '0.9em'
                                }}>
                                    <strong>{b.volumeInfo.title}</strong> - {b.volumeInfo.authors?.join(', ')}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

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
                        <label style={labelStyle}>обложка книги:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileChange}
                            style={fileInputStyle}
                        />

                        {coverPreview && (
                            <div style={previewContainerStyle}>
                                <img src={coverPreview} alt="Предпросмотр" style={previewImageStyle} />
                            </div>
                        )}
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

const fileInputStyle = {
    marginBottom: '15px',
    width: '100%',
};

const previewContainerStyle = {
    marginTop: '10px',
    marginBottom: '15px',
    textAlign: 'center'
};

const previewImageStyle = {
    maxWidth: '150px',
    maxHeight: '200px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
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