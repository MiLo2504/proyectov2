import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, cookies }) {
  console.log('[DINAMICO LAYOUT] Loading...');
  
  // Intentar obtener usuario de locals (establecido por hooks)
  let user = locals.user;
  
  // Si no está en locals, intentar obtenerlo de la cookie como fallback
  if (!user) {
    console.log('[DINAMICO LAYOUT] No user in locals, checking cookie...');
    const userDataCookie = cookies.get('user_data');
    const token = cookies.get('token');
    
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
        console.log('[DINAMICO LAYOUT] User loaded from cookie:', user.user_name);
      } catch (e) {
        console.error('[DINAMICO LAYOUT] Error parsing user cookie:', e);
      }
    }
    
    // Si aún no hay usuario, validar token directamente
    if (!user && token) {
      console.log('[DINAMICO LAYOUT] Validating token directly...');
      try {
        const response = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          user = await response.json();
          console.log('[DINAMICO LAYOUT] User loaded from API:', user.user_name);
        }
      } catch (e) {
        console.error('[DINAMICO LAYOUT] Error fetching user:', e);
      }
    }
  }
  
  if (!user) {
    console.log('[DINAMICO LAYOUT] No user found after all attempts, redirecting to login');
    throw redirect(303, '/login');
  }

  console.log('[DINAMICO LAYOUT] User:', user.user_name, 'Role:', user.id_rol);

  // Verificar que sea un rol dinámico
  const BASE_ROLES = [1, 2, 3, 4];
  if (BASE_ROLES.includes(user.id_rol)) {
    // Redirigir a su interfaz específica
    const routes = {
      1: '/admin',
      2: '/doctor',
      3: '/patient',
      4: '/secretary'
    };
    console.log('[DINAMICO LAYOUT] Base role detected, redirecting to:', routes[user.id_rol]);
    throw redirect(303, routes[user.id_rol]);
  }

  console.log('[DINAMICO LAYOUT] Dynamic role confirmed, modules:', user.modules?.length || 0);

  // Retornar usuario y permisos
  return {
    user,
    modules: user.modules || []
  };
}
