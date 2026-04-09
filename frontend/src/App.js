import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
// импорт важный ключевой
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

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
import AdminPanel from './pages/AdminPanel'; // импорт панели

import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole'; // Import RequireRole

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route
              path="/books/:id/edit"
              element={
                <RequireAuth>
                  <EditBook />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/favorites" element={<Catalog isFavorites={true} />} />
            <Route
              path="/exchanges"
              element={
                <RequireAuth>
                  <Exchanges />
                </RequireAuth>
              }
            />
            <Route
              path="/add-book"
              element={
                <RequireAuth>
                  <AddBook />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireRole role="ADMIN">
                     <AdminPanel />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;