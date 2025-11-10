const express = require('express');
const app = express();
const PORT = 3000;

// --- 1. Middleware ---
// Middleware для обработки JSON-запросов 
app.use(express.json());

// --- 2. Заглушка для данных (имитация базы данных) ---
let books = [
    { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', genre: 'Fantasy', ownerId: 1 },
    { id: 2, title: '1984', author: 'George Orwell', genre: 'Dystopia', ownerId: 2 }
];
let users = [
    { id: 1, email: 'user1@example.com', name: 'Alice' },
    { id: 2, email: 'user2@example.com', name: 'Bob' }
];

// --- 3. Базовая маршрутизация и Health-check ---
// Health-check (ЛР №2)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        service: 'Book Exchange API',
        timestamp: new Date().toISOString() 
    });
});

// --- 4. Маршруты Авторизации (Заглушки) ---
app.post('/api/auth/register', (req, res) => {
    const { email } = req.body;
    res.status(201).json({ 
        message: `User ${email} registered successfully. (Placeholder)`, 
        user: { email, id: users.length + 1 } 
    });
});

app.post('/api/auth/login', (req, res) => {
    // В будущем здесь будет проверка учетных данных
    res.status(200).json({ 
        message: 'Login successful. (Placeholder)',
        token: 'fake-jwt-token' 
    });
});

// --- 5. Маршруты Книг (Каталог и CRUD) ---
// Просмотр каталога, сортировка, фильтрация (ЛР №4)
app.get('/api/books', (req, res) => {
    const { sort, genre, search } = req.query;
    let filteredBooks = books;
    
    // В ЛР №4 здесь будет логика фильтрации и сортировки
    res.status(200).json({ 
        message: `Books catalog (sort: ${sort || 'none'}, genre: ${genre || 'all'}, search: ${search || 'none'})`,
        data: filteredBooks
    });
});

// Подробная информация о книге
app.get('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: 'Книга не найдена' }); 
    }
});

// Добавление книги для обмена (ЛР №4)
app.post('/api/books', (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Missing required fields: title and author' });
    }
    const newBook = { id: books.length + 1, ...req.body };
    books.push(newBook);
    res.status(201).json({ message: 'Книга успешно добавлена (Placeholder)', book: newBook });
});

// --- 6. Маршруты Пользователей (Профиль) ---
// Мой профиль (в будущем потребуется JWT/middleware)
app.get('/api/users/me', (req, res) => {
    res.status(200).json({ 
        message: 'Current user profile (Placeholder)',
        data: users[0] // Имитация авторизованного пользователя
    });
});

// Просмотр профиля другого человека
app.get('/api/users/:userId', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.userId));
    if (user) {
        res.status(200).json({ 
            message: `User profile for ID ${req.params.userId}`,
            data: user 
        });
    } else {
        res.status(404).json({ message: 'Пользователь не найден' });
    }
});

// --- 7. Маршруты Бронирований и Обменов ---
// Создание бронирования
app.post('/api/bookings', (req, res) => {
    res.status(201).json({ 
        message: 'Booking request created successfully (Placeholder)',
        bookingId: 101, 
        ...req.body 
    });
});

// Мои обмены/брони
app.get('/api/bookings/my', (req, res) => {
    res.status(200).json({ 
        message: 'List of current user bookings/exchanges (Placeholder)',
        data: [] 
    });
});

// --- 8. Маршруты Избранного ---
app.get('/api/users/me/favorites', (req, res) => {
    res.status(200).json({ 
        message: 'List of favorite books (Placeholder)',
        data: [] 
    });
});

// --- 9. Обработка ошибок ---
// Обработчик 404 для несуществующих маршрутов
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Not Found', 
        message: `Route ${req.originalUrl} not found` 
    });
});

// --- 10. Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});