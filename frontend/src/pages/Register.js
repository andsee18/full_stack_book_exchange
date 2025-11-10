import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Бежевая палитра для единообразия ---
const primaryColor = '#a89d70';   
const darkBeigeColor = '#eae7dd'; 

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            alert('Пароли не совпадают!');
            return;
        }
        console.log('Register attempt:', { name, email, password });
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={headerStyle}>Регистрация</h1>
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    
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

                <p style={footerTextStyle}>
                    Уже есть аккаунт? <Link to="/login" style={linkStyle}>Войти</Link>
                </p>
            </div>
        </div>
    );
}

// --- Стили ---
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