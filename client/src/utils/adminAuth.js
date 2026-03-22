const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_USER_KEY = 'adminUser';

function readStorage(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(key);
}

export function getAdminToken() {
  return readStorage(ADMIN_TOKEN_KEY);
}

export function getStoredAdmin() {
  const rawValue = readStorage(ADMIN_USER_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
}

export function setAdminSession({ token, admin }) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
}

export function clearAdminSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_USER_KEY);
}
