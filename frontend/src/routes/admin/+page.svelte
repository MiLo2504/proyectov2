<script lang="ts">
  import { onMount } from "svelte";

  // Componentes existentes
  import UserTable from "../../lib/components/UserTable.svelte";
  import UserForm from "../../lib/components/UserForm.svelte";
  import RoleForm from "../../lib/components/RoleForm.svelte";
  import RolePermissionsTable from "../../lib/components/RolePermissionsTable.svelte";

  // Servicios y stores
  import {
    fetchUsers,
    createUser,
    deleteUser,
    updateUser,
  } from "../../lib/services/userService.js";
  import { fetchModules } from "../../lib/services/roleService.js";
  import {
    roles as roles,
    modules as modulesStore,
    loadRoles,
  } from "../../lib/stores/roles.js";

  let activeTab: "usuarios" | "crearUsuario" | "crearRol" | "verRoles" =
    "usuarios";

  // Estado
  let users: any[] = [];
  let loading = false;

  // Estado para edición de usuarios en-lugar
  let editingUser: any = null;

  // Estado para edición de roles
  let editingRole: any = null;
  let isEditing: boolean = false;

  // Form estado mínimo para crear usuario
  let newUser = {
    user_name: "",
    password: "",
    full_name: "",
    last_name: "",
    email: "",
    date_birth: "",
    address: "",
    phone: "",
    id_type_document: "",
    num_document: "",
    id_rol: "",
    genero: "",
  };

  onMount(async () => {
    await cargarUsuarios();
    await cargarRolesYModulos();
  });

  async function cargarUsuarios() {
    loading = true;
    try {
      users = await fetchUsers();
    } catch (e) {
      console.error("Error cargando usuarios", e);
      users = [];
    } finally {
      loading = false;
    }
  }

  async function cargarRolesYModulos() {
    try {
      await loadRoles();
      const mods = await fetchModules();
      modulesStore.set(mods);
    } catch (e) {
      console.error("Error cargando roles/módulos", e);
    }
  }

  // Acciones usuarios
  function irAEditarUsuario(user: any) {
    // abrir el formulario de crear en modo edición con el usuario
    editingUser = user;
    activeTab = "crearUsuario";
  }

  async function eliminarUsuario(id: number) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      const ok = await deleteUser(id);
      if (ok) {
        users = users.filter((u) => u.id !== id);
      }
    } catch (e) {
      alert("No se pudo eliminar el usuario");
    }
  }

  async function crearUsuario(datos: any) {
    try {
      const creado = await createUser(datos);
      users = [creado, ...users];
      alert("Usuario creado correctamente");
      activeTab = "usuarios";
      // Resetear formulario
      newUser = {
        user_name: "",
        password: "",
        full_name: "",
        last_name: "",
        email: "",
        date_birth: "",
        address: "",
        phone: "",
        id_type_document: "",
        num_document: "",
        id_rol: "",
        genero: "",
      };
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error al crear el usuario");
    }
  }

  async function guardarEdicionUsuario(datos: any) {
    try {
      const actualizado = await updateUser(datos);
      const actualizadoObj: any = actualizado;
      // reemplazar en la lista local
      users = users.map((u) =>
        u.id === actualizadoObj.id ? actualizadoObj : u
      );
      alert("Usuario actualizado correctamente");
      editingUser = null;
      activeTab = "usuarios";
    } catch (e) {
      console.error("Error actualizando usuario:", e);
      alert("Error al actualizar usuario");
    }
  }

  // Acciones roles (RoleForm y RolePermissionsTable manejan internamente guardar/eliminar y disparan eventos)
  function onRolGuardado() {
    // recarga roles y resetea estado de edición
    loadRoles();
    editingRole = null;
    isEditing = false;
    activeTab = "verRoles";
  }

  function handleEditRole(role: any) {
    editingRole = role;
    isEditing = true;
    activeTab = "crearRol";
  }
</script>

<div class="container mt-4">
  <h2 class="text-center mb-4 fw-bold">Panel de Administración</h2>

  <!-- 🔹 Pestañas -->
  <ul class="nav nav-tabs mb-3">
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'usuarios' ? 'active' : ''}"
        on:click={() => (activeTab = "usuarios")}
      >
        Usuarios
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'crearUsuario' ? 'active' : ''}"
        on:click={() => (activeTab = "crearUsuario")}
      >
        Crear Usuario
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'crearRol' ? 'active' : ''}"
        on:click={() => {
          // abrir formulario en modo crear
          editingRole = null;
          isEditing = false;
          activeTab = "crearRol";
        }}
      >
        Crear Rol
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'verRoles' ? 'active' : ''}"
        on:click={() => (activeTab = "verRoles")}
      >
        Ver Roles
      </button>
    </li>
  </ul>

  <!-- 🔸 TABLA DE USUARIOS  -->
  {#if activeTab === "usuarios"}
    <div class="card p-3 shadow-sm">
      <h5 class="fw-bold mb-3">Lista de Usuarios</h5>
      {#if loading}
        <div class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>
      {:else}
        <UserTable
          {users}
          enhanceWithDataTable={true}
          onEdit={irAEditarUsuario}
          onDelete={eliminarUsuario}
        />
      {/if}
    </div>

    <!-- 🔸 FORMULARIO CREAR USUARIO -->
  {:else if activeTab === "crearUsuario"}
    <div class="card p-4 shadow-sm">
      <h5 class="fw-bold mb-3">
        {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
      </h5>
      {#if editingUser}
        <UserForm
          user={editingUser}
          roles={$roles}
          onSubmit={guardarEdicionUsuario}
          onCancel={() => {
            editingUser = null;
            activeTab = "usuarios";
          }}
        />
      {:else}
        <UserForm
          bind:newUser
          roles={$roles}
          on:submit={() => {
            /* noop */
          }}
          onSubmit={crearUsuario}
        />
      {/if}
    </div>

    <!-- 🔸 FORMULARIO CREAR ROL -->
  {:else if activeTab === "crearRol"}
    <RoleForm
      on:saved={onRolGuardado}
      on:cancel={() => {
        // al cancelar, volver a la vista de roles y recargar
        editingRole = null;
        isEditing = false;
        loadRoles();
        activeTab = "verRoles";
      }}
      {isEditing}
      {editingRole}
    />

    <!-- 🔸 VER ROLES -->
  {:else if activeTab === "verRoles"}
    <RolePermissionsTable onEdit={handleEditRole} />
  {/if}
</div>

<style>
  .nav-tabs .nav-link.active {
    background-color: #0d6efd;
    color: white;
  }
</style>
