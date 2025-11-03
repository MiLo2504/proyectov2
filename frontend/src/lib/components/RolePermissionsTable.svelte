<script>
  import { deleteRole } from "../services/roleService.js";
  import { roles, modules, loading } from "../stores/roles.js";

  export let onEdit;
  export let onDelete = handleDelete;

  async function handleDelete(roleId) {
    if (!confirm("¿Seguro que deseas eliminar este rol?")) return;
    $loading = true;
    try {
      await deleteRole(roleId);
      $roles = $roles.filter((r) => r.id !== roleId);
      alert("Rol eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      alert("Error al eliminar el rol");
    } finally {
      $loading = false;
    }
  }

  // Depuración
  $: console.log("Roles:", $roles);
  $: console.log("Modules:", $modules);
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="fw-bold mb-3">Roles Existentes</h4>
    <div class="table-responsive">
      <table class="table table-bordered align-middle text-center">
        <thead class="table-primary">
          <tr>
            <th>Nombre del Rol</th>
            <th>Descripción</th>
            {#each $modules as mod}
              <th>{mod.name}</th>
            {/each}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $roles as role (role.id)}
            <tr>
              <td class="fw-semibold">{role.name}</td>
              <td>{role.description || "--"}</td>
              {#each $modules as mod (mod.id)}
                <td>
                  {#if role.modules && Array.isArray(role.modules) && role.modules.includes(mod.id)}
                    OK
                  {:else}
                    --
                  {/if}
                </td>
              {/each}
              <td>
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  on:click={() => onEdit(role)}
                  disabled={$loading}
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  on:click={() => onDelete(role.id)}
                  disabled={$loading}
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
