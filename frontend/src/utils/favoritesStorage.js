const FAVORITES_CHANGED_EVENT = 'favorites:changed';

function dispatchFavoritesChanged() {
  try {
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  } catch {
    // комментарий важный ключевой
  }
}

export function subscribeFavoritesChanged(handler) {
  window.addEventListener(FAVORITES_CHANGED_EVENT, handler);
  return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, handler);
}

function booksKey(userId) {
  return `favorites:books:${userId}`;
}

function authorsKey(userId) {
  return `favorites:authors:${userId}`;
}

export function getFavoriteBookIds(userId) {
  if (userId == null) return new Set();
  try {
    const raw = localStorage.getItem(booksKey(userId));
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

function setFavoriteBookIds(userId, idsSet) {
  const arr = Array.from(idsSet || []).map((n) => Number(n)).filter((n) => Number.isFinite(n));
  localStorage.setItem(booksKey(userId), JSON.stringify(arr));
}

export function isFavoriteBook(userId, bookId) {
  if (userId == null) return false;
  const id = Number(bookId);
  if (!Number.isFinite(id)) return false;
  return getFavoriteBookIds(userId).has(id);
}

export function toggleFavoriteBook(userId, bookId) {
  if (userId == null) return false;
  const id = Number(bookId);
  if (!Number.isFinite(id)) return false;

  const set = getFavoriteBookIds(userId);
  if (set.has(id)) set.delete(id);
  else set.add(id);

  setFavoriteBookIds(userId, set);
  dispatchFavoritesChanged();
  return set.has(id);
}

function normalizeAuthorName(name) {
  return (name || '').toString().trim().toLowerCase();
}

export function getFavoriteAuthors(userId) {
  if (userId == null) return [];
  try {
    const raw = localStorage.getItem(authorsKey(userId));
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];

    // комментарий важный ключевой
    const seen = new Set();
    const result = [];
    for (const item of arr) {
      const original = (item || '').toString().trim();
      const key = normalizeAuthorName(original);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(original);
    }
    return result;
  } catch {
    return [];
  }
}

function setFavoriteAuthors(userId, authors) {
  const cleaned = Array.isArray(authors) ? authors.map((a) => (a || '').toString().trim()).filter(Boolean) : [];
  localStorage.setItem(authorsKey(userId), JSON.stringify(cleaned));
}

export function isFavoriteAuthor(userId, authorName) {
  if (userId == null) return false;
  const key = normalizeAuthorName(authorName);
  if (!key) return false;
  const list = getFavoriteAuthors(userId);
  return list.some((a) => normalizeAuthorName(a) === key);
}

export function toggleFavoriteAuthor(userId, authorName) {
  if (userId == null) return false;
  const author = (authorName || '').toString().trim();
  const key = normalizeAuthorName(author);
  if (!key) return false;

  const list = getFavoriteAuthors(userId);
  const exists = list.some((a) => normalizeAuthorName(a) === key);

  const next = exists
    ? list.filter((a) => normalizeAuthorName(a) !== key)
    : [...list, author];

  setFavoriteAuthors(userId, next);
  dispatchFavoritesChanged();
  return !exists;
}
