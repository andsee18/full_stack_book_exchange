import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="page-container">
      <h1>кнги</h1>
      <form>
        {/* Здесь будет форма для ввода данных */}
        <p>ляляляляляляля.</p>
      </form>
      <p>Нет ? <Link to="/register">Зарегистрироваться</Link></p>
    </div>
  );
};

export default LoginPage;