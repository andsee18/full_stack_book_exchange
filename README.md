# Book Exchange Full Stack
Платформа для обмена книгами, написанная на **Spring Boot** и **React**. Пользователи могут выставлять свои книги, искать интересные экземпляры и предлагать обмен.
## Стек технологий
- **Backend**: Java 21, Spring Boot 3, SQLite
- **Frontend**: React, Axios, React Router
- **Storage**: S3 (LocalStack в Docker) для хранения обложек книг
- **Auth**: JWT (Access + Refresh токены) с ротацией
## Возможности
- **Каталог**: Поиск, фильтрация по жанрам и состоянию, пагинация.
- **Обмен**: Система заявок на обмен книгами между пользователями.
- **Безопасность**: Ролевая модель (User, Admin), защищенные маршруты.
- **Личный кабинет**: Управление своими книгами, историей обменов и списком избранного.
- **Админка**: Управление ролями пользователей.
## Запуск проекта
### 1. Подготовка окружения (S3)
Для хранения картинок используется LocalStack. Запустите его через Docker:
`ash
docker-compose up -d
`
### 2. Запуск Backend
`ash
cd bookexchange_backend
./mvnw clean package -DskipTests
java -jar target/backendjava-0.0.1-SNAPSHOT.jar
`
Сервер будет доступен на http://localhost:5000.
### 3. Запуск Frontend
`ash
cd frontend
npm install
npm start
`
Приложение откроется на http://localhost:3000.
## Аккаунты для теста
- **Админ**: admin / admin123
- **Пользователь**: user / user123
