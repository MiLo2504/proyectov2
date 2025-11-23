<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { modules, loading } from "../stores/roles.js";
  import {
    fetchModules,
    createRole,
    updateRole,
    deleteRole,
  } from "../services/roleService.js";

  const dispatch = createEventDispatcher();

  export let editingRole = null;
  export let isEditing = false;

  let roleName = "";
  let roleDescription = "";
  let selectedModules = {};
  onMount(async () => {
    $loading = true;
    try {
      const modulos = await fetchModules();
      $modules = modulos;

      // Inicializar mapa de selectedModules según los módulos disponibles
      const base = {};
      modulos.forEach((m) => (base[m.id] = false));

      // Si estamos en edición y hay un editingRole, marcar los permisos iniciales
      if (isEditing && editingRole) {
        (editingRole.modules || []).forEach((mid) => {
          if (base[mid] !== undefined) base[mid] = true;
        });
      }

      selectedModules = base;
    } catch (err) {
      console.error("Error al cargar módulos:", err);
    } finally {
      $loading = false;
    }
  });

  // Cuando entremos en modo edición o cambie el editingRole, poblar campos y permisos
  $: if ($modules && isEditing && editingRole) {
    roleName = editingRole.name || "";
    roleDescription = editingRole.description || "";
    const map = {};
    $modules.forEach((m) => {
      map[m.id] = (editingRole.modules || []).includes(m.id);
    });
    selectedModules = map;
  }

  // Cuando pasamos a modo creación, resetear campos (no depende de cambios en selectedModules)
  $: if ($modules && !isEditing) {
    roleName = "";
    roleDescription = "";
    const map = {};
    $modules.forEach((m) => (map[m.id] = false));
    selectedModules = map;
  }

  async function handleSubmit() {
    if (!roleName.trim()) {
      alert("Por favor ingresa un nombre de rol");
      return;
    }

    if (roleName.trim().length < 3) {
      alert("El nombre del rol debe tener al menos 3 caracteres");
      return;
    }

    const permisosSeleccionados = Object.entries(selectedModules)
      .filter(([_, value]) => value)
      .map(([id]) => parseInt(id));

    if (permisosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un módulo para el rol");
      return;
    }

    const roleData = {
      role_name: roleName.trim(),
      description: roleDescription.trim(),
      permissions: permisosSeleccionados,
    };

    $loading = true;
    try {
      if (isEditing) {
        await updateRole(editingRole.id, roleData);
        alert("✅ Rol actualizado exitosamente");
      } else {
        await createRole(roleData);
        alert("✅ Rol creado exitosamente");
      }
      dispatch("saved");
    } catch (err) {
      console.error("Error al guardar rol:", err);

      // Manejar mensajes de error específicos del backend
      let errorMsg = "Error al guardar el rol";
      if (err.body && err.body.detail) {
        errorMsg = err.body.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }

      alert("❌ " + errorMsg);
    } finally {
      $loading = false;
    }
  }

  async function handleDelete() {
    if (!isEditing || !editingRole) return;

    const confirmMsg = `¿Estás seguro de eliminar el rol "${editingRole.name}"?\n\nEsta acción no se puede deshacer.`;

    if (!confirm(confirmMsg)) return;

    $loading = true;
    try {
      await deleteRole(editingRole.id);
      alert("✅ Rol eliminado exitosamente");
      dispatch("saved");
    } catch (err) {
      console.error("Error al eliminar rol:", err);

      // Manejar mensajes de error específicos
      let errorMsg = "Error al eliminar el rol";
      if (err.body && err.body.detail) {
        errorMsg = err.body.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }

      alert("❌ " + errorMsg);
    } finally {
      $loading = false;
    }
  }

  function handleCancel() {
    dispatch("cancel");
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="fw-bold mb-3">{isEditing ? "Actualizar Rol" : "Nuevo Rol"}</h4>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="mb-3">
        <label for="role-name" class="form-label">Nombre del Perfil</label>
        <input
          id="role-name"
          type="text"
          class="form-control"
          bind:value={roleName}
          required
        />
      </div>

      <div class="mb-3">
        <label for="role-desc" class="form-label">Descripción</label>
        <textarea
          id="role-desc"
          class="form-control"
          rows="2"
          bind:value={roleDescription}
        ></textarea>
      </div>

      <h5 class="mb-3">Módulos</h5>
      {#if $modules.length > 0}
        {#each $modules as modulo (modulo.id)}
          <div class="form-check mb-2">
            <input
              class="form-check-input"
              type="checkbox"
              id="mod-{modulo.id}"
              checked={!!selectedModules[modulo.id]}
              on:change={(e) => {
                // actualizar y reasignar para forzar reactividad
                selectedModules[modulo.id] = e.target.checked;
                selectedModules = { ...selectedModules };
              }}
            />
            <label class="form-check-label" for="mod-{modulo.id}">
              {modulo.name}
            </label>
          </div>
        {/each}
      {:else}
        <p class="text-muted">Cargando módulos...</p>
      {/if}

      <div class="d-flex justify-content-start gap-2 mt-4">
        <button type="button" class="btn btn-primary" on:click={handleSubmit}>
          {isEditing ? "Actualizar" : "Registrar"}
        </button>
        {#if isEditing}
          <button type="button" class="btn btn-danger" on:click={handleDelete}>
            Eliminar
          </button>
        {/if}
        <button type="button" class="btn btn-secondary" on:click={handleCancel}>
          Cancelar
        </button>
      </div>
    </form>
  </div>
</div>
