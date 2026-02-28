-- комментарий важный ключевой
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    profile_image TEXT,
    location VARCHAR(255),
    rating REAL,
    rating_count INTEGER DEFAULT 0,
    role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

-- комментарий важный ключевой
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN profile_image TEXT;
ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'USER';

UPDATE users
SET role = COALESCE(role, 'USER');

-- комментарий важный ключевой
CREATE TABLE IF NOT EXISTS user_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exchange_request_id INTEGER NOT NULL,
    rater_id INTEGER NOT NULL,
    rated_user_id INTEGER NOT NULL,
    stars INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exchange_request_id, rater_id),
    FOREIGN KEY (exchange_request_id) REFERENCES exchange_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- комментарий важный ключевой
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    condition VARCHAR(100),
    cover_url TEXT,
    owner_id INTEGER,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE 
);

-- комментарий важный ключевой
ALTER TABLE books ADD COLUMN cover_url TEXT;



-- комментарий важный ключевой
DELETE FROM books
WHERE cover_url IS NULL
    AND status = 'available'
    AND (
        (title = 'Гарри Поттер и философский камень' AND author = 'Дж. К. Роулинг' AND genre = 'Фэнтези' AND description = 'Первая книга серии о Гарри Поттере.')
        OR (title = '1984' AND author = 'Джордж Оруэлл' AND genre = 'Антиутопия' AND description = 'Классическая антиутопия о тотальном контроле.')
        OR (title = 'Мастер и Маргарита' AND author = 'Михаил Булгаков' AND genre = 'Роман' AND description = 'Роман с мистикой и сатирой.')
        OR (title = 'Три товарища' AND author = 'Эрих Мария Ремарк' AND genre = 'Роман' AND description = 'История дружбы и любви на фоне послевоенной Германии.')
        OR (title = 'Sapiens: Краткая история человечества' AND author = 'Юваль Ной Харари' AND genre = 'Нон-фикшн' AND description = 'Популярная история развития человечества.')
    );


-- комментарий важный ключевой
WITH
seed_pool(title, author, genre, description) AS (
    VALUES
        ('Преступление и наказание', 'Фёдор Достоевский', 'Роман', 'Классика русской литературы.'),
        ('Война и мир', 'Лев Толстой', 'Роман', 'Исторический роман-эпопея.'),
        ('Отцы и дети', 'Иван Тургенев', 'Роман', 'Роман о конфликте поколений.'),
        ('Анна Каренина', 'Лев Толстой', 'Роман', 'История любви и выбора.'),
        ('Идиот', 'Фёдор Достоевский', 'Роман', 'Роман о князе Мышкине.'),
        ('Фауст', 'Иоганн Вольфганг Гёте', 'Поэма', 'Трагедия о поиске смысла.'),
        ('Старик и море', 'Эрнест Хемингуэй', 'Повесть', 'История о стойкости.'),
        ('Над пропастью во ржи', 'Джером Сэлинджер', 'Роман', 'Подростковый взгляд на мир.'),
        ('451° по Фаренгейту', 'Рэй Брэдбери', 'Антиутопия', 'Мир, где сжигают книги.'),
        ('Дюна', 'Фрэнк Герберт', 'Фантастика', 'Политика и экология Арракиса.'),
        ('Хоббит', 'Дж. Р. Р. Толкин', 'Фэнтези', 'Приключение Бильбо Бэггинса.'),
        ('Властелин колец: Братство кольца', 'Дж. Р. Р. Толкин', 'Фэнтези', 'Начало пути к Мордору.'),
        ('Пикник на обочине', 'Аркадий и Борис Стругацкие', 'Фантастика', 'Зона и её тайны.'),
        ('Понедельник начинается в субботу', 'Аркадий и Борис Стругацкие', 'Фантастика', 'Юмор и магия НИИЧАВО.'),
        ('Маленький принц', 'Антуан де Сент-Экзюпери', 'Сказка', 'История о дружбе и смысле.'),
        ('Тень горы', 'Грегори Дэвид Робертс', 'Роман', 'Продолжение пути Лина.'),
        ('Шантарам', 'Грегори Дэвид Робертс', 'Роман', 'История в Бомбее.'),
        ('Граф Монте-Кристо', 'Александр Дюма', 'Роман', 'Месть и справедливость.'),
        ('Три мушкетёра', 'Александр Дюма', 'Роман', 'Приключения и дружба.'),
        ('Человек в поисках смысла', 'Виктор Франкл', 'Нон-фикшн', 'Психология и выживание.'),
        ('Атомные привычки', 'Джеймс Клир', 'Нон-фикшн', 'Про маленькие изменения.'),
        ('Краткая история времени', 'Стивен Хокинг', 'Нон-фикшн', 'Про вселенную простыми словами.'),
        ('Девять принцев Амбера', 'Роджер Желязны', 'Фэнтези', 'Игры миров и интриги.'),
        ('Американские боги', 'Нил Гейман', 'Фэнтези', 'Старые и новые боги.' )
),
pool AS (
    SELECT row_number() OVER (ORDER BY title) AS rn, title, author, genre, description
    FROM seed_pool
),
pool_count AS (
    SELECT COUNT(*) AS n FROM pool
),
targets AS (
    SELECT
        u.id AS owner_id,
        p.title,
        p.author,
        p.genre,
        p.description,
        (
            CASE ((u.id + p.rn) % 5)
                WHEN 0 THEN 'Новое'
                WHEN 1 THEN 'Очень хорошее'
                WHEN 2 THEN 'Хорошее'
                WHEN 3 THEN 'Удовлетворительное'
                ELSE 'Плохое'
            END
        ) AS condition,
        p.rn AS pool_rn,
        ((u.id - 1) * 4) AS base_offset
    FROM users u
    CROSS JOIN pool p
    CROSS JOIN pool_count pc
    WHERE ((p.rn - 1 - ((u.id - 1) * 4)) % pc.n + pc.n) % pc.n < 4
)
INSERT INTO books (title, author, genre, description, condition, cover_url, owner_id, status)
SELECT
    t.title,
    t.author,
    t.genre,
    t.description,
    t.condition,
    NULL,
    t.owner_id,
    'available'
FROM targets t
WHERE NOT EXISTS (
    SELECT 1
    FROM books b
    WHERE b.owner_id = t.owner_id
        AND b.title = t.title
        AND b.author = t.author
);


-- комментарий важный ключевой
CREATE TABLE IF NOT EXISTS exchange_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requested_book_id INTEGER NOT NULL,
    offered_book_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (offered_book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- комментарий важный ключевой
CREATE TABLE IF NOT EXISTS exchange_request_hidden (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exchange_request_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    hidden_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exchange_request_id, user_id)
);

-- комментарий важный ключевой
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    expiry_date INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);