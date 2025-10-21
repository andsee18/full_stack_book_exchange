// client/src/main.jsx

import React from 'react'; // React нужно импортировать явно для JSX
import ReactDOM from 'react-dom/client';
// 1. Импортируем компоненты React Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// 2. Импортируем все наши страницы из папки pages
import HomePage from './pages/HomePage.jsx'; 
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BookDetailsPage from './pages/BookDetailsPage.jsx';

// 3. Определение маршрутов (Routes)
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />, // Главная страница
  },
  {
    path: "/login",
    element: <LoginPage />, // Вход
  },
  {
    path: "/register",
    element: <RegisterPage />, // Регистрация
  },
  {
    path: "/profile",
    element: <ProfilePage />, // Личный кабинет
  },
  {
    // Динамический маршрут: /book/42
    path: "/book/:bookId", 
    element: <BookDetailsPage />, 
  },
]);

// 4. Внедрение роутера в приложение
// Используем ReactDOM.createRoot из импорта для рендеринга
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* RouterProvider предоставляет роутер всему приложению */}
    <RouterProvider router={router} />
  </React.StrictMode>,
);