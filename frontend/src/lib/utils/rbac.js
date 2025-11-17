// src/lib/utils/rbac.js
// Utilidades para Role-Based Access Control

import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth.js';
import { goto } from '$app/navigation';

/**
 * Verifica si el usuario actual tiene acceso a un módulo específico
 * @param {number|string|Array} moduleIdOrName - ID o nombre del módulo, o array de ellos
 * @param {boolean} requireAll - Si es true y moduleIdOrName es array, requiere TODOS
 * @returns {boolean}
 */
export function hasAccess(moduleIdOrName, requireAll = false) {
  const currentAuth = get(auth);
  const modules = currentAuth?.user?.modules || [];
  
  if (!moduleIdOrName) return true;
  
  if (Array.isArray(moduleIdOrName)) {
    if (requireAll) {
      return moduleIdOrName.every(mod => 
        modules.some(m => m.id === mod || m.name === mod)
      );
    } else {
      return moduleIdOrName.some(mod => 
        modules.some(m => m.id === mod || m.name === mod)
      );
    }
  }
  
  if (typeof moduleIdOrName === 'number') {
    return modules.some(m => m.id === moduleIdOrName);
  }
  
  return modules.some(m => m.name === moduleIdOrName);
}

/**
 * Protege una ruta verificando permisos, redirige si no tiene acceso
 * @param {number|string|Array} requiredModule - Módulo(s) requerido(s)
 * @param {string} redirectTo - Ruta a la que redirigir si no tiene acceso (default: '/login')
 * @param {boolean} requireAll - Si requiere todos los módulos (solo para arrays)
 */
export function protectRoute(requiredModule, redirectTo = '/login', requireAll = false) {
  const currentAuth = get(auth);
  
  if (!currentAuth.loggedIn) {
    goto(redirectTo);
    return false;
  }
  
  if (!hasAccess(requiredModule, requireAll)) {
    // Redirigir según el rol
    const role = currentAuth.user?.id_rol;
    if (role === 1) goto('/admin');
    else if (role === 2) goto('/doctor');
    else if (role === 3) goto('/patient');
    else if (role === 4 || role === 6) goto('/secretary');
    else goto('/login');
    return false;
  }
  
  return true;
}

/**
 * Mapeo de nombres de módulos comunes (puedes ajustar según tu BD)
 */
export const MODULES = {
  USERS: 'Usuarios',
  ROLES: 'Roles',
  APPOINTMENTS: 'Citas',
  ANALYSIS: 'Análisis',
  PATIENTS: 'Pacientes',
  DOCTORS: 'Doctores',
  REPORTS: 'Reportes',
  DASHBOARD: 'Dashboard',
  SETTINGS: 'Configuración',
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {number|Array<number>} roleId - ID del rol o array de IDs
 * @returns {boolean}
 */
export function hasRole(roleId) {
  const currentAuth = get(auth);
  const userRole = currentAuth?.user?.id_rol;
  
  if (Array.isArray(roleId)) {
    return roleId.includes(userRole);
  }
  
  return userRole === roleId;
}

/**
 * Roles predefinidos del sistema
 */
export const ROLES = {
  ADMIN: 1,
  DOCTOR: 2,
  PATIENT: 3,
  SECRETARY: 4,
  SECRETARY_ALT: 6,
};

/**
 * Verifica si es admin
 */
export function isAdmin() {
  return hasRole(ROLES.ADMIN);
}

/**
 * Verifica si es doctor
 */
export function isDoctor() {
  return hasRole(ROLES.DOCTOR);
}

/**
 * Verifica si es paciente
 */
export function isPatient() {
  return hasRole(ROLES.PATIENT);
}

/**
 * Verifica si es secretaria
 */
export function isSecretary() {
  return hasRole([ROLES.SECRETARY, ROLES.SECRETARY_ALT]);
}
