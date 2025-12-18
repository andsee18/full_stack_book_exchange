import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi'; // <-- Убедитесь, что этот путь правильный

// бежевая палитра для
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 

export default function Register() {
    // изменяем чтобы соответствовать
    const [username, setUsername] = useState(''); 
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState(''); // Добавлено поле location
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState(''); 
    const [profileImage, setProfileImage] = useState(null); // data URL (optional)
    const navigate = useNavigate();
    
    // внимание поле важный

    const handleSubmit = async (e) => { // <-- Обязательно 'async'
        e.preventDefault();
        
        // логирование диагностики для
        console.log('--- STARTING SUBMIT ---'); 
        
        setMessage('');

        if (password !== passwordConfirm) {
            setMessage('Ошибка: Пароли не совпадают!');
            console.error('Password mismatch');
            return;
        }

        try {
            // данные отправки для
            const userData = {
                username: username,
                password: password,
                email: email,
                location: location,
                rating: 5.0, // Устанавливаем базовый рейтинг
                profileImage: profileImage // optional
            };
            
            console.log('Data sent to API:', userData); // Логируем отправляемые данные

            const newUser = await registerUser(userData); // <-- Вызов API

            // запрос успешен если
            setMessage(`Успешная регистрация! ID: ${newUser.id}`);
            
            // очистка формы важный
            setUsername('');
            setEmail('');
            setLocation('');
            setPassword('');
            setPasswordConfirm('');
            setProfileImage(null);

            // после успешной регистрации
            navigate('/', { replace: true });

        } catch (error) {
            // обработка ошибок важный
            setMessage('Ошибка регистрации. Проверьте консоль браузера и терминал бэкенда.');
            console.error('Registration error details:', error);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={headerStyle}>Регистрация</h1>
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* Поле Имя пользователя (username) */}
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    {/* Поле Почта (email) */}
                    <input
                        type="email"
                        placeholder="Почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    {/* Поле Местоположение (location) */}
                    <input
                        type="text"
                        placeholder="Местоположение (город)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    {/* Фото профиля (необязательно) */}
                    <div style={fileFieldStyle}>
                        <label style={fileLabelStyle}>
                            Фото профиля (необязательно)
                        </label>
                        <label style={chooseFileButtonStyle}>
                            Выберите файл
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files && e.target.files[0];
                                    if (!file) {
                                        setProfileImage(null);
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => setProfileImage(String(reader.result));
                                    reader.readAsDataURL(file);
                                }}
                                style={hiddenFileInputStyle}
                            />
                        </label>

                        {profileImage ? (
                            <div style={previewWrapStyle}>
                                <img src={profileImage} alt="Фото профиля" style={previewImgStyle} />
                            </div>
                        ) : null}
                    </div>

                    {/* Поле Пароль */}
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    {/* Поле Подтверждение пароля */}
                    <input
                        type="password"
                        placeholder="Подтвердите пароль"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <button type="submit" style={buttonStyle}>
                        Зарегистрироваться
                    </button>
                </form>
                
                {/* Сообщение об успехе или ошибке */}
                {message && (
                    <p style={{ marginTop: '15px', color: message.startsWith('Успешная') ? primaryColor : 'red' }}>
                        {message}
                    </p>
                )}

                <p style={footerTextStyle}>
                    Уже есть аккаунт? <Link to="/login" style={linkStyle}>Войти</Link>
                </p>
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
    maxWidth: '400px',
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


const footerTextStyle = {
    marginTop: '20px',
    fontSize: '0.9em',
};

const linkStyle = {
    color: primaryColor,
    textDecoration: 'none',
    fontWeight: 'bold',
};

const fileFieldStyle = {
    textAlign: 'left',
};

const fileLabelStyle = {
    display: 'block',
    fontSize: '0.9em',
    color: '#666',
    marginBottom: '6px',
};

const hiddenFileInputStyle = {
    display: 'none',
};

const chooseFileButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '42px',
    borderRadius: '8px',
    border: '1px solid rgba(168, 157, 112, 0.55)',
    backgroundColor: 'white',
    color: primaryColor,
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
};

const previewWrapStyle = {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
};

const previewImgStyle = {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(168, 157, 112, 0.35)',
};