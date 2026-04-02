import React, { useState } from 'react';
import { createBook } from '../api/bookApi'; // импорт функции для отправки книги

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