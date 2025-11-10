// server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); 

const app = express();
const PORT = 5000; 

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// --- 1. НАСТРОЙКА БАЗЫ ДАННЫХ И МОДЕЛЕЙ ---
const db = new sqlite3.Database('./book_exchange.db', (err) => {
    if (err) {
        console.error("Ошибка открытия базы данных:", err.message);
    } else {
        console.log('Подключено к базе данных book_exchange.db.');
        
        // Создание таблицы USERS
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            location TEXT,
            rating REAL DEFAULT 5.0
        )`);

        // Создание таблицы BOOKS
        db.run(`CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            genre TEXT,
            description TEXT,
            owner_id INTEGER,
            cover_url TEXT,
            is_available INTEGER DEFAULT 1,
            FOREIGN KEY(owner_id) REFERENCES users(id)
        )`);
        
        // Создание таблицы EXCHANGES
        db.run(`CREATE TABLE IF NOT EXISTS exchanges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            offered_book_id INTEGER,
            requested_book_id INTEGER,
            proposer_id INTEGER,
            status TEXT DEFAULT 'pending', 
            FOREIGN KEY(offered_book_id) REFERENCES books(id),
            FOREIGN KEY(requested_book_id) REFERENCES books(id),
            FOREIGN KEY(proposer_id) REFERENCES users(id)
        )`);
        
        console.log('Таблицы users, books и exchanges проверены/созданы.');
        
        // --- ВСТАВКА ЗАГЛУШЕЧНЫХ ДАННЫХ ---
        const insertDummyData = () => {
            db.run("INSERT OR IGNORE INTO users (id, username, password, location) VALUES (1, 'user_test', 'password_hash', 'Москва')", function(err) {
                if (err) return;
                const books = [
                    ["Мастер и Маргарита", "М. А. Булгаков", "Фантастика", "Отличное состояние", 1, "/assets/master_i_margarita.jpg"],
                    ["Тёмная башня", "Стивен Кинг", "Хоррор", "Новая", 1, "/assets/dark_tower.jpg"],
                    ["Идиот", "Ф. М. Достоевский", "Классика", "Среднее", 1, "/assets/idiot.jpg"],
                ];
                books.forEach(book => {
                    db.run("INSERT OR IGNORE INTO books (title, author, genre, description, owner_id, cover_url) VALUES (?, ?, ?, ?, ?, ?)", book);
                });
                console.log('Заглушечные данные вставлены (если их не было).');
            });
        };
        insertDummyData();
    }
});


// --- 2. МАРШРУТЫ АУТЕНТИФИКАЦИИ ---

// CREATE: Регистрация нового пользователя
app.post('/api/auth/register', (req, res) => {
    const { username, password, location } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Требуются имя пользователя и пароль." });

    const sql = `INSERT INTO users (username, password, location) VALUES (?, ?, ?)`;
    db.run(sql, [username, password, location || ''], function(err) {
        if (err) {
            if (err.message.includes('SQLITE_CONSTRAINT')) {
                 return res.status(409).json({ error: "Пользователь с таким именем уже существует." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Регистрация успешна!", user_id: this.lastID, username: username });
    });
});

// READ: Вход пользователя в систему
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Требуются имя пользователя и пароль." });

    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(sql, [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: "Неверное имя пользователя или пароль." });
        
        res.status(200).json({
            message: "Вход успешен!",
            user_id: user.id,
            username: user.username,
            token: "fake-jwt-token-123" 
        });
    });
});


// --- 3. МАРШРУТЫ API ДЛЯ USERS (CRUD) ---

// READ: Получить данные пользователя по ID (Профиль)
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `SELECT id, username, location, rating FROM users WHERE id = ?`;

    db.get(sql, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ message: "Пользователь не найден." });
        
        res.status(200).json({ message: "success", data: user });
    });
});

// UPDATE: Обновить данные пользователя
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    // Только эти поля разрешено обновлять через этот маршрут
    const { location, new_password } = req.body; 

    // Используем PATCH, чтобы обновлять только предоставленные поля
    let updates = [];
    let params = [];

    if (location !== undefined) {
        updates.push("location = ?");
        params.push(location);
    }
    if (new_password !== undefined) {
        updates.push("password = ?"); // В реальном проекте хешируется!
        params.push(new_password);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: "Нет данных для обновления." });
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Пользователь не найден." });
        
        res.status(200).json({ message: "Профиль обновлен успешно." });
    });
});

// DELETE: Удалить пользователя (Полное удаление)
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `DELETE FROM users WHERE id = ?`;

    db.run(sql, userId, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Пользователь не найден." });
        
        res.status(200).json({ message: "Пользователь удален." });
    });
});


// --- 4. МАРШРУТЫ API ДЛЯ BOOKS (CRUD) ---

// CREATE: Добавить новую книгу в каталог
app.post('/api/books', (req, res) => {
    const { title, author, genre, description, owner_id, cover_url } = req.body;
    if (!title || !author || !owner_id) return res.status(400).json({ error: "Отсутствуют обязательные поля." });

    const sql = `INSERT INTO books (title, author, genre, description, owner_id, cover_url) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [title, author, genre, description, owner_id, cover_url];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        res.status(201).json({ message: "success", book_id: this.lastID, data: req.body });
    });
});

// READ: Получить список всех книг (для Каталога)
app.get('/api/books', (req, res) => {
    // В будущем здесь будет логика фильтрации и пагинации
    const sql = `
        SELECT b.*, u.username as owner_name, u.location as owner_location 
        FROM books b JOIN users u ON b.owner_id = u.id
        WHERE b.is_available = 1
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// READ: Получить детали конкретной книги по ID
app.get('/api/books/:id', (req, res) => {
    const bookId = req.params.id; 
    const sql = `
        SELECT b.*, u.username as owner_name, u.location as owner_location, u.rating as owner_rating
        FROM books b JOIN users u ON b.owner_id = u.id
        WHERE b.id = ?
    `;

    db.get(sql, [bookId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Книга не найдена" });
        
        res.json({ message: "success", data: row });
    });
});

// UPDATE: Обновить информацию о книге
app.put('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    // В реальном проекте добавляется проверка, что обновляет владелец!
    const { title, author, genre, description, is_available } = req.body; 

    const sql = `
        UPDATE books SET title=?, author=?, genre=?, description=?, is_available=?
        WHERE id = ?
    `;
    const params = [title, author, genre, description, is_available, bookId];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Книга не найдена или не изменена." });
        
        res.status(200).json({ message: "Информация о книге обновлена." });
    });
});

// DELETE: Удалить книгу
app.delete('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = `DELETE FROM books WHERE id = ?`;

    db.run(sql, bookId, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Книга не найдена." });
        
        res.status(200).json({ message: "Книга успешно удалена." });
    });
});


// --- 5. МАРШРУТЫ API ДЛЯ EXCHANGES (ОБМЕНОВ) ---

// CREATE: Создать запрос на обмен
app.post('/api/exchanges', (req, res) => {
    // В реальном приложении здесь проверяется, что книги доступны и принадлежат разным людям
    const { offered_book_id, requested_book_id, proposer_id } = req.body;
    
    if (!offered_book_id || !requested_book_id || !proposer_id) {
        return res.status(400).json({ error: "Отсутствуют обязательные ID для обмена." });
    }

    const sql = `
        INSERT INTO exchanges (offered_book_id, requested_book_id, proposer_id, status)
        VALUES (?, ?, ?, 'pending')
    `;
    const params = [offered_book_id, requested_book_id, proposer_id];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        res.status(201).json({ message: "Запрос на обмен создан успешно.", exchange_id: this.lastID });
    });
});

// READ: Получить список обменов пользователя (для страницы Профиль)
app.get('/api/exchanges/user/:id', (req, res) => {
    const userId = req.params.id;

    // В реальном проекте нужны сложные JOIN, чтобы получить названия книг и имя второго участника
    const sql = `
        SELECT * FROM exchanges 
        WHERE proposer_id = ? 
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "success", data: rows });
    });
});

// UPDATE: Обновить статус обмена (Принять/Отклонить)
app.put('/api/exchanges/:id', (req, res) => {
    const exchangeId = req.params.id;
    const { status } = req.body; // Ожидается 'confirmed' или 'rejected'

    if (!status || (status !== 'confirmed' && status !== 'rejected')) {
        return res.status(400).json({ error: "Недопустимый статус обмена." });
    }

    const sql = `UPDATE exchanges SET status = ? WHERE id = ?`;
    
    db.run(sql, [status, exchangeId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Обмен не найден." });
        
        res.status(200).json({ message: `Статус обмена обновлен на: ${status}.` });
    });
});


// --- 6. ЗАПУСК СЕРВЕРА ---

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});