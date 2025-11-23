<script context="module">
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
</script>

<script>
  import { can } from "$lib/stores/permissions.js";
  import PermissionGuard from "./PermissionGuard.svelte";

  // Componentes de módulos (importar los existentes)
  import UsersDataTable from "./UsersDataTable.svelte";
  import AppointmentsTable from "./AppointmentsTable.svelte";
  import AnalysisTable from "./AnalysisTable.svelte";
  import PatientsTable from "./PatientsTable.svelte";

  export let module = "";
  export let user = null;

  // Mapear módulos a componentes
  const moduleComponents = {
    usuarios: { component: UsersDataTable, title: "Gestión de Usuarios" },
    citas: { component: AppointmentsTable, title: "Gestión de Citas" },
    analisis: { component: AnalysisTable, title: "Gestión de Análisis" },
    pacientes: { component: PatientsTable, title: "Gestión de Pacientes" },
    reportes: { component: null, title: "Reportes y Dashboard" },
    configuracion: { component: null, title: "Configuración del Sistema" },
  };

  $: moduleConfig = moduleComponents[module];
  $: canView = $can(module, "ver");
  $: canCreate = $can(module, "crear");
  $: canEdit = $can(module, "editar");
  $: canDelete = $can(module, "eliminar");
</script>

<div class="dynamic-view">
  <PermissionGuard {module} action="ver">
    <div class="card shadow-sm">
      <div
        class="card-header bg-white d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-{getModuleIcon(module)} me-2 text-primary"></i>
          {moduleConfig?.title || "Módulo"}
        </h5>

        <!-- Badges de permisos -->
        <div class="d-flex gap-2">
          {#if canCreate}
            <span class="badge bg-success">Crear</span>
          {/if}
          {#if canEdit}
            <span class="badge bg-warning">Editar</span>
          {/if}
          {#if canDelete}
            <span class="badge bg-danger">Eliminar</span>
          {/if}
          {#if canView}
            <span class="badge bg-info">Ver</span>
          {/if}
        </div>
      </div>

      <div class="card-body">
        {#if module === "usuarios" && moduleConfig.component}
          <svelte:component
            this={moduleConfig.component}
            permissions={{ canCreate, canEdit, canDelete, canView }}
          />
        {:else if module === "citas" && moduleConfig.component}
          <svelte:component
            this={moduleConfig.component}
            permissions={{ canCreate, canEdit, canDelete, canView }}
            userId={user?.id}
          />
        {:else if module === "analisis" && moduleConfig.component}
          <svelte:component
            this={moduleConfig.component}
            permissions={{ canCreate, canEdit, canDelete, canView }}
            userId={user?.id}
          />
        {:else if module === "pacientes" && moduleConfig.component}
          <svelte:component
            this={moduleConfig.component}
            permissions={{ canCreate, canEdit, canDelete, canView }}
          />
        {:else if module === "reportes"}
          <!-- Dashboard de reportes -->
          <div class="text-center py-5">
            <i class="bi bi-graph-up text-primary" style="font-size: 3rem;"></i>
            <h4 class="mt-3">Dashboard de Reportes</h4>
            <p class="text-muted">
              Aquí se mostrarán los reportes y estadísticas
            </p>

            {#if canView}
              <PermissionGuard module="reportes" action="ver">
                <!-- Aquí puedes integrar Power BI o gráficos -->
                <div class="alert alert-info mt-3">
                  <i class="bi bi-info-circle me-2"></i>
                  Tienes acceso de visualización a los reportes
                </div>
              </PermissionGuard>
            {/if}
          </div>
        {:else if module === "configuracion"}
          <!-- Configuración del sistema -->
          <div class="row g-3">
            <PermissionGuard module="configuracion" action="ver">
              <div class="col-md-6">
                <div class="list-group">
                  <div class="list-group-item list-group-item-action">
                    <i class="bi bi-file-text me-2"></i>
                    Tipos de Documento
                  </div>
                  <div class="list-group-item list-group-item-action">
                    <i class="bi bi-geo-alt me-2"></i>
                    Ubicaciones
                  </div>
                  <div class="list-group-item list-group-item-action">
                    <i class="bi bi-hospital me-2"></i>
                    Clínicas
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="list-group">
                  <div class="list-group-item list-group-item-action">
                    <i class="bi bi-heart-pulse me-2"></i>
                    Tipos de Enfermedades
                  </div>
                  <div class="list-group-item list-group-item-action">
                    <i class="bi bi-calendar-check me-2"></i>
                    Estados de Citas
                  </div>
                  <div class="list-group-item list-group-item-action">
                    <i class="bi bi-tags me-2"></i>
                    Atributos
                  </div>
                </div>
              </div>
            </PermissionGuard>
          </div>
        {:else}
          <!-- Módulo no implementado -->
          <div class="text-center py-5">
            <i class="bi bi-box text-muted" style="font-size: 3rem;"></i>
            <h4 class="mt-3">Módulo en Desarrollo</h4>
            <p class="text-muted">
              Este módulo está disponible pero aún no tiene interfaz
              implementada
            </p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Slot para fallback sin permisos -->
    <svelte:fragment slot="fallback">
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No tienes permisos para visualizar este módulo
      </div>
    </svelte:fragment>
  </PermissionGuard>
</div>

<style>
  .list-group-item-action {
    cursor: pointer;
  }

  .list-group-item-action:hover {
    background-color: #f8f9fa;
  }
</style>
