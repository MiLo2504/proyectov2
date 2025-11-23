import { redirect } from '@sveltejs/kit';

/**
 * HOOKS DE SEGURIDAD GLOBAL
 * 
 * Protege rutas según roles y permisos.
 * Previene acceso no autorizado a interfaces específicas.
 */

// Mapeo de rutas protegidas a roles permitidos
const PROTECTED_ROUTES = {
  '/admin': [1], // Solo Admin (rol ID 1)
  '/doctor': [2], // Solo Doctor (rol ID 2)
  '/patient': [3], // Solo Patient (rol ID 3)
  '/secretary': [4] // Solo Secretary (rol ID 4)
};

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register'
];

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const path = event.url.pathname;
  
  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some(route => path === route || path.startsWith(route))) {
    return await resolve(event);
  }

  // Permitir assets estáticos
  if (path.startsWith('/_app') || path.includes('.')) {
    return await resolve(event);
  }

  // Obtener token de las cookies
  const token = event.cookies.get('token');
  
  console.log('[HOOKS] Path:', path, 'Token present:', !!token);
  
  // Si no hay token, redirigir a login
  if (!token) {
    console.log('[HOOKS] No token found, redirecting to login');
    throw redirect(303, '/login');
  }

  // Validar token y obtener usuario
  let user = null;
  try {
    console.log('[HOOKS] Validating token with /auth/me...');
    // Llamar a la API para validar el token y obtener datos del usuario
    const response = await fetch('http://127.0.0.1:8000/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('[HOOKS] /auth/me response status:', response.status);

    if (!response.ok) {
      // Token inválido o expirado
      console.log('[HOOKS] Invalid token, deleting cookie and redirecting');
      event.cookies.delete('token', { path: '/' });
      throw redirect(303, '/login');
    }

    user = await response.json();
    console.log('[HOOKS] User loaded:', user.user_name, 'Role:', user.id_rol);
  } catch (error) {
    // Si el error es un redirect, dejarlo pasar
    if (error?.status === 303) {
      throw error;
    }
    
    // Si hay error de red o similar, loguear y redirigir a login
    console.error('[HOOKS] Error validating token:', error.message);
    event.cookies.delete('token', { path: '/' });
    throw redirect(303, '/login');
  }

  // Guardar usuario en locals para acceso en +page.server.js
  event.locals.user = user;

  // Verificar acceso a rutas protegidas específicas
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (path.startsWith(route)) {
      const userRole = user.id_rol;
      
      if (!allowedRoles.includes(userRole)) {
        // Usuario no tiene permiso para esta ruta específica
        // Redirigir a su home correspondiente
        const homeRoute = getHomeRouteForRole(userRole);
        throw redirect(303, homeRoute);
      }
    }
  }

  // Ruta /dinamico: solo para roles dinámicos (no base)
  if (path.startsWith('/dinamico')) {
    console.log('[HOOKS] Acceso a /dinamico - User role:', user.id_rol);
    const BASE_ROLES = [1, 2, 3, 4];
    if (BASE_ROLES.includes(user.id_rol)) {
      // Usuarios con roles base deben ir a sus interfaces específicas
      const homeRoute = getHomeRouteForRole(user.id_rol);
      console.log('[HOOKS] Role base detectado, redirigiendo a:', homeRoute);
      throw redirect(303, homeRoute);
    }
    console.log('[HOOKS] Role dinámico, permitiendo acceso a /dinamico');
  }

  // Usuario autenticado y autorizado
  return await resolve(event);
}

/**
 * Obtener ruta de inicio según rol
 */
function getHomeRouteForRole(roleId) {
  const routes = {
    1: '/admin',
    2: '/doctor',
    3: '/patient',
    4: '/secretary'
  };
  return routes[roleId] || '/dinamico';
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
  console.error('Server error:', error);
  
  return {
    message: 'Ha ocurrido un error en el servidor',
    code: error?.code ?? 'UNKNOWN'
  };
}
