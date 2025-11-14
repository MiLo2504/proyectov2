<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import PatientInfoForm from "$lib/components/PatientInfoForm.svelte";
  import PatientInfoCard from "$lib/components/PatientInfoCard.svelte";
  import AnalysisUpload from "$lib/components/AnalysisUpload.svelte";
  import AnalysisList from "$lib/components/AnalysisList.svelte";
  import AppointmentsForm from "$lib/components/AppointmentsForm.svelte";
  import {
    fetchPatient,
    updatePatient,
    uploadAnalysis,
    fetchAnalyses,
  } from "$lib/services/patientService.js";

  let patient: any = null;
  let analyses: any[] = [];
  let loading = false;
  let activeTab = "profile"; // Empezar en el perfil

  // Suscribirse al store de autenticación para obtener el paciente
  auth.subscribe((value) => {
    if (value.user) {
      patient = value.user;
    }
  });

  onMount(async () => {
    // Si el paciente no está en el store, intentar cargarlo
    if (!patient) {
      loading = true;
      try {
        patient = await fetchPatient(); // fetchPatient ahora usa /users/me
        auth.update((current) => ({ ...current, user: patient })); // Actualizar el store
      } catch (e) {
        console.error("Error cargando paciente", e);
      } finally {
        loading = false;
      }
    }
    // Cargar análisis del paciente
    if (patient?.id) {
      analyses = await fetchAnalyses(patient.id);
    }
  });

  async function handleSave(event: CustomEvent) {
    const dataToSave = event.detail;
    if (!patient?.id) {
      alert("No hay paciente cargado");
      return;
    }
    try {
      const updatedPatient = await updatePatient(patient.id, dataToSave);
      patient = { ...patient, ...updatedPatient }; // Actualizar datos locales
      auth.update((current) => ({ ...current, user: patient })); // Actualizar el store
      alert("Perfil actualizado");
      activeTab = "profile"; // Volver a la vista de perfil
    } catch (e) {
      console.error(e);
      alert(`Error al actualizar el perfil: ${e.message}`);
    }
  }

  async function handleUpload(event: CustomEvent) {
    const file = event.detail.file;
    if (!file) return;
    loading = true;
    try {
      await uploadAnalysis(file);
      // Recargar la lista de análisis después de subir uno nuevo
      if (patient?.id) {
        analyses = await fetchAnalyses(patient.id);
      }
      alert("Imagen subida y en proceso de análisis.");
      activeTab = "results"; // Cambiar a la pestaña de resultados
    } catch (e) {
      alert(`Error al subir el archivo: ${e.message}`);
    } finally {
      loading = false;
    }
  }
</script>

<div class="container my-5">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold text-primary">
      {#if patient}
        Bienvenido, {patient.full_name}
      {:else}
        Portal del Paciente
      {/if}
    </h2>
  </div>

  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'upload' ? 'active' : ''}"
        on:click={() => (activeTab = "upload")}
      >
        Subir Imagen
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'results' ? 'active' : ''}"
        on:click={() => (activeTab = "results")}
      >
        Mis Resultados
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'schedule' ? 'active' : ''}"
        on:click={() => (activeTab = "schedule")}
      >
        Agendar Cita
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'profile' ? 'active' : ''}"
        on:click={() => (activeTab = "profile")}
      >
        Mi Perfil
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link {activeTab === 'actualizar' ? 'active' : ''}"
        on:click={() => (activeTab = "actualizar")}
      >
        Actualizar
      </button>
    </li>
  </ul>

  <div class="tab-content">
    <div class="tab-pane fade {activeTab === 'upload' ? 'show active' : ''}">
      <div class="col-lg-8 mx-auto">
        <AnalysisUpload onAnalyze={handleUpload} />
      </div>
    </div>

    <div class="tab-pane fade {activeTab === 'results' ? 'show active' : ''}">
      {#if loading}
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      {:else}
        <AnalysisList {analyses} />
      {/if}
    </div>

    <div class="tab-pane fade {activeTab === 'schedule' ? 'show active' : ''}">
      <div class="col-lg-8 mx-auto">
        <AppointmentsForm
          isPatientView={true}
          onSuccess={() => {
            alert(
              "Cita agendada exitosamente. Podrás ver tus citas próximamente."
            );
            activeTab = "profile";
          }}
        />
      </div>
    </div>

    <div class="tab-pane fade {activeTab === 'profile' ? 'show active' : ''}">
      <div class="col-lg-8 mx-auto">
        {#if patient}
          <PatientInfoCard {patient} />
        {:else if loading}
          <p class="text-center text-muted">Cargando perfil...</p>
        {:else}
          <p class="text-center text-danger">
            No se pudo cargar el perfil. Intenta recargar la página.
          </p>
        {/if}
      </div>
    </div>

    <div
      class="tab-pane fade {activeTab === 'actualizar' ? 'show active' : ''}"
    >
      <div class="col-lg-8 mx-auto">
        {#if patient}
          <PatientInfoForm {patient} on:save={handleSave} />
        {:else if loading}
          <p class="text-center text-muted">Cargando perfil...</p>
        {/if}
      </div>
    </div>
  </div>
</div>
