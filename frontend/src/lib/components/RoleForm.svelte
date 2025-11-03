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
      modulos.forEach((modulo) => {
        selectedModules[modulo.id] = false;
      });

      if (isEditing && editingRole) {
        roleName = editingRole.name || "";
        roleDescription = editingRole.description || "";
        (editingRole.modules || []).forEach((modId) => {
          selectedModules[modId] = true;
        });
      }
    } catch (err) {
      console.error("Error al cargar módulos:", err);
    } finally {
      $loading = false;
    }
  });

  async function handleSubmit() {
    if (!roleName.trim()) {
      alert("Por favor ingresa un nombre de rol");
      return;
    }

    const permisosSeleccionados = Object.entries(selectedModules)
      .filter(([_, value]) => value)
      .map(([id]) => parseInt(id));

    const roleData = {
      role_name: roleName,
      description: roleDescription,
      permissions: permisosSeleccionados,
    };

    $loading = true;
    try {
      if (isEditing) {
        await updateRole(editingRole.id, roleData);
        alert("Rol actualizado exitosamente");
      } else {
        await createRole(roleData);
        alert("Rol creado exitosamente");
      }
      dispatch("saved");
    } catch (err) {
      console.error("Error al guardar rol:", err);
      alert("Error al guardar el rol: " + err.message);
    } finally {
      $loading = false;
    }
  }

  async function handleDelete() {
    if (
      isEditing &&
      editingRole &&
      confirm("¿Seguro que deseas eliminar este rol?")
    ) {
      $loading = true;
      try {
        await deleteRole(editingRole.id);
        alert("Rol eliminado exitosamente");
        dispatch("saved");
      } catch (err) {
        console.error("Error al eliminar rol:", err);
        alert("Error al eliminar el rol");
      } finally {
        $loading = false;
      }
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
              bind:checked={selectedModules[modulo.id]}
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
