# Book Exchange Full Stack Application

Этот проект представляет собой платформу обмена книгами, разработанную с использованием современных Full Stack технологий. Он разделен на две основные части: **Backend (Java Spring Boot)** для обработки данных и **Frontend (React)** для пользовательского интерфейса.

---

## Стек Технологий

### Backend (bookexchange_backend)

* **Язык:** Java 21+
* **Фреймворк:** Spring Boot 3.3.x
* **Сборщик:** Maven
* **База данных:** SQLite
* **Доступ к БД:** JdbcTemplate (чистый JDBC)
* **Функционал:** Полный CRUD для сущности `User`.

### Frontend (frontend)

* **Библиотека:** React (JavaScript/TypeScript)
* **Сборщик:** Vite / Create React App

---

## Запуск Проекта

### 1. Настройка и Запуск Backend

Для запуска бэкенда убедитесь, что у вас установлены **Java (JDK 21+)** и **Maven**.

1.  Перейдите в папку бэкенда:
    ```bash
    cd bookexchange_backend
    ```
2.  Соберите проект (это также создаст локальную базу данных `bookexchange.db`):
    ```bash
    mvn clean install -DskipTests
    ```
3.  Запустите сервер Spring Boot:
    ```bash
    java -jar target/backendjava-0.0.1-SNAPSHOT.jar
    ```
Сервер запустится на порту **`5000`**.

### 2. Настройка и Запуск Frontend

Для запуска фронтенда убедитесь, что у вас установлен **Node.js** и **npm/yarn**.

1.  Перейдите в папку фронтенда:
    ```bash
    cd ../frontend
    ```
2.  Установите зависимости:
    ```bash
    npm install
    # или
    # yarn install
    ```
3.  Запустите клиентское приложение:
    ```bash
    npm start
    # или
    # yarn start
    ```

---

## API Endpoints (Базовый CRUD для Пользователей)

Базовый URL бэкенда: `http://localhost:5000/api/users`

| Метод | Путь | Описание |
| :--- | :--- | :--- |
| **POST** | `/api/users` | Создать нового пользователя |
| **GET** | `/api/users/{id}` | Получить пользователя по ID |
| **PUT** | `/api/users/{id}` | Обновить пользователя по ID |
| **DELETE** | `/api/users/{id}` | Удалить пользователя по ID |