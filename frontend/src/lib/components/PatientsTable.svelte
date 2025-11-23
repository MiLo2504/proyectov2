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

  let patients = [];
  let loading = false;

  onMount(() => {
    if (permissions.canView) {
      loadPatients();
    }
  });

  async function loadPatients() {
    loading = true;
    try {
      const response = await fetch("http://127.0.0.1:8000/users/?role=patient");
      patients = await response.json();
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      loading = false;
    }
  }

  function handleCreate() {
    console.log("Registrar paciente");
  }

  function handleEdit(patientId) {
    console.log("Editar paciente:", patientId);
  }
</script>

<div class="patients-table-wrapper">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h6 class="mb-0">Gestión de Pacientes</h6>

    <PermissionGuard module="pacientes" action="crear">
      <ActionButton
        module="pacientes"
        action="crear"
        variant="success"
        size="sm"
        icon="person-plus"
        onClick={handleCreate}
      >
        Registrar Paciente
      </ActionButton>
    </PermissionGuard>
  </div>

  {#if loading}
    <div class="text-center py-4">
      <div class="spinner-border text-primary"></div>
    </div>
  {:else if patients.length > 0}
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each patients as patient}
            <tr>
              <td>{patient.id}</td>
              <td>{patient.full_name} {patient.last_name}</td>
              <td>{patient.num_document}</td>
              <td>{patient.email}</td>
              <td>{patient.phone || "N/A"}</td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-info btn-sm"
                    title="Ver historial"
                  >
                    <i class="bi bi-file-medical"></i>
                  </button>

                  <ActionButton
                    module="pacientes"
                    action="editar"
                    variant="warning"
                    size="sm"
                    icon="pencil"
                    onClick={() => handleEdit(patient.id)}
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
      No hay pacientes registrados
    </div>
  {/if}
</div>
