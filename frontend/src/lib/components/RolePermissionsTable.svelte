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
                  class="btn btn-sm btn-primary me-2 d-flex align-items-center justify-content-center"
                  on:click={() => onEdit(role)}
                  disabled={$loading}
                  aria-label="Editar rol"
                  title="Editar rol"
                >
                  <!-- Pencil (edit) SVG -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-pencil"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.439 9.439a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.439-9.439zM11.207 2L3 10.207V13h2.793L14 4.793 11.207 2z"
                    />
                  </svg>
                </button>
                <button
                  class="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
                  on:click={() => onDelete(role.id)}
                  disabled={$loading}
                  aria-label="Eliminar rol"
                  title="Eliminar rol"
                >
                  <!-- Trash (delete) SVG -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-trash"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-7z"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2h3.11a1 1 0 0 1 .9-.553h2.98a1 1 0 0 1 .9.553H14.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H3v9a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V4h.5a.5.5 0 0 0 0-1H2.5z"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
