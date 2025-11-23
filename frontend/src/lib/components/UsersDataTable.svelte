<script>
  import { onMount } from "svelte";
  import ActionButton from "./ActionButton.svelte";
  import PermissionGuard from "./PermissionGuard.svelte";

  // Props para control de permisos
  export let permissions = {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  };

  let users = [];
  let loading = false;

  onMount(() => {
    if (permissions.canView) {
      loadUsers();
    }
  });

  async function loadUsers() {
    loading = true;
    try {
      const response = await fetch("http://127.0.0.1:8000/users/");
      users = await response.json();
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      loading = false;
    }
  }

  function handleCreate() {
    // Lógica para crear usuario
    console.log("Crear usuario");
  }

  function handleEdit(userId) {
    // Lógica para editar
    console.log("Editar usuario:", userId);
  }

  function handleDelete(userId) {
    if (confirm("¿Eliminar este usuario?")) {
      console.log("Eliminar usuario:", userId);
    }
  }
</script>

<div class="users-table-wrapper">
  <!-- Header con botón de crear -->
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h6 class="mb-0">Lista de Usuarios</h6>

    <PermissionGuard module="usuarios" action="crear">
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
    </PermissionGuard>
  </div>

  <!-- Tabla -->
  {#if loading}
    <div class="text-center py-4">
      <div class="spinner-border text-primary"></div>
    </div>
  {:else if users.length > 0}
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Rol</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr>
              <td>{user.id}</td>
              <td>{user.user_name}</td>
              <td>{user.full_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>
                <span class="badge bg-info">{user.rol_name || "N/A"}</span>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <!-- Botón Ver -->
                  <PermissionGuard module="usuarios" action="ver">
                    <button
                      class="btn btn-outline-info btn-sm"
                      title="Ver detalles"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </PermissionGuard>

                  <!-- Botón Editar -->
                  <ActionButton
                    module="usuarios"
                    action="editar"
                    variant="warning"
                    size="sm"
                    icon="pencil"
                    title="Editar usuario"
                    onClick={() => handleEdit(user.id)}
                  />

                  <!-- Botón Eliminar -->
                  <ActionButton
                    module="usuarios"
                    action="eliminar"
                    variant="danger"
                    size="sm"
                    icon="trash"
                    title="Eliminar usuario"
                    onClick={() => handleDelete(user.id)}
                  />
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      No hay usuarios registrados
    </div>
  {/if}
</div>

<style>
  .users-table-wrapper {
    padding: 1rem;
  }

  .table {
    margin-bottom: 0;
  }
</style>
