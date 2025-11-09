import { writable } from 'svelte/store';

const initialToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
const initialUser = initialToken ? JSON.parse(localStorage.getItem('user') || 'null') : null;

export const auth = writable({
  token: initialToken,
  user: initialUser,
  loggedIn: !!initialToken,
});

export async function login(username, password) {
  const res = await fetch('http://127.0.0.1:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data?.detail || 'Credenciales inválidas');
    } catch {
      throw new Error('Credenciales inválidas');
    }
  }
  const data = await res.json();
  const token = data.access_token;
  const meRes = await fetch('http://127.0.0.1:8000/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = meRes.ok ? await meRes.json() : null;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  auth.set({ token, user, loggedIn: true });
  return user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  auth.set({ token: null, user: null, loggedIn: false });
}

export function getRole() {
  let current;
  auth.subscribe(v => current = v)();
  return current?.user?.id_rol;
}
