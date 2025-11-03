<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // Componentes existentes
  import UserTable from "../../lib/components/userTable.svelte";
  import UserForm from "../../lib/components/UserForm.svelte";
  import RoleForm from "../../lib/components/RoleForm.svelte";
  import RolePermissionsTable from "../../lib/components/RolePermissionsTable.svelte";

  // Servicios y stores
  import {
    fetchUsers,
    createUser,
    deleteUser,
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
  // Abrir modal de edición en lugar de navegar
  import Modal from "../../lib/components/Modal.svelte";
  import UserEditForm from "../../lib/components/UserEditForm.svelte";
  import { fetchUserById, updateUser } from "../../lib/services/userService.js";

  let showEditModal = false;
  let editingUser: any = null;
  let savingEdit = false;

  async function irAEditarUsuario(id: number) {
    try {
      editingUser = null;
      showEditModal = true;
      editingUser = await fetchUserById(id);
    } catch (e) {
      console.error('No se pudo cargar usuario para editar', e);
      alert('No se pudo cargar el usuario');
      showEditModal = false;
    }
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
      };
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error al crear el usuario");
    }
  }

  async function handleSaveEditedUser() {
    if (!editingUser) return;
    savingEdit = true;
    try {
      const updated = await updateUser(editingUser);
      // actualizar en la lista local
      users = users.map(u => (u.id === updated.id ? updated : u));
      showEditModal = false;
      editingUser = null;
    } catch (e) {
      console.error('Error actualizando usuario', e);
      alert('No se pudo guardar cambios');
    } finally {
      savingEdit = false;
    }
  }

  function handleCancelEdit() {
    showEditModal = false;
    editingUser = null;
  }

  // Acciones roles (RoleForm y RolePermissionsTable manejan internamente guardar/eliminar y disparan eventos)
  function onRolGuardado() {
    loadRoles();
    activeTab = "verRoles";
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
        on:click={() => (activeTab = "crearRol")}
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

      {#if showEditModal}
        <Modal size="sm" on:close={handleCancelEdit}>
          {#if editingUser}
            <UserEditForm {user}={editingUser} onSave={handleSaveEditedUser} onCancel={handleCancelEdit} />
          {:else}
            <div class="p-4">Cargando...</div>
          {/if}
        </Modal>
      {/if}

    <!-- 🔸 FORMULARIO CREAR USUARIO -->
  {:else if activeTab === "crearUsuario"}
    <div class="card p-4 shadow-sm">
      <h5 class="fw-bold mb-3">Crear Nuevo Usuario</h5>
      <UserForm
        bind:newUser
        roles={$roles}
        on:submit={() => {
          /* noop */
        }}
        onSubmit={crearUsuario}
      />
    </div>

    <!-- 🔸 FORMULARIO CREAR ROL -->
  {:else if activeTab === "crearRol"}
    <RoleForm on:saved={onRolGuardado} />

    <!-- 🔸 VER ROLES -->
  {:else if activeTab === "verRoles"}
    <RolePermissionsTable onEdit={() => goto(`/admin/roles`)} />
  {/if}
</div>

<style>
  .nav-tabs .nav-link.active {
    background-color: #0d6efd;
    color: white;
  }
</style>
