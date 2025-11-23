<script>
  import { onMount } from "svelte";
  import ActionButton from "./ActionButton.svelte";
  import PermissionGuard from "./PermissionGuard.svelte";

  export let permissions = {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  };

  export let userId = null;

  let analyses = [];
  let loading = false;

  onMount(() => {
    if (permissions.canView) {
      loadAnalyses();
    }
  });

  async function loadAnalyses() {
    loading = true;
    try {
      const url = userId
        ? `http://127.0.0.1:8000/analysis/user/${userId}`
        : "http://127.0.0.1:8000/analysis/";
      const response = await fetch(url);
      analyses = await response.json();
    } catch (error) {
      console.error("Error loading analyses:", error);
    } finally {
      loading = false;
    }
  }

  function handleCreate() {
    console.log("Crear análisis");
  }

  function handleEdit(analysisId) {
    console.log("Editar análisis:", analysisId);
  }

  function handleDelete(analysisId) {
    if (confirm("¿Eliminar este análisis?")) {
      console.log("Eliminar análisis:", analysisId);
    }
  }
</script>

<div class="analysis-table-wrapper">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h6 class="mb-0">Análisis Clínicos</h6>

    <PermissionGuard module="analisis" action="crear">
      <ActionButton
        module="analisis"
        action="crear"
        variant="primary"
        size="sm"
        icon="file-earmark-medical"
        onClick={handleCreate}
      >
        Nuevo Análisis
      </ActionButton>
    </PermissionGuard>
  </div>

  {#if loading}
    <div class="text-center py-4">
      <div class="spinner-border text-primary"></div>
    </div>
  {:else if analyses.length > 0}
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Tipo</th>
            <th>Resultado</th>
            <th>Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each analyses as analysis}
            <tr>
              <td>{analysis.id}</td>
              <td>{analysis.date || "N/A"}</td>
              <td>{analysis.patient_name || "N/A"}</td>
              <td>{analysis.type || "General"}</td>
              <td>{analysis.result || "Pendiente"}</td>
              <td>
                <span class="badge bg-info"
                  >{analysis.status || "En proceso"}</span
                >
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <ActionButton
                    module="analisis"
                    action="editar"
                    variant="warning"
                    size="sm"
                    icon="pencil"
                    onClick={() => handleEdit(analysis.id)}
                  />

                  <ActionButton
                    module="analisis"
                    action="eliminar"
                    variant="danger"
                    size="sm"
                    icon="trash"
                    onClick={() => handleDelete(analysis.id)}
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
      No hay análisis registrados
    </div>
  {/if}
</div>
