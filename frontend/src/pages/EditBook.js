import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getBookById, updateBook } from '../api/bookApi';

const primaryColor = '#a89d70';
const darkBeigeColor = '#eae7dd';

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

export default function EditBook() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isBackHovered, setIsBackHovered] = useState(false);

    const [bookData, setBookData] = useState({
        title: '',
        author: '',
        genre: GENRES[0],
        description: '',
        condition: CONDITIONS[0],
        coverUrl: '',
        status: 'available'
    });

    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            setLoading(true);
            setMessage('');
            setIsError(false);

            try {
                const b = await getBookById(id);
                if (!isActive) return;

                setBookData({
                    title: b?.title || '',
                    author: b?.author || '',
                    genre: b?.genre || GENRES[0],
                    description: b?.description || '',
                    condition: b?.condition || CONDITIONS[0],
                    coverUrl: b?.coverUrl || '',
                    status: b?.status || 'available'
                });
            } catch (e) {
                if (!isActive) return;
                setMessage('Не удалось загрузить данные книги.');
                setIsError(true);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        load();
        return () => {
            isActive = false;
        };
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setBookData(prev => ({
                ...prev,
                coverUrl: String(reader.result || '')
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            const formData = new FormData();

            // создаем объект книги без лишних полей для бэкенда
            const bookToSend = {
                title: bookData.title,
                author: bookData.author,
                genre: bookData.genre,
                description: bookData.description,
                condition: bookData.condition,
                status: bookData.status,
                coverUrl: bookData.coverUrl // сохраняем старый урл если файл не выбран
            };

            formData.append('book', new Blob([JSON.stringify(bookToSend)], { type: 'application/json' }));

            if (selectedFile) {
                formData.append('cover', selectedFile);
            }

            const updated = await updateBook(id, formData);
            setMessage(`Книга "${updated.title}" обновлена.`);
            setIsError(false);
            setTimeout(() => navigate(`/books/${id}`), 400);
        } catch (err) {
            if (err?.response?.status === 403) {
                setMessage('Нет прав на редактирование этой книги.');
            } else if (err?.response?.status === 401) {
                setMessage('Сессия истекла. Войдите в аккаунт заново.');
            } else {
                setMessage('Не удалось обновить книгу.');
            }
            setIsError(true);
        }
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h1 style={headerStyle}>Загрузка...</h1>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={headerStackStyle}>
                    <h1 style={{ ...headerStyle, marginBottom: 0, textAlign: 'center' }}>Редактировать книгу</h1>
                    <div style={headerSubRowStyle}>
                        <Link
                            to={`/books/${id}`}
                            style={{
                                ...backButtonStyle,
                                backgroundColor: isBackHovered ? primaryColor : 'white',
                                color: isBackHovered ? 'white' : primaryColor,
                                borderColor: isBackHovered ? primaryColor : 'rgba(168, 157, 112, 0.55)',
                                transform: isBackHovered ? 'translateY(-1px)' : 'translateY(0)',
                                boxShadow: isBackHovered ? `0 5px 12px ${primaryColor}40` : 'none',
                            }}
                            onMouseEnter={() => setIsBackHovered(true)}
                            onMouseLeave={() => setIsBackHovered(false)}
                        >
                            ← Назад
                        </Link>
                    </div>
                </div>

                {message ? (
                    <p style={{ ...messageStyle, color: isError ? 'red' : primaryColor }}>{message}</p>
                ) : null}

                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        type="text"
                        name="title"
                        placeholder="название книги"
                        value={bookData.title}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        name="author"
                        placeholder="автор"
                        value={bookData.author}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

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
                        </div>
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

                    <textarea
                        name="description"
                        placeholder="краткое описание"
                        value={bookData.description}
                        onChange={handleChange}
                        required
                        style={{ ...inputStyle, height: '100px' }}
                    />

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

                    <button type="submit" style={buttonStyle}>
                        Сохранить
                    </button>
                </form>
            </div>
        </div>
    );
}

const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
};

const cardStyle = {
    backgroundColor: darkBeigeColor,
    padding: '22px 40px 40px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '520px',
    textAlign: 'center',
};

const headerStyle = {
    color: primaryColor,
    marginBottom: '18px',
    lineHeight: 1.1,
};

const headerStackStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 16,
};

const headerSubRowStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
};

const backButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease-out',
    padding: '10px 14px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '1.02em',
    lineHeight: 1,
    border: '1px solid rgba(168, 157, 112, 0.55)',
    width: 'fit-content',
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


const coverPreviewStyle = {
    width: '100%',
    maxHeight: 260,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.08)',
};
