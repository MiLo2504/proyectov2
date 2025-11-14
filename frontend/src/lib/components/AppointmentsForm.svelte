<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth.js";
  import { createAppointment } from "$lib/services/appointmentService.js";
  import {
    fetchDepartments,
    fetchCities,
    fetchClinics,
    fetchDoctorsByClinic,
  } from "$lib/services/locationService.js";
  import { fetchUsers } from "$lib/services/userService.js";

  export let onSuccess = () => {};
  export let isPatientView = false; // Si es true, es la vista del paciente

  let currentUser: any = null;
  let formData = {
    id_user: "",
    id_user_doctor: "",
    appointment_date: "",
    id_state: 1,
  };

  // Listas para los select
  let departments: any[] = [];
  let cities: any[] = [];
  let clinics: any[] = [];
  let patients: any[] = [];
  let doctors: any[] = [];

  // Selecciones actuales
  let selectedDepartment = "";
  let selectedCity = "";
  let selectedClinic = "";

  let loading = false;
  let errorMessage = "";

  // Suscribirse al store de auth para obtener el usuario actual
  auth.subscribe((value) => {
    if (value.user) {
      currentUser = value.user;
      // Si es un paciente (id_rol === 3), pre-cargar su ID
      if (currentUser.id_rol === 3) {
        formData.id_user = String(currentUser.id);
        isPatientView = true;
      }
    }
  });

  onMount(async () => {
    loading = true;
    try {
      // Cargar departamentos
      departments = (await fetchDepartments()) || [];

      // Si NO es vista de paciente, cargar lista de pacientes
      if (!isPatientView) {
        const users = await fetchUsers();
        patients =
          users.filter((u: any) => u.id_rol === 3 && u.state === 1) || [];
      }
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
      errorMessage = "Error al cargar datos iniciales";
    } finally {
      loading = false;
    }
  });

  // Cuando cambia el departamento, cargar ciudades
  async function handleDepartmentChange() {
    cities = [];
    clinics = [];
    doctors = [];
    selectedCity = "";
    selectedClinic = "";
    formData.id_user_doctor = "";

    if (!selectedDepartment) return;

    loading = true;
    try {
      cities = await fetchCities(selectedDepartment);
    } catch (err) {
      console.error("Error cargando ciudades:", err);
      errorMessage = "Error al cargar ciudades";
    } finally {
      loading = false;
    }
  }

  // Cuando cambia la ciudad, cargar clínicas
  async function handleCityChange() {
    clinics = [];
    doctors = [];
    selectedClinic = "";
    formData.id_user_doctor = "";

    if (!selectedCity) return;

    loading = true;
    try {
      clinics = await fetchClinics(selectedCity);
    } catch (err) {
      console.error("Error cargando clínicas:", err);
      errorMessage = "Error al cargar clínicas";
    } finally {
      loading = false;
    }
  }

  // Cuando cambia la clínica, cargar doctores de esa clínica
  async function handleClinicChange() {
    formData.id_user_doctor = "";

    if (!selectedClinic) {
      doctors = [];
      return;
    }

    loading = true;
    try {
      // Obtener doctores asociados a esta clínica desde el servicio Express
      doctors = await fetchDoctorsByClinic(selectedClinic);
      if (doctors.length === 0) {
        errorMessage = "No hay doctores disponibles en esta clínica";
      }
    } catch (err) {
      console.error("Error cargando doctores:", err);
      errorMessage = "Error al cargar doctores";
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (
      !formData.id_user ||
      !formData.id_user_doctor ||
      !formData.appointment_date
    ) {
      errorMessage = "Por favor, completa todos los campos obligatorios";
      return;
    }

    loading = true;
    errorMessage = "";
    try {
      await createAppointment(formData);
      alert("Cita agendada correctamente ✅");
      // Resetear formulario
      formData = {
        id_user: "",
        id_user_doctor: "",
        appointment_date: "",
        id_state: 1,
      };
      selectedDepartment = "";
      selectedCity = "";
      selectedClinic = "";
      cities = [];
      clinics = [];
      doctors = [];
      onSuccess();
    } catch (err) {
      console.error("Error al agendar cita:", err);
      errorMessage = err.message || "Error al agendar la cita";
    } finally {
      loading = false;
    }
  }

  function cancel() {
    if (isPatientView) {
      goto("/patient");
    } else {
      goto("/secretary");
    }
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="fw-bold mb-3">Agendar Nueva Cita</h4>

    {#if errorMessage}
      <div class="alert alert-danger">{errorMessage}</div>
    {/if}

    {#if loading}
      <div class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <!-- Paciente -->
      {#if isPatientView}
        <!-- Vista de paciente: mostrar nombre del usuario logueado -->
        <div class="mb-3">
          <label class="form-label">Paciente</label>
          <input
            type="text"
            class="form-control"
            value="{currentUser?.full_name || ''} {currentUser?.last_name ||
              ''}"
            disabled
          />
          <small class="text-muted">Estás agendando una cita para ti</small>
        </div>
      {:else}
        <!-- Vista de secretaria: seleccionar paciente -->
        <div class="mb-3">
          <label class="form-label"
            >Paciente <span class="text-danger">*</span></label
          >
          <select
            bind:value={formData.id_user}
            class="form-select"
            required
            disabled={loading}
          >
            <option value="">Seleccionar paciente</option>
            {#each patients as patient}
              <option value={patient.id}>
                {patient.full_name}
                {patient.last_name} - {patient.num_document || "Sin documento"}
              </option>
            {/each}
          </select>
        </div>
      {/if}

      <!-- Departamento -->
      <div class="mb-3">
        <label class="form-label"
          >Departamento <span class="text-danger">*</span></label
        >
        <select
          bind:value={selectedDepartment}
          on:change={handleDepartmentChange}
          class="form-select"
          required
          disabled={loading}
        >
          <option value="">Seleccionar departamento</option>
          {#each departments as dept}
            <option value={dept.id}>{dept.name}</option>
          {/each}
        </select>
      </div>

      <!-- Ciudad -->
      <div class="mb-3">
        <label class="form-label"
          >Ciudad <span class="text-danger">*</span></label
        >
        <select
          bind:value={selectedCity}
          on:change={handleCityChange}
          class="form-select"
          required
          disabled={loading || !selectedDepartment}
        >
          <option value="">Seleccionar ciudad</option>
          {#each cities as city}
            <option value={city.id}>{city.name}</option>
          {/each}
        </select>
        {#if !selectedDepartment}
          <small class="text-muted">Primero selecciona un departamento</small>
        {/if}
      </div>

      <!-- Clínica -->
      <div class="mb-3">
        <label class="form-label"
          >Clínica <span class="text-danger">*</span></label
        >
        <select
          bind:value={selectedClinic}
          on:change={handleClinicChange}
          class="form-select"
          required
          disabled={loading || !selectedCity}
        >
          <option value="">Seleccionar clínica</option>
          {#each clinics as clinic}
            <option value={clinic.id}>
              {clinic.name} - {clinic.address || "Sin dirección"}
            </option>
          {/each}
        </select>
        {#if !selectedCity}
          <small class="text-muted">Primero selecciona una ciudad</small>
        {/if}
      </div>

      <!-- Doctor -->
      <div class="mb-3">
        <label class="form-label"
          >Doctor <span class="text-danger">*</span></label
        >
        <select
          bind:value={formData.id_user_doctor}
          class="form-select"
          required
          disabled={loading || !selectedClinic}
        >
          <option value="">Seleccionar doctor</option>
          {#each doctors as doctor}
            <option value={doctor.id}>
              {doctor.full_name}
              {doctor.last_name}
            </option>
          {/each}
        </select>
        {#if !selectedClinic}
          <small class="text-muted">Primero selecciona una clínica</small>
        {/if}
      </div>

      <!-- Fecha y Hora -->
      <div class="mb-3">
        <label class="form-label"
          >Fecha y Hora <span class="text-danger">*</span></label
        >
        <input
          type="datetime-local"
          bind:value={formData.appointment_date}
          class="form-control"
          required
          disabled={loading}
        />
      </div>

      <!-- Botones -->
      <div class="d-flex justify-content-end gap-2">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={cancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {loading ? "Agendando..." : "Agendar Cita"}
        </button>
      </div>
    </form>
  </div>
</div>
