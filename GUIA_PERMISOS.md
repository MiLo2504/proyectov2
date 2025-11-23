# 🔐 Guía Completa del Sistema de Permisos Dinámicos

## 📋 Índice

1. [Arquitectura del Sistema](#arquitectura)
2. [Roles Base vs Roles Dinámicos](#roles)
3. [Estructura de Permisos](#permisos)
4. [Flujo Completo de Autenticación](#flujo)
5. [Uso de Componentes](#componentes)
6. [Ejemplos Prácticos](#ejemplos)
7. [Cómo Agregar Nuevos Roles](#nuevos-roles)
8. [Mejores Prácticas](#mejores-practicas)
9. [Seguridad](#seguridad)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del Sistema {#arquitectura}

### Estructura de Carpetas

```
frontend/src/
├── lib/
│   ├── stores/
│   │   ├── auth.js              # Store de autenticación
│   │   └── permissions.js       # ⭐ Store de permisos granulares
│   └── components/
│       ├── PermissionGuard.svelte    # Wrapper condicional
│       ├── ActionButton.svelte       # Botón con permisos
│       ├── DynamicView.svelte        # Vista dinámica principal
│       ├── UsersDataTable.svelte     # Tabla adaptada
│       ├── AppointmentsTable.svelte  # Tabla adaptada
│       ├── AnalysisTable.svelte      # Tabla adaptada
│       └── PatientsTable.svelte      # Tabla adaptada
├── routes/
│   ├── admin/              # ❌ Solo Admin (rol 1)
│   ├── doctor/             # ❌ Solo Doctor (rol 2)
│   ├── patient/            # ❌ Solo Patient (rol 3)
│   ├── secretary/          # ❌ Solo Secretary (rol 4)
│   ├── dinamico/           # ✅ Roles dinámicos
│   │   ├── +layout.server.js
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── login/
│       └── +page.svelte
└── hooks.server.js         # 🛡️ Guard global de seguridad
```

### Capas de Seguridad

```
┌─────────────────────────────────────────┐
│  1. hooks.server.js                     │
│     → Valida token                      │
│     → Verifica rol para rutas base      │
│     → Bloquea acceso no autorizado      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. +layout.server.js (/dinamico)       │
│     → Carga datos del usuario           │
│     → Retorna módulos asignados         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. permissions.js (Store)              │
│     → Normaliza permisos                │
│     → Provee helpers reactivos          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. PermissionGuard / ActionButton      │
│     → Control a nivel de componente     │
│     → Oculta/muestra según permisos     │
└─────────────────────────────────────────┘
```

---

## 👥 Roles Base vs Roles Dinámicos {#roles}

### Roles Base (IDs fijos)

Estos roles tienen **interfaces completas dedicadas** en carpetas separadas:

| ID  | Nombre    | Ruta         | Descripción                |
| --- | --------- | ------------ | -------------------------- |
| 1   | Admin     | `/admin`     | Administrador del sistema  |
| 2   | Doctor    | `/doctor`    | Médicos del sistema        |
| 3   | Patient   | `/patient`   | Pacientes del sistema      |
| 4   | Secretary | `/secretary` | Secretarias/recepcionistas |

**Características:**

- ✅ Interfaces completas y personalizadas
- ✅ Flujos específicos por rol
- ✅ No se modifican desde la base de datos
- ✅ Redirección directa en login

### Roles Dinámicos (IDs variables)

Roles creados **dinámicamente** desde el panel de administración:

| ID  | Nombre (Ejemplo) | Ruta        | Permisos Configurables               |
| --- | ---------------- | ----------- | ------------------------------------ |
| 8   | Ayudante         | `/dinamico` | usuarios: [ver], citas: [ver,crear]  |
| 9   | Supervisor       | `/dinamico` | citas: [ver,editar], reportes: [ver] |
| 10  | Apoyo            | `/dinamico` | pacientes: [ver], citas: [ver]       |

**Características:**

- ✅ Permisos configurables desde admin
- ✅ Interfaz adaptativa en `/dinamico`
- ✅ Reutiliza componentes existentes
- ✅ Escalable sin código adicional

---

## 🔑 Estructura de Permisos {#permisos}

### Formato de Permisos

```javascript
{
  usuarios: ['ver', 'crear', 'editar', 'eliminar'],
  citas: ['ver', 'crear'],
  analisis: ['ver'],
  reportes: ['ver'],
  pacientes: ['ver', 'crear', 'editar'],
  configuracion: ['ver', 'editar']
}
```

### Módulos Disponibles

| Módulo          | Acciones Posibles            |
| --------------- | ---------------------------- |
| `usuarios`      | ver, crear, editar, eliminar |
| `citas`         | ver, crear, editar, eliminar |
| `analisis`      | ver, crear, editar, eliminar |
| `reportes`      | ver, exportar                |
| `pacientes`     | ver, crear, editar           |
| `configuracion` | ver, editar                  |

### Acciones Estándar

```javascript
PERMISSIONS.ACTIONS = {
  VIEW: "ver",
  CREATE: "crear",
  EDIT: "editar",
  DELETE: "eliminar",
  EXPORT: "exportar",
  IMPORT: "importar",
};
```

---

## 🔄 Flujo Completo de Autenticación {#flujo}

### Diagrama de Flujo

```
Usuario ingresa credenciales
        ↓
   POST /auth/login
        ↓
Backend valida y retorna:
  - token JWT
  - usuario { id, id_rol, modules: [...] }
        ↓
Frontend guarda:
  - token en cookie
  - usuario en localStorage
  - permisos en store
        ↓
┌─────────────────────────────────┐
│ ¿Es rol base (1, 2, 3, 7)?      │
└─────────────────────────────────┘
    │ Sí          │ No
    ↓             ↓
Ruta base    /dinamico
(/admin,     (UI adaptativa)
 /doctor,
 /patient,
 /secretary)
```

### Paso a Paso Detallado

#### 1. Usuario inicia sesión

```svelte
<!-- login/+page.svelte -->
<script>
  import { login } from '$lib/stores/auth.js';
  import { permissions } from '$lib/stores/permissions.js';

  async function handleLogin() {
    const user = await login(email, password);

    // Cargar permisos
    permissions.loadPermissions(user);

    // Redirección inteligente
    const BASE_ROLES = {
      1: '/admin', 2: '/doctor',
      3: '/patient', 4: '/secretary'
    };

    const path = BASE_ROLES[user.id_rol] || '/dinamico';
    goto(path);
  }
</script>
```

#### 2. hooks.server.js valida el acceso

```javascript
// Valida token en cada request
const token = event.cookies.get("token");
const response = await fetch("http://127.0.0.1:8000/auth/me", {
  headers: { Authorization: `Bearer ${token}` },
});

const user = await response.json();
event.locals.user = user;

// Verifica acceso a rutas protegidas
if (path.startsWith("/admin") && user.id_rol !== 1) {
  throw redirect(303, getHomeRouteForRole(user.id_rol));
}
```

#### 3. Store de permisos procesa los módulos

```javascript
// permissions.js
loadPermissions: (user) => {
  const permissions = {};

  user.modules.forEach((module) => {
    const moduleName = normalizeModuleName(module.name);
    permissions[moduleName] = module.permissions || [
      "ver",
      "crear",
      "editar",
      "eliminar",
    ];
  });

  set({ loaded: true, permissions, role: user.id_rol });
};
```

#### 4. Componente verifica permisos

```svelte
<!-- DynamicView.svelte -->
<script>
  import { can } from '$lib/stores/permissions.js';

  $: canView = $can('usuarios', 'ver');
  $: canCreate = $can('usuarios', 'crear');
</script>

{#if canView}
  <UsersTable permissions={{ canCreate, canEdit, canDelete }} />
{/if}
```

---

## 🧩 Uso de Componentes {#componentes}

### 1. PermissionGuard

Envuelve contenido que solo debe mostrarse con permisos específicos.

```svelte
<PermissionGuard module="usuarios" action="ver">
  <h3>Lista de Usuarios</h3>
  <UsersTable />

  <svelte:fragment slot="fallback">
    <p>No tienes permisos para ver usuarios</p>
  </svelte:fragment>
</PermissionGuard>
```

**Props:**

- `module`: Nombre del módulo (usuarios, citas, etc.)
- `action`: Acción requerida (ver, crear, editar, eliminar)
- `requireAll`: Si se pasan múltiples acciones, requiere todas (default: false)

**Slots:**

- Default: Contenido a mostrar si tiene permiso
- `fallback`: Contenido alternativo sin permiso (opcional)

### 2. ActionButton

Botón que solo aparece si el usuario tiene el permiso necesario.

```svelte
<ActionButton
  module="usuarios"
  action="crear"
  variant="primary"
  size="sm"
  icon="plus-circle"
  onClick={handleCreate}
>
  Nuevo Usuario
</ActionButton>
```

**Props:**

- `module`: Módulo del permiso
- `action`: Acción requerida
- `variant`: Estilo del botón (primary, secondary, success, danger, warning)
- `size`: Tamaño (sm, md, lg)
- `icon`: Icono de Bootstrap Icons
- `onClick`: Función callback
- `disabled`: Deshabilitar manualmente (default: false)

### 3. DynamicView

Componente principal que renderiza la vista según el módulo activo.

```svelte
<DynamicView module={activeModule} user={data.user} />
```

**Props:**

- `module`: Módulo activo (usuarios, citas, analisis, etc.)
- `user`: Objeto de usuario con datos completos

**Funcionalidad:**

- Mapea módulos a componentes específicos
- Pasa permisos a cada componente hijo
- Muestra badges de permisos disponibles
- Renderiza vistas especiales para reportes y configuración

### 4. Tablas Adaptadas

Todas las tablas aceptan un objeto `permissions` para controlar acciones.

```svelte
<!-- UsersDataTable.svelte -->
<script>
  export let permissions = {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false
  };
</script>

<!-- Botón crear solo si tiene permiso -->
<PermissionGuard module="usuarios" action="crear">
  <ActionButton module="usuarios" action="crear" onClick={handleCreate}>
    Nuevo Usuario
  </ActionButton>
</PermissionGuard>

<!-- Botones de acciones en filas -->
<ActionButton
  module="usuarios"
  action="editar"
  size="sm"
  onClick={() => handleEdit(user.id)}
/>

<ActionButton
  module="usuarios"
  action="eliminar"
  variant="danger"
  size="sm"
  onClick={() => handleDelete(user.id)}
/>
```

---

## 💡 Ejemplos Prácticos {#ejemplos}

### Ejemplo 1: Crear Rol "Ayudante"

**Desde el Panel Admin:**

1. Crear rol en base de datos:

```sql
INSERT INTO rol (name, state) VALUES ('Ayudante', 1);
-- Retorna id = 8
```

2. Asignar módulos:

```sql
INSERT INTO module_x_rol (id_rol, id_module, state) VALUES
(8, 2, 1),  -- Citas: ver
(8, 5, 1);  -- Pacientes: ver
```

3. Crear usuario con este rol:

```sql
INSERT INTO user (user_name, password, id_rol, ...) VALUES
('ayudante1', 'hash...', 8, ...);
```

**Resultado:**

- Login → redirige a `/dinamico`
- Ve sidebar con "Citas Médicas" y "Gestión de Pacientes"
- Puede VER datos pero NO crear/editar/eliminar
- Botones de acción ocultos automáticamente

### Ejemplo 2: Verificar Permisos en Código

```svelte
<script>
  import { can, hasModule, isDynamicRole } from '$lib/stores/permissions.js';

  // Reactivos
  $: canEditUsers = $can('usuarios', 'editar');
  $: hasReports = $hasModule('reportes');
  $: isDynamic = $isDynamicRole;

  // No reactivo (funciones síncronas)
  import { checkPermission, isBaseRole } from '$lib/stores/permissions.js';

  if (checkPermission('usuarios', 'crear')) {
    console.log('Puede crear usuarios');
  }
</script>

{#if canEditUsers}
  <EditUserForm />
{/if}

{#if hasReports}
  <ReportsLink href="/dinamico?module=reportes" />
{/if}

{#if isDynamic}
  <p>Tienes un rol personalizado</p>
{/if}
```

### Ejemplo 3: Proteger Ruta Manualmente

```svelte
<!-- +page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { checkPermission } from '$lib/stores/permissions.js';

  onMount(() => {
    if (!checkPermission('reportes', 'ver')) {
      goto('/dinamico');
    }
  });
</script>
```

### Ejemplo 4: Tabla con Permisos Mixtos

```svelte
<script>
  import { can } from '$lib/stores/permissions.js';

  $: canEdit = $can('citas', 'editar');
  $: canDelete = $can('citas', 'eliminar');
  $: canView = $can('citas', 'ver');
</script>

<table>
  <thead>
    <tr>
      <th>Fecha</th>
      <th>Paciente</th>
      <th>Doctor</th>
      {#if canEdit || canDelete}
        <th>Acciones</th>
      {/if}
    </tr>
  </thead>
  <tbody>
    {#each appointments as apt}
      <tr>
        <td>{apt.date}</td>
        <td>{apt.patient}</td>
        <td>{apt.doctor}</td>
        {#if canEdit || canDelete}
          <td>
            <ActionButton
              module="citas"
              action="editar"
              size="sm"
              onClick={() => edit(apt.id)}
            />
            <ActionButton
              module="citas"
              action="eliminar"
              variant="danger"
              size="sm"
              onClick={() => remove(apt.id)}
            />
          </td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>
```

---

## ➕ Cómo Agregar Nuevos Roles {#nuevos-roles}

### Opción A: Desde Base de Datos (Recomendado)

```sql
-- 1. Crear el rol
INSERT INTO rol (name, description, state, created_at, updated_at)
VALUES ('Supervisor', 'Supervisión de operaciones', 1, NOW(), NOW());

-- 2. Obtener el ID del rol creado
SELECT LAST_INSERT_ID(); -- Ejemplo: 9

-- 3. Asignar módulos con permisos
INSERT INTO module_x_rol (id_rol, id_module, state, created_at, updated_at) VALUES
(9, 2, 1, NOW(), NOW()),  -- Citas
(9, 3, 1, NOW(), NOW()),  -- Análisis
(9, 4, 1, NOW(), NOW());  -- Reportes

-- 4. Crear usuario con ese rol
INSERT INTO user (user_name, email, password, id_rol, full_name, last_name, id_type_document, num_document, state)
VALUES ('supervisor1', 'supervisor@example.com', 'hash...', 9, 'Juan', 'Pérez', 1, '123456', 1);
```

### Opción B: Desde Panel Admin (UI)

Si implementas la interfaz de gestión de roles:

```svelte
<!-- AdminRolesPage.svelte -->
<script>
  let newRole = { name: '', description: '' };
  let selectedModules = [];

  async function createRole() {
    // 1. Crear rol
    const roleResponse = await fetch('http://127.0.0.1:8000/roles/', {
      method: 'POST',
      body: JSON.stringify(newRole)
    });
    const role = await roleResponse.json();

    // 2. Asignar módulos
    for (const moduleId of selectedModules) {
      await fetch('http://127.0.0.1:8000/module_x_rol/', {
        method: 'POST',
        body: JSON.stringify({
          id_rol: role.id,
          id_module: moduleId,
          state: 1
        })
      });
    }

    alert('Rol creado exitosamente');
  }
</script>

<form on:submit|preventDefault={createRole}>
  <input bind:value={newRole.name} placeholder="Nombre del rol" />
  <textarea bind:value={newRole.description} placeholder="Descripción" />

  <h6>Módulos</h6>
  {#each modules as module}
    <label>
      <input type="checkbox" value={module.id} bind:group={selectedModules} />
      {module.name}
    </label>
  {/each}

  <button type="submit">Crear Rol</button>
</form>
```

### Permisos Granulares (Opcional)

Si quieres control más fino, crea una tabla `module_x_rol_permissions`:

```sql
CREATE TABLE module_x_rol_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_module_x_rol INT NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'ver', 'crear', 'editar', 'eliminar'
  FOREIGN KEY (id_module_x_rol) REFERENCES module_x_rol(id)
);

-- Ejemplo: Ayudante puede VER y CREAR citas, pero NO editar ni eliminar
INSERT INTO module_x_rol_permissions (id_module_x_rol, action) VALUES
((SELECT id FROM module_x_rol WHERE id_rol=8 AND id_module=2), 'ver'),
((SELECT id FROM module_x_rol WHERE id_rol=8 AND id_module=2), 'crear');
```

Luego modifica el endpoint `/auth/me` para retornar:

```python
modules = [
  {
    'id': 2,
    'name': 'Citas',
    'permissions': ['ver', 'crear']  # ← Permisos específicos
  }
]
```

---

## ✅ Mejores Prácticas {#mejores-practicas}

### 1. Separación de Responsabilidades

```
✅ BIEN:
- Roles base → carpetas específicas (/admin, /doctor, etc.)
- Roles dinámicos → /dinamico

❌ EVITAR:
- Crear carpetas /ayudante, /supervisor, etc.
- Duplicar componentes por rol
```

### 2. Permisos Reactivos

```svelte
✅ BIEN: Usar stores derivados
$: canEdit = $can('usuarios', 'editar');

{#if canEdit}
  <EditButton />
{/if}

❌ EVITAR: Verificar permisos en cada render
{#if checkPermission('usuarios', 'editar')}
  <!-- Esto no es reactivo -->
{/if}
```

### 3. Fallbacks Claros

```svelte
✅ BIEN: Siempre proveer feedback
<PermissionGuard module="usuarios" action="ver">
  <UsersTable />

  <svelte:fragment slot="fallback">
    <div class="alert alert-warning">
      No tienes permisos para ver usuarios
    </div>
  </svelte:fragment>
</PermissionGuard>

❌ EVITAR: Dejar pantallas vacías
<PermissionGuard module="usuarios" action="ver">
  <UsersTable />
</PermissionGuard>
<!-- Si no tiene permiso, no muestra nada -->
```

### 4. Naming Consistente

```javascript
✅ BIEN: Nombres normalizados
const MODULES = {
  USERS: 'usuarios',
  APPOINTMENTS: 'citas',
  ANALYSIS: 'analisis'
};

❌ EVITAR: Variaciones
'Usuarios', 'users', 'Citas', 'appointments' // ← Inconsistente
```

### 5. Validación en Backend

```python
✅ SIEMPRE validar permisos en backend también

@app.post("/users/")
def create_user(user: UserCreate, current_user: User = Depends(get_current_user)):
    # Verificar que el usuario tenga permiso de crear
    if not has_permission(current_user, 'usuarios', 'crear'):
        raise HTTPException(status_code=403, detail="Sin permisos")

    # Crear usuario...
```

---

## 🔒 Seguridad {#seguridad}

### Capas de Protección

1. **Frontend (hooks.server.js)**

   - Valida token en cada request
   - Verifica rol para rutas base
   - Previene navegación directa

2. **Frontend (Componentes)**

   - Oculta UI según permisos
   - Deshabilita acciones no permitidas

3. **Backend (Endpoints)**
   - Valida token JWT
   - Verifica permisos en base de datos
   - Retorna 403 si no autorizado

### Principios de Seguridad

```
🛡️ NUNCA confíes solo en el frontend
✅ Valida SIEMPRE en backend
✅ Usa tokens JWT con expiración
✅ Verifica permisos en CADA endpoint
✅ Registra intentos de acceso no autorizado
```

### Ejemplo de Endpoint Protegido

```python
from fastapi import Depends, HTTPException
from typing import List

def verify_permission(module: str, action: str):
    def permission_checker(current_user: User = Depends(get_current_user)):
        # Obtener permisos del usuario
        user_permissions = get_user_permissions(current_user.id_rol)

        if module not in user_permissions:
            raise HTTPException(status_code=403, detail=f"No access to module {module}")

        if action not in user_permissions[module]:
            raise HTTPException(status_code=403, detail=f"Cannot {action} in {module}")

        return current_user

    return permission_checker

@app.get("/users/", dependencies=[Depends(verify_permission('usuarios', 'ver'))])
def list_users():
    return get_all_users()

@app.post("/users/", dependencies=[Depends(verify_permission('usuarios', 'crear'))])
def create_user(user: UserCreate):
    return create_new_user(user)
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Problema 1: Usuario redirigido a login constantemente

**Causa:** Token expirado o inválido

**Solución:**

```javascript
// Verificar token en auth.js
export async function validateToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

### Problema 2: Permisos no se cargan

**Causa:** Store no inicializado

**Solución:**

```svelte
<!-- +layout.svelte de /dinamico -->
<script>
  import { onMount } from 'svelte';
  import { permissions } from '$lib/stores/permissions.js';

  export let data;

  onMount(() => {
    permissions.loadPermissions(data.user);
  });
</script>
```

### Problema 3: Botones aparecen pero no funcionan

**Causa:** Permisos frontend sí, backend no

**Solución:** Verificar que el backend también valide:

```python
@app.post("/users/")
def create_user(
    user: UserCreate,
    current_user: User = Depends(get_current_user)
):
    # ✅ AGREGAR ESTA VALIDACIÓN
    if not has_permission(current_user.id_rol, 'usuarios', 'crear'):
        raise HTTPException(403, "Sin permisos para crear usuarios")

    # Crear usuario...
```

### Problema 4: Rol dinámico redirige a /admin

**Causa:** hooks.server.js no reconoce el rol como dinámico

**Solución:** Verificar la lista BASE_ROLES:

```javascript
// hooks.server.js
const BASE_ROLES = [1, 2, 3, 7]; // IDs de roles base

if (path.startsWith("/dinamico")) {
  if (BASE_ROLES.includes(user.id_rol)) {
    // Redirigir a su interfaz específica
    throw redirect(303, getHomeRouteForRole(user.id_rol));
  }
}
```

### Problema 5: Componentes no se muestran en /dinamico

**Causa:** DynamicView no mapea el módulo correctamente

**Solución:**

```svelte
<!-- DynamicView.svelte -->
<script>
  const moduleComponents = {
    usuarios: { component: UsersDataTable, title: 'Usuarios' },
    citas: { component: AppointmentsTable, title: 'Citas' },
    analisis: { component: AnalysisTable, title: 'Análisis' },
    // ← AGREGAR NUEVOS MÓDULOS AQUÍ
  };
</script>
```

---

## 📊 Resumen Ejecutivo

### ✅ Lo que TIENES ahora:

1. **Sistema de permisos granular** (módulo + acción)
2. **Roles base protegidos** en carpetas específicas
3. **Roles dinámicos** con interfaz adaptativa en `/dinamico`
4. **Componentes reutilizables** con control de permisos
5. **Guards de seguridad** en múltiples capas
6. **Redirección inteligente** según rol y permisos
7. **Documentación completa** y ejemplos

### 🚀 Próximos Pasos (Opcionales):

1. **Implementar panel de gestión de roles** en `/admin`
2. **Agregar permisos granulares** con tabla `module_x_rol_permissions`
3. **Crear dashboard de auditoría** de accesos
4. **Implementar notificaciones** de permisos insuficientes
5. **Agregar tests unitarios** para verificadores de permisos

---

## 📞 Soporte

Si tienes dudas:

1. Revisa esta documentación
2. Verifica los ejemplos en `/lib/components`
3. Consulta `permissions.js` para métodos disponibles
4. Prueba en `/dinamico` con usuario de prueba

**Feliz codificación! 🎉**
