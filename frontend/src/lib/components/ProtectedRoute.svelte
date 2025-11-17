<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { protectRoute } from "$lib/utils/rbac.js";

  /**
   * Componente de layout para rutas protegidas
   * Uso: <ProtectedRoute requireModule="Usuarios">...</ProtectedRoute>
   */
  export let requireModule = null; // módulo requerido (ID, nombre, o array)
  export let requireAll = false; // si es array, requiere todos o solo uno
  export let requireRole = null; // rol requerido (opcional, puede ser array)

  let isAuthorized = false;
  let isLoading = true;

  onMount(() => {
    // Verificar permisos
    const hasPermission = protectRoute(requireModule, "/login", requireAll);

    if (hasPermission) {
      isAuthorized = true;
    }

    isLoading = false;
  });
</script>

{#if isLoading}
  <div
    class="d-flex justify-content-center align-items-center"
    style="min-height: 50vh;"
  >
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Verificando permisos...</span>
    </div>
  </div>
{:else if isAuthorized}
  <slot />
{:else}
  <div class="container mt-5">
    <div class="alert alert-danger">
      <h4>Acceso Denegado</h4>
      <p>No tienes permisos para acceder a esta sección.</p>
      <button class="btn btn-primary" on:click={() => goto("/")}
        >Volver al inicio</button
      >
    </div>
  </div>
{/if}
