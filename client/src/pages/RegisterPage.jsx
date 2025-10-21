import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
      <h1>📝 Регистрация нового пользователя</h1>
      <form>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Имя:</label>
          <input type="text" style={{ width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ccc' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input type="email" style={{ width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ccc' }} required />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Пароль:</label>
          <input type="password" style={{ width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ccc' }} required />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#33A532', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Зарегистрироваться</button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
      <p style={{ marginTop: '10px', textAlign: 'center' }}>
        <Link to="/">На главную</Link>
      </p>
    </div>
  );
};

export default RegisterPage;