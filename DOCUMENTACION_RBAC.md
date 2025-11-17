# Sistema de Control de Acceso Basado en Roles (RBAC)

## 📋 Descripción General

Este proyecto implementa un sistema completo de RBAC (Role-Based Access Control) que permite:

1. **Asignación de Roles**: Cada usuario tiene un rol asignado (Admin, Doctor, Paciente, Secretaria)
2. **Autorización basada en Roles**: Los roles tienen módulos/permisos asignados
3. **Autorización de Privilegios**: Los usuarios solo pueden acceder a las funcionalidades de sus módulos asignados

## 🏗️ Arquitectura del Sistema

### Backend (FastAPI)

```
user (tabla)
  - id
  - user_name
  - id_rol → rol.id

rol (tabla)
  - id
  - name
  - description

module (tabla)
  - id
  - name
  - description

module_x_rol (tabla de relación)
  - id_rol → rol.id
  - id_module → module.id
```

### Frontend (SvelteKit)

- **Store de autenticación** (`src/lib/stores/auth.js`):

  - Maneja token, usuario y permisos
  - Exporta store derivado `permissions` con utilidades de verificación

- **Utilidades RBAC** (`src/lib/utils/rbac.js`):

  - Funciones para verificar permisos
  - Constantes de roles y módulos
  - Protección de rutas

- **Componentes de protección**:
  - `ProtectedContent.svelte`: Muestra/oculta contenido según permisos
  - `ProtectedRoute.svelte`: Protege rutas completas

## 📖 Guía de Uso

### 1. Crear y Asignar Roles con Permisos (Backend)

**Crear un nuevo rol con módulos:**

```bash
POST /roles/
Content-Type: application/json

{
  "name": "Recepcionista",
  "description": "Personal de recepción",
  "permisos": [1, 3, 5]  // IDs de módulos: Citas, Pacientes, etc.
}
```

**Actualizar permisos de un rol:**

```bash
PUT /roles/{id}
Content-Type: application/json

{
  "name": "Recepcionista",
  "description": "Personal de recepción actualizado",
  "permisos": [1, 3, 5, 7]  // Nuevos módulos
}
```

### 2. Verificar Permisos en Componentes (Frontend)

#### Opción A: Usando el componente `ProtectedContent`

```svelte
<script>
  import ProtectedContent from '$lib/components/ProtectedContent.svelte';
</script>

<!-- Mostrar solo si tiene acceso al módulo "Usuarios" -->
<ProtectedContent requireModule="Usuarios">
  <button>Crear Usuario</button>
</ProtectedContent>

<!-- Requiere múltiples módulos (AL MENOS UNO) -->
<ProtectedContent requireModule={['Citas', 'Agenda']}>
  <div class="appointments-section">...</div>
</ProtectedContent>

<!-- Requiere TODOS los módulos -->
<ProtectedContent requireModule={['Usuarios', 'Roles']} requireAll={true}>
  <button>Administración Completa</button>
</ProtectedContent>

<!-- Con fallback cuando no tiene permisos -->
<ProtectedContent
  requireModule="Reportes"
  fallback="<p>No tienes acceso a reportes</p>">
  <div class="reports">...</div>
</ProtectedContent>
```

#### Opción B: Usando el store `permissions` directamente

```svelte
<script>
  import { permissions } from '$lib/stores/auth.js';
</script>

{#if $permissions.hasModule('Usuarios')}
  <button>Gestionar Usuarios</button>
{/if}

{#if $permissions.hasAnyModule(['Citas', 'Agenda'])}
  <nav>...</nav>
{/if}

{#if $permissions.hasAllModules(['Admin', 'Configuración'])}
  <div class="admin-panel">...</div>
{/if}
```

#### Opción C: Usando funciones utilitarias

```svelte
<script>
  import { hasAccess, isAdmin, MODULES } from '$lib/utils/rbac.js';
</script>

{#if hasAccess('Usuarios')}
  <button>Ver Usuarios</button>
{/if}

{#if hasAccess([MODULES.APPOINTMENTS, MODULES.PATIENTS])}
  <section>...</section>
{/if}

{#if isAdmin()}
  <button>Panel de Administración</button>
{/if}
```

### 3. Proteger Rutas Completas

#### Método 1: Usando el componente `ProtectedRoute`

```svelte
<!-- src/routes/admin/users/+page.svelte -->
<script>
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
</script>

<ProtectedRoute requireModule="Usuarios">
  <div class="users-page">
    <h1>Gestión de Usuarios</h1>
    <!-- Contenido de la página -->
  </div>
</ProtectedRoute>
```

#### Método 2: Usando `protectRoute` en `onMount`

```svelte
<!-- src/routes/reports/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { protectRoute, MODULES } from '$lib/utils/rbac.js';

  onMount(() => {
    protectRoute(MODULES.REPORTS);
  });
</script>

<div class="reports-page">
  <h1>Reportes</h1>
</div>
```

### 4. Verificar Roles Específicos

```svelte
<script>
  import { hasRole, isAdmin, isDoctor, ROLES } from '$lib/utils/rbac.js';
</script>

{#if isAdmin()}
  <button>Acceso Total</button>
{/if}

{#if isDoctor()}
  <div>Panel del Doctor</div>
{/if}

{#if hasRole([ROLES.SECRETARY, ROLES.SECRETARY_ALT])}
  <div>Panel de Secretaría</div>
{/if}
```

### 5. Navegación Dinámica según Permisos

```svelte
<script>
  import { permissions } from '$lib/stores/auth.js';

  const navItems = [
    { name: 'Usuarios', route: '/admin/users', module: 'Usuarios' },
    { name: 'Roles', route: '/admin/roles', module: 'Roles' },
    { name: 'Citas', route: '/appointments', module: 'Citas' },
    { name: 'Análisis', route: '/analysis', module: 'Análisis' },
  ];
</script>

<nav>
  {#each navItems as item}
    {#if $permissions.hasModule(item.module)}
      <a href={item.route}>{item.name}</a>
    {/if}
  {/each}
</nav>
```

## 🔧 Configuración de Módulos

Para agregar nuevos módulos al sistema:

1. **Crear el módulo en la base de datos:**

```sql
INSERT INTO module (name, description, state)
VALUES ('Inventario', 'Gestión de inventario médico', 1);
```

2. **Asignarlo a roles:**

```sql
INSERT INTO module_x_rol (id_rol, id_module, state)
VALUES (1, 8, 1); -- Asignar módulo 8 al rol 1
```

3. **Usar en el frontend:**

```svelte
<ProtectedContent requireModule="Inventario">
  <button>Ver Inventario</button>
</ProtectedContent>
```

## 🛡️ Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Token JWT**: Backend genera token con info del usuario
3. **Obtener permisos**: Frontend llama a `/auth/me` que devuelve:
   ```json
   {
     "id": 5,
     "user_name": "doctor.smith",
     "id_rol": 2,
     "full_name": "Dr. Smith",
     "modules": [
       { "id": 3, "name": "Citas", "description": "..." },
       { "id": 4, "name": "Análisis", "description": "..." }
     ]
   }
   ```
4. **Guardar en store**: Los permisos se guardan en localStorage y store
5. **Verificación continua**: Cada componente/ruta verifica permisos antes de renderizar

## 📊 Ejemplo Completo: Crear un Nuevo Rol

### Backend

```python
# Ya está implementado en tu sistema
# POST /roles/
{
  "name": "Enfermera",
  "description": "Personal de enfermería",
  "permisos": [3, 4, 5]  # Citas, Análisis, Pacientes
}
```

### Frontend - Usar el nuevo rol

```svelte
<script>
  import { permissions } from '$lib/stores/auth.js';
  import ProtectedContent from '$lib/components/ProtectedContent.svelte';
</script>

<!-- Esta sección solo será visible para usuarios con rol Enfermera
     que tengan el módulo "Pacientes" asignado -->
<ProtectedContent requireModule="Pacientes">
  <div class="patient-vital-signs">
    <h3>Signos Vitales</h3>
    <button>Registrar Signos</button>
  </div>
</ProtectedContent>

<!-- Mostrar diferentes opciones según permisos -->
{#if $permissions.hasModule('Citas')}
  <a href="/appointments">Ver Citas</a>
{/if}

{#if $permissions.hasModule('Análisis')}
  <a href="/analysis">Ver Análisis</a>
{/if}
```

## 🔍 Debugging

Para ver los permisos del usuario actual:

```svelte
<script>
  import { auth, permissions } from '$lib/stores/auth.js';
</script>

<pre>{JSON.stringify($auth.user, null, 2)}</pre>
<pre>{JSON.stringify($permissions.modules, null, 2)}</pre>
```

## ⚠️ Seguridad

**IMPORTANTE**:

1. El control de acceso en el frontend es SOLO para UX/UI
2. **SIEMPRE** debes validar permisos en el backend
3. Nunca confíes únicamente en la validación del cliente
4. El backend ya valida con JWT y roles, esto es adicional para mejorar la experiencia de usuario

## 🚀 Próximos Pasos

1. Implementar caché de permisos
2. Agregar refresh automático cuando cambien permisos
3. Crear un panel de administración visual para asignar permisos
4. Agregar auditoría de accesos
