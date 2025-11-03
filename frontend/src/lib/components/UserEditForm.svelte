<script lang="ts">
  import { onMount } from "svelte";
  import { roles, loadRoles } from "../stores/roles.js";
  import UserForm from "./UserForm.svelte";

  export let user = null;
  export let onSave: (payload: any) => void;
  export let onCancel: () => void;

  let typeDocuments: any[] = [];

  onMount(() => {
    // Asegurar que la lista de roles esté cargada
    loadRoles().catch((e) => console.error("Error loading roles", e));
    // Cargar tipos de documento desde la API
    fetch("http://127.0.0.1:8000/type_documents/")
      .then((r) => r.json())
      .then((data) => {
        typeDocuments = data || [];
      })
      .catch((e) => console.error("Error loading type documents", e));
  });

  function handleSubmit(updatedUser: any) {
    if (onSave) onSave(updatedUser);
  }
</script>

{#if user}
  <div class="container py-4">
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h3 class="fw-bold text-primary mb-4">Editar Usuario #{user?.id}</h3>

        <UserForm
          {user}
          roles={$roles}
          documentTypes={typeDocuments}
          onSubmit={handleSubmit}
          {onCancel}
        />
      </div>
    </div>
  </div>
{:else}
  <p class="text-danger">Usuario no encontrado ❌</p>
{/if}
