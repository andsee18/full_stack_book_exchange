// простая интеграция важный

const buildCoverUrlFromDoc = (doc) => {
    const coverId = doc?.cover_i;
    if (coverId) {
        return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }

    const isbn = Array.isArray(doc?.isbn) ? doc.isbn.find(Boolean) : null;
    if (isbn) {
        return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`;
    }

    const olid = Array.isArray(doc?.edition_key) ? doc.edition_key.find(Boolean) : null;
    if (olid) {
        return `https://covers.openlibrary.org/b/olid/${encodeURIComponent(olid)}-L.jpg`;
    }

    return null;
};

const normalizeQueryText = (value) => {
    const s = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/ё/g, 'е');

    // комментарий важный ключевой
    const fixedTypos = s
        .replace(/филосовск/g, 'философск');

    // комментарий важный ключевой
    return fixedTypos
        .replace(/["'“”‘’`]/g, ' ')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const scoreDocMatch = (doc, titleNorm, authorNorm) => {
    const docTitle = normalizeQueryText(doc?.title || doc?.title_suggest || '');
    const docAuthorsRaw = Array.isArray(doc?.author_name) ? doc.author_name.join(' ') : (doc?.author_name || '');
    const docAuthors = normalizeQueryText(docAuthorsRaw);

    let score = 0;

    // комментарий важный ключевой
    if (doc?.cover_i || (Array.isArray(doc?.isbn) && doc.isbn.length) || (Array.isArray(doc?.edition_key) && doc.edition_key.length)) {
        score += 3;
    }

    if (docTitle && titleNorm) {
        if (docTitle === titleNorm) score += 6;
        else if (docTitle.includes(titleNorm) || titleNorm.includes(docTitle)) score += 4;
        else {
            // комментарий важный ключевой
            const titleTokens = new Set(titleNorm.split(' ').filter(Boolean));
            const docTitleTokens = new Set(docTitle.split(' ').filter(Boolean));
            let common = 0;
            titleTokens.forEach((t) => { if (docTitleTokens.has(t)) common += 1; });
            if (common >= 3) score += 2;
        }
    }

    if (docAuthors && authorNorm) {
        if (docAuthors.includes(authorNorm) || authorNorm.includes(docAuthors)) score += 3;
        else {
            const authorTokens = new Set(authorNorm.split(' ').filter(Boolean));
            const docAuthorTokens = new Set(docAuthors.split(' ').filter(Boolean));
            let common = 0;
            authorTokens.forEach((t) => { if (docAuthorTokens.has(t)) common += 1; });
            if (common >= 1) score += 1;
        }
    }

    return score;
};

const pickBestDoc = (docs, titleNorm, authorNorm) => {
    if (!Array.isArray(docs) || docs.length === 0) return null;

    let best = null;
    let bestScore = -1;
    for (const doc of docs) {
        const s = scoreDocMatch(doc, titleNorm, authorNorm);
        if (s > bestScore) {
            bestScore = s;
            best = doc;
        }
    }
    return best;
};

export const lookupCoverUrlByTitleAuthor = async (title, author) => {
    const tRaw = (title || '').trim();
    const aRaw = (author || '').trim();

    const t = normalizeQueryText(tRaw);
    const a = normalizeQueryText(aRaw);

    if (t.length < 2 || a.length < 2) return null;

    // комментарий важный ключевой
    const queries = [
        // комментарий важный ключевой
        { type: 'structured', params: { title: t, author: a, limit: '5' } },
        // комментарий важный ключевой
        { type: 'q', params: { q: `"${tRaw}" "${aRaw}"`, limit: '5' } },
        { type: 'q', params: { q: `${tRaw} ${aRaw}`, limit: '5' } },
        // комментарий важный ключевой
        { type: 'structured', params: { title: t, limit: '5' } },
        { type: 'q', params: { q: tRaw, limit: '5' } },
    ];

    for (const q of queries) {
        const params = new URLSearchParams(q.params);
        const url = `https://openlibrary.org/search.json?${params.toString()}`;

        try {
            const resp = await fetch(url, { method: 'GET' });
            if (!resp.ok) continue;
            const data = await resp.json();
            const docs = Array.isArray(data?.docs) ? data.docs : [];
            const bestDoc = pickBestDoc(docs, t, a);
            const cover = buildCoverUrlFromDoc(bestDoc);
            if (cover) return cover;
        } catch {
            // комментарий важный ключевой
        }
    }

    return null;
};
