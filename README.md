# Book Exchange Full Stack
Проект для обмена книгами, реализованный на **Spring Boot** и **React**. Пользователи могут добавлять свои книги, искать интересные экземпляры и предлагать обмен.
## Стек технологий
- **Backend**: Java 21, Spring Boot 3, SQLite
- **Frontend**: React, Axios, React Router, React Helmet Async (SEO)
- **Storage**: S3 (LocalStack в Docker) для хранения обложек книг
- **Auth**: JWT (Access + Refresh токены) с ролями
- **API**: Интеграция с Open Library API для автозаполнения данных о книгах
## Функционал
- **Каталог**: Поиск, фильтрация по жанру и состоянию, пагинация.
- **Обмен**: Система заявок на обмен между пользователями.
- **Личный кабинет**: Профиль пользователя, управление книгами и обзорами.
- **Админка**: Управление ролями и пользователями (доступно только ADMIN).
- **SEO**: Динамические мета-теги, JSON-LD микроразметка, генерация Sitemap и Robots.txt.
## Запуск проекта
### 1. Подготовка окружения (S3)
Для работы загрузки картинок используйте LocalStack. Запустите его через Docker:
`ash
docker-compose up -d
`
### 2. Запуск бэкенда (Spring Boot)
`ash
cd bookexchange_backend
.\mvnw.cmd spring-boot:run
`
Сервер будет доступен на http://localhost:5000.
### 3. Запуск фронтенда (React)
`ash
cd frontend
npm install
npm start
`
Приложение откроется на http://localhost:3000.
## Тестовые данные (Role-Based Access)
- **Админ**: admin / admin123 (имеет доступ к панели управления)
- **Пользователь**: user / user123 (базовый функционал обмена)