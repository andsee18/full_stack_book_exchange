import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';

// Импорт страниц
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile'; 
import Exchanges from './pages/Exchanges'; // <-- Добавлен импорт новой страницы

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/favorites" element={<Catalog isFavorites={true} />} /> 
        <Route path="/exchanges" element={<Exchanges />} /> {/* <-- Обновлен маршрут */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;