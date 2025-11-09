<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import AppointmentForm from "$lib/components/AppointmentsForm.svelte";
  import AppointmentsTable from "$lib/components/AppointmentsTable.svelte";
  import { appointments, loading } from "$lib/stores/appointments.js";
  import { listAppointments } from "$lib/services/appointmentService.js";

  let activeTab = "list"; // 'list' o 'create'

  // onMount(async () => {
  //   await loadAppointments();
  // });

  async function loadAppointments() {
    $loading = true;
    try {
      $appointments = await listAppointments();
    } catch (err) {
      alert("Error al cargar citas");
    } finally {
      $loading = false;
    }
  }

  function openCreateForm() {
    activeTab = "create";
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
      <AppointmentsTable
        appointments={$appointments}
        onRefresh={loadAppointments}
        onEdit={(appt) => {
          // Podrías pasar el appt al form
          alert(`Editar cita con ${appt.patient}`);
        }}
      />
    </div>

    <!-- Formulario -->
    <div class="tab-pane fade {activeTab === 'create' ? 'show active' : ''}">
      <div class="col-lg-8 mx-auto">
        <AppointmentForm
          onSuccess={() => {
            activeTab = "list";
            loadAppointments();
          }}
        />
      </div>
    </div>
  </div>
</div>
