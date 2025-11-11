<script lang="ts">
  import { goto } from "$app/navigation";
  import AppointmentForm from "$lib/components/AppointmentsForm.svelte";
  import AppointmentsTable from "$lib/components/AppointmentsTable.svelte";

  let activeTab = "list"; // 'list' o 'create'
  let appointmentsTableRef: any;

  function openCreateForm() {
    activeTab = "create";
  }

  async function onAppointmentCreated() {
    activeTab = "list";
    // Refrescar la tabla de citas
    if (appointmentsTableRef) {
      await appointmentsTableRef.refresh();
    }
  }
</script>

<div class="container my-5">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold text-primary">Gestión de Citas - Secretaria</h2>
    <button class="btn btn-secondary" on:click={() => goto("/admin")}>
      <i class="bi bi-arrow-left me-2"></i>Volver
    </button>
  </div>

  <!-- Pestañas -->
  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'list' ? 'active' : ''}"
        on:click={() => (activeTab = "list")}
      >
        Lista de Citas
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'create' ? 'active' : ''}"
        on:click={openCreateForm}
      >
        Agendar Nueva Cita
      </button>
    </li>
  </ul>

  <div class="tab-content">
    <!-- Lista de Citas -->
    <div class="tab-pane fade {activeTab === 'list' ? 'show active' : ''}">
      {#if activeTab === "list"}
        <AppointmentsTable role="secretary" bind:this={appointmentsTableRef} />
      {/if}
    </div>

    <!-- Formulario -->
    <div class="tab-pane fade {activeTab === 'create' ? 'show active' : ''}">
      {#if activeTab === "create"}
        <div class="col-lg-8 mx-auto">
          <AppointmentForm onSuccess={onAppointmentCreated} />
        </div>
      {/if}
    </div>
  </div>
</div>
