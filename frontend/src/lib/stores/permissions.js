import { writable, derived } from 'svelte/store';

/**
 * STORE DE PERMISOS GRANULARES
 * 
 * Estructura de permisos por módulo:
 * {
 *   usuarios: ['ver', 'crear', 'editar', 'eliminar'],
 *   citas: ['ver', 'crear', 'editar', 'eliminar'],
 *   analisis: ['ver', 'crear', 'editar', 'eliminar'],
 *   reportes: ['ver'],
 *   pacientes: ['ver', 'crear', 'editar'],
 *   configuracion: ['ver', 'editar']
 * }
 */

function createPermissionsStore() {
  const { subscribe, set, update } = writable({
    loaded: false,
    permissions: {},
    role: null,
    roleName: '',
    isDynamic: false // Si es un rol dinámico o base
  });

  return {
    subscribe,
    
    /**
     * Cargar permisos desde el usuario
     * @param {object} user - Usuario con módulos y rol
     */
    loadPermissions: (user) => {
      console.log('[PERMISSIONS] loadPermissions called with user:', user);
      
      if (!user) {
        set({ loaded: true, permissions: {}, role: null, roleName: '', isDynamic: false });
        return;
      }

      const role = user.id_rol;
      const roleName = user.rol_name || '';
      const modules = user.modules || [];

      console.log('[PERMISSIONS] Role:', role, 'RoleName:', roleName, 'Modules count:', modules.length);

      // Roles base (no dinámicos) - IDs fijos
      const BASE_ROLES = {
      1: 'admin',
      2: 'doctor', 
      3: 'patient',
      4: 'secretary'
    };      const isDynamic = !BASE_ROLES[role];
      console.log('[PERMISSIONS] Is dynamic?', isDynamic);

      // Convertir módulos a permisos granulares
      const permissions = {};
      
      modules.forEach(module => {
        const moduleName = normalizeModuleName(module.name);
        
        // Determinar permisos según el nombre del módulo
        let modulePermissions = module.permissions || ['ver', 'crear', 'editar', 'eliminar'];
        
        // Si el módulo tiene "Ver" en el nombre, solo dar permiso de ver
        if (module.name.toLowerCase().includes('ver ')) {
          modulePermissions = ['ver'];
        }
        
        console.log('[PERMISSIONS] Module:', module.name, '→', moduleName, '→', modulePermissions);
        permissions[moduleName] = modulePermissions;
      });

      console.log('[PERMISSIONS] Final permissions:', permissions);

      set({
        loaded: true,
        permissions,
        role,
        roleName,
        isDynamic
      });
      
      console.log('[PERMISSIONS] Store updated successfully');
    },

    /**
     * Reiniciar permisos (logout)
     */
    reset: () => {
      set({ loaded: false, permissions: {}, role: null, roleName: '', isDynamic: false });
    }
  };
}

/**
 * Normalizar nombres de módulos para consistencia
 */
function normalizeModuleName(name) {
  const mapping = {
    'Administración': 'usuarios',
    'Ver Usuarios': 'usuarios',
    'Citas': 'citas',
    'Análisis': 'analisis',
    'Reportes': 'reportes',
    'Pacientes': 'pacientes',
    'Configuración': 'configuracion'
  };
  return mapping[name] || name.toLowerCase().replace(/\s+/g, '-');
}

export const permissions = createPermissionsStore();

/**
 * DERIVED STORES - Helpers reactivos para verificar permisos
 */

// Verificar si tiene un permiso específico
export const can = derived(permissions, $permissions => {
  /**
   * @param {string} module - Nombre del módulo (usuarios, citas, etc.)
   * @param {string} action - Acción (ver, crear, editar, eliminar)
   * @returns {boolean}
   */
  return (module, action) => {
    if (!$permissions.loaded) return false;
    
    const modulePermissions = $permissions.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.includes(action);
  };
});

// Verificar si tiene CUALQUIERA de los permisos
export const canAny = derived(permissions, $permissions => {
  /**
   * @param {string} module - Nombre del módulo
   * @param {string[]} actions - Array de acciones
   * @returns {boolean}
   */
  return (module, actions) => {
    if (!$permissions.loaded) return false;
    
    const modulePermissions = $permissions.permissions[module];
    if (!modulePermissions) return false;
    
    return actions.some(action => modulePermissions.includes(action));
  };
});

// Verificar si tiene TODOS los permisos
export const canAll = derived(permissions, $permissions => {
  /**
   * @param {string} module - Nombre del módulo
   * @param {string[]} actions - Array de acciones
   * @returns {boolean}
   */
  return (module, actions) => {
    if (!$permissions.loaded) return false;
    
    const modulePermissions = $permissions.permissions[module];
    if (!modulePermissions) return false;
    
    return actions.every(action => modulePermissions.includes(action));
  };
});

// Verificar si tiene acceso a un módulo (cualquier permiso)
export const hasModule = derived(permissions, $permissions => {
  /**
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  return (module) => {
    if (!$permissions.loaded) return false;
    return !!$permissions.permissions[module];
  };
});

// Verificar si es un rol dinámico
export const isDynamicRole = derived(permissions, $permissions => {
  return $permissions.isDynamic;
});

// Obtener todos los módulos disponibles
export const availableModules = derived(permissions, $permissions => {
  return Object.keys($permissions.permissions);
});

/**
 * FUNCIONES HELPER NO REACTIVAS (para usar fuera de componentes Svelte)
 */

let currentPermissions = {};
permissions.subscribe(value => {
  currentPermissions = value;
});

/**
 * Verificar permiso de forma síncrona
 */
export function checkPermission(module, action) {
  const modulePermissions = currentPermissions.permissions[module];
  if (!modulePermissions) return false;
  return modulePermissions.includes(action);
}

/**
 * Verificar si tiene acceso a un módulo
 */
export function hasModuleAccess(module) {
  return !!currentPermissions.permissions[module];
}

/**
 * Verificar si es rol base o dinámico
 */
export function isBaseRole() {
  return !currentPermissions.isDynamic;
}

export function isDynamic() {
  return currentPermissions.isDynamic;
}

/**
 * Obtener ruta de inicio según permisos
 */
export function getHomeRoute() {
  const { role, isDynamic: isDyn } = currentPermissions;
  
  // Roles base van a sus rutas específicas
  if (!isDyn) {
    const routes = {
      1: '/admin',
      2: '/doctor',
      3: '/patient',
      4: '/secretary'
    };
    return routes[role] || '/dinamico';
  }
  
  // Roles dinámicos van a /dinamico
  return '/dinamico';
}

/**
 * CONSTANTES DE PERMISOS
 */
export const PERMISSIONS = {
  ACTIONS: {
    VIEW: 'ver',
    CREATE: 'crear',
    EDIT: 'editar',
    DELETE: 'eliminar',
    EXPORT: 'exportar',
    IMPORT: 'importar'
  },
  MODULES: {
    USERS: 'usuarios',
    APPOINTMENTS: 'citas',
    ANALYSIS: 'analisis',
    REPORTS: 'reportes',
    PATIENTS: 'pacientes',
    CONFIG: 'configuracion'
  }
};
