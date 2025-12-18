export function getUserIdFromJwt(token) {
  try {
    if (!token) return null;

    const rawToken = token.startsWith('Bearer ') ? token.slice('Bearer '.length) : token;
    const parts = rawToken.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(json);
    const sub = payload?.sub;
    const userId = sub != null ? Number(sub) : null;
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
}
