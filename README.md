# book exchange full stack

проект сервис для обмена книгами
бэкенд на spring boot и фронтенд на react

## что есть в проекте

frontend
каталог книг
страница книги
профиль пользователя
логин и регистрация
обмены и заявки на обмен
рейтинг пользователей

backend
авторизация jwt access token и refresh token
crud для пользователей и книг
обмены между пользователями
оценки и рейтинг
sqlite база данных

## как запустить

### backend

требования java 21 и maven

перейти в папку
```bash
cd bookexchange_backend
```

собрать
```bash
mvn clean install -DskipTests
```

запустить
```bash
java -jar target/backendjava-0.0.1-SNAPSHOT.jar
```

по умолчанию порт 5000

### frontend

требования node js и npm

перейти в папку
```bash
cd frontend
```

установить зависимости
```bash
npm install
```

запустить
```bash
npm start
```

по умолчанию фронтенд на 3000

## api

база
`http://localhost:5000/api`

основные группы
`/auth`
`/users`
`/books`
`/exchange`
`/ratings`

## заметки

локальная база sqlite не хранится в git