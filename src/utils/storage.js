export function persistSession({ accessToken, refreshToken, user }) {
  localStorage.setItem('realenergy_access_token', accessToken || '');
  localStorage.setItem('realenergy_refresh_token', refreshToken || '');
  localStorage.setItem('realenergy_user', JSON.stringify(user || null));
}

export function clearSession() {
  localStorage.removeItem('realenergy_access_token');
  localStorage.removeItem('realenergy_refresh_token');
  localStorage.removeItem('realenergy_user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('realenergy_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
