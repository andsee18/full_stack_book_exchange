const express = require('express');
const app = express();
const PORT = 3000;

// Middleware для обработки JSON-запросов (важно для POST)
app.use(express.json());

// --- Заглушка для данных (имитация базы данных) ---
let books = [
    { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', genre: 'Fantasy' },
    { id: 2, title: '1984', author: 'George Orwell', genre: 'Dystopia' }
];

// 1. Health-check маршрут (должен быть в начале)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        service: 'Book Exchange API',
        timestamp: new Date().toISOString() 
    });
});

// 2. Маршруты Авторизации
app.post('/api/auth/register', (req, res) => {
    const { email } = req.body;
    res.status(201).json({ 
        message: `User ${email} registered successfully. (Placeholder)`, 
        user: { email } 
    });
});

app.post('/api/auth/login', (req, res) => {
    res.status(200).json({ 
        message: 'Login successful. (Placeholder)',
        token: 'fake-jwt-token' 
    });
});

// 3. Маршруты Книг (Базовый CRUD)
app.get('/api/books', (req, res) => {
    res.status(200).json(books);
});

app.get('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: 'Книга не найдена' }); 
    }
});

app.post('/api/books', (req, res) => {
    const newBook = { 
        id: books.length + 1, 
        ...req.body 
    };
    books.push(newBook);
    res.status(201).json({ message: 'Книга успешно добавлена (Placeholder)', book: newBook });
});


// 4. ЗАПУСК СЕРВЕРА (ДОЛЖЕН БЫТЬ В САМОМ КОНЦЕ)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});