import { writable } from 'svelte/store';
import { fetchRoles } from '../services/roleService.js';

export const roles = writable([]);
export const modules = writable([]);
export const loading = writable(false);

export async function loadRoles() {
  loading.set(true);
  try {
    const data = await fetchRoles();
    roles.set(data);
  } catch (err) {
    console.error('Error cargando roles:', err);
  } finally {
    loading.set(false);
  }
}

export async function refreshRoles() {
  await loadRoles();
}
