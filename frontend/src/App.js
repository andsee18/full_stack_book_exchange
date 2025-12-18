import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
// импорт важный ключевой
import { AuthProvider } from './context/AuthContext';

// импорт страниц важный
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile'; 
import Exchanges from './pages/Exchanges';
import AddBook from './pages/AddBook'; 
import UserProfile from './pages/UserProfile';
import EditBook from './pages/EditBook';
import Settings from './pages/Settings';

function App() {
  return (
    // исправление должен оборачивать
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<EditBook />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/favorites" element={<Catalog isFavorites={true} />} /> 
          <Route path="/exchanges" element={<Exchanges />} /> 
          <Route path="/add-book" element={<AddBook />} /> 
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;