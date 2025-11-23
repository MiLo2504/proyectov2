<script context="module">
  /**
   * Obtener icono según módulo
   */
  function getModuleIcon(module) {
    const icons = {
      usuarios: "people-fill",
      citas: "calendar-check",
      analisis: "clipboard2-pulse",
      reportes: "graph-up",
      pacientes: "person-badge",
      configuracion: "gear-fill",
    };
    return icons[module] || "circle-fill";
  }

  /**
   * Obtener título legible del módulo
   */
  function getModuleTitle(module) {
    const titles = {
      usuarios: "Usuarios",
      citas: "Citas Médicas",
      analisis: "Análisis Clínicos",
      reportes: "Reportes y Dashboard",
      pacientes: "Gestión de Pacientes",
      configuracion: "Configuración",
    };
    return titles[module] || module.charAt(0).toUpperCase() + module.slice(1);
  }
</script>

<script>
  import { permissions, availableModules } from "$lib/stores/permissions.js";
  import DynamicView from "$lib/components/DynamicView.svelte";
  import { onMount } from "svelte";

  /** @type {import('./$types').PageData} */
  export let data;

  let activeModule = null;
  $: modules = $availableModules;

  // Seleccionar el primer módulo disponible por defecto
  $: if (!activeModule && modules.length > 0) {
    activeModule = modules[0];
  }

  onMount(() => {
    console.log("[DINAMICO PAGE] Componente montado");
    console.log("[DINAMICO PAGE] Data:", data);
    console.log("[DINAMICO PAGE] Modules from store:", modules);
    console.log("[DINAMICO PAGE] Active module:", activeModule);
  });
</script>

<svelte:head>
  <title>Portal Dinámico - Sistema Médico</title>
</svelte:head>

<div class="row">
  <!-- Sidebar con módulos disponibles -->
  <div class="col-md-3">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Módulos Disponibles</h5>
      </div>
      <div class="list-group list-group-flush">
        {#each modules as module}
          <button
            class="list-group-item list-group-item-action {activeModule ===
            module
              ? 'active'
              : ''}"
            on:click={() => (activeModule = module)}
          >
            <i class="bi bi-{getModuleIcon(module)} me-2"></i>
            {getModuleTitle(module)}
          </button>
        {/each}

        {#if modules.length === 0}
          <div class="list-group-item text-muted">
            <i class="bi bi-info-circle me-2"></i>
            No tienes módulos asignados
          </div>
        {/if}
      </div>
    </div>

    <!-- Información del usuario -->
    <div class="card shadow-sm mt-3">
      <div class="card-body">
        <h6 class="card-title">Mi Perfil</h6>
        <p class="mb-1"><strong>Rol:</strong> {data.user?.rol_name}</p>
        <p class="mb-1"><strong>Usuario:</strong> {data.user?.user_name}</p>
        <p class="mb-0 text-muted small">
          {modules.length} módulo{modules.length !== 1 ? "s" : ""} disponible{modules.length !==
          1
            ? "s"
            : ""}
        </p>
      </div>
    </div>
  </div>

  <!-- Contenido principal dinámico -->
  <div class="col-md-9">
    {#if activeModule}
      <DynamicView module={activeModule} user={data.user} />
    {:else}
      <div class="card shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-box-seam text-muted" style="font-size: 4rem;"></i>
          <h4 class="mt-3">Bienvenido al Sistema</h4>
          <p class="text-muted">
            Selecciona un módulo del menú lateral para comenzar
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .list-group-item-action {
    cursor: pointer;
    transition: all 0.2s;
  }

  .list-group-item-action:hover {
    background-color: #f8f9fa;
  }

  .list-group-item.active {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
</style>
