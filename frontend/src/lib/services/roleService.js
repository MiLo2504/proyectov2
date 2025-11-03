// src/lib/services/roleService.js
// Servicio para consumir endpoints de roles. Ahora usa BASE configurable
const BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://127.0.0.1:8000';

async function request(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const merged = {
    credentials: 'same-origin',
    headers: { ...(opts.headers || {}) },
    ...opts,
  };

  // Asegurar Content-Type para body JSON cuando aplique
  if (merged.body && typeof merged.body === 'object' && !merged.headers['Content-Type']) {
    merged.headers['Content-Type'] = 'application/json';
    merged.body = JSON.stringify(merged.body);
  }

  const res = await fetch(url, merged);
  const text = await res.text().catch(() => '');
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const err = new Error(body?.message || text || res.statusText || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export function fetchRoles() {
  return request('/roles', { method: 'GET' });
}

export function fetchModules() {
  return request('/roles/modules', { method: 'GET' });
}

export function createRole(roleData) {
  // normalizamos campo permisos vs permissions según lo que uses
  const payload = {
    name: roleData.role_name || roleData.name,
    description: roleData.description,
    permisos: roleData.permissions || roleData.permisos || [],
  };
  return request('/roles', { method: 'POST', body: payload });
}

export function updateRole(roleId, roleData) {
  const payload = {
    name: roleData.role_name || roleData.name,
    description: roleData.description,
    permisos: roleData.permissions || roleData.permisos || [],
  };
  return request(`/roles/${roleId}`, { method: 'PUT', body: payload });
}

export async function deleteRole(roleId) {
  await request(`/roles/${roleId}`, { method: 'DELETE' });
  return true;
}

export default { fetchRoles, fetchModules, createRole, updateRole, deleteRole };