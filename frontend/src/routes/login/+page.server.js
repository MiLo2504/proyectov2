import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    try {
      // Login
      const loginRes = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!loginRes.ok) {
        const error = await loginRes.json().catch(() => ({}));
        return { success: false, error: error.detail || 'Credenciales inválidas' };
      }

      const { access_token } = await loginRes.json();

      // Obtener datos del usuario
      const meRes = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      if (!meRes.ok) {
        return { success: false, error: 'Error al obtener datos del usuario' };
      }

      const user = await meRes.json();

      // Establecer cookie en el servidor (esto sí funciona con SSR)
      cookies.set('token', access_token, {
        path: '/',
        httpOnly: false, // Permitir acceso desde JavaScript
        secure: false, // true en producción con HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      });

      // También guardar el usuario en una cookie para acceso rápido
      cookies.set('user_data', JSON.stringify(user), {
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      });

      console.log('[LOGIN SERVER] Cookie establecida para usuario:', user.user_name);

      // Determinar ruta de redirección
      const BASE_ROLES = { 1: '/admin', 2: '/doctor', 3: '/patient', 4: '/secretary' };
      const path = BASE_ROLES[user.id_rol] || '/dinamico';

      console.log('[LOGIN SERVER] Redirigiendo a:', path);
      
      throw redirect(303, path);

    } catch (error) {
      if (error?.status === 303) {
        throw error;
      }
      console.error('[LOGIN SERVER] Error:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }
};
