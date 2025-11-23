import { writable, derived } from 'svelte/store';

const initialToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
const initialUser = initialToken ? JSON.parse(localStorage.getItem('user') || 'null') : null;

export const auth = writable({
  token: initialToken,
  user: initialUser,
  loggedIn: !!initialToken,
});

// Store derivado para permisos del usuario
export const permissions = derived(auth, $auth => {
  const modules = $auth.user?.modules || [];
  return {
    modules: modules,
    moduleIds: modules.map(m => m.id),
    moduleNames: modules.map(m => m.name),
    hasModule: (moduleIdOrName) => {
      if (typeof moduleIdOrName === 'number') {
        return modules.some(m => m.id === moduleIdOrName);
      }
      return modules.some(m => m.name === moduleIdOrName);
    },
    hasAnyModule: (moduleList) => {
      return moduleList.some(mod => {
        if (typeof mod === 'number') {
          return modules.some(m => m.id === mod);
        }
        return modules.some(m => m.name === mod);
      });
    },
    hasAllModules: (moduleList) => {
      return moduleList.every(mod => {
        if (typeof mod === 'number') {
          return modules.some(m => m.id === mod);
        }
        return modules.some(m => m.name === mod);
      });
    }
  };
});

export async function login(username, password) {
  const res = await fetch('http://127.0.0.1:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include' // Importante para enviar/recibir cookies
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
  
  // Obtener información del usuario incluyendo sus permisos/módulos
  const meRes = await fetch('http://127.0.0.1:8000/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  });
  const user = meRes.ok ? await meRes.json() : null;
  
  // Guardar token en localStorage Y en cookie para que hooks.server.js lo vea
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Guardar token en cookie también con todas las opciones necesarias
  const maxAge = 7 * 24 * 60 * 60; // 7 días
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  
  console.log('[AUTH] Cookie establecida:', document.cookie.includes('token='));
  console.log('[AUTH] Cookies actuales:', document.cookie.split('; ').filter(c => c.startsWith('token=')));
  
  auth.set({ token, user, loggedIn: true });
  
  console.log('Usuario logueado con permisos:', user?.modules);
  return user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Eliminar cookie también
  document.cookie = 'token=; path=/; max-age=0';
  auth.set({ token: null, user: null, loggedIn: false });
}

export function getRole() {
  let current;
  auth.subscribe(v => current = v)();
  return current?.user?.id_rol;
}

// Función auxiliar para verificar permisos
export function hasPermission(moduleIdOrName) {
  let current;
  auth.subscribe(v => current = v)();
  const modules = current?.user?.modules || [];
  
  if (typeof moduleIdOrName === 'number') {
    return modules.some(m => m.id === moduleIdOrName);
  }
  return modules.some(m => m.name === moduleIdOrName);
}
