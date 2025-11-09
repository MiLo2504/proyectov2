<script lang="ts">
  import { goto } from "$app/navigation";
  import { createAppointment } from "$lib/services/appointmentService.js";

  export let onSuccess = () => {};

  let formData = {
    patient: "",
    doctor: "",
    dateTime: "",
    reason: "",
  };

  let patients = ["Juan Pérez", "Maria Rodriguez", "Carlos Gomez"];
  let doctors = ["Dr. Alan García", "Dra. Sofia Vergara", "Dr. Luis Martinez"];

  let errorMessage = "";

  async function handleSubmit() {
    if (!formData.patient || !formData.doctor || !formData.dateTime || !formData.reason) {
      errorMessage = "Por favor, completa todos los campos";
      return;
    }

    try {
      await createAppointment(formData);
      alert("Cita agendada correctamente");
      formData = { patient: "", doctor: "", dateTime: "", reason: "" };
      onSuccess();
    } catch (err) {
      errorMessage = err.message || "Error al agendar la cita";
    }
  }

  function cancel() {
    goto("/secretary");
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="fw-bold mb-3">Agendar Nueva Cita</h4>

    {#if errorMessage}
      <div class="alert alert-danger">{errorMessage}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div class="mb-3">
        <label class="form-label">Paciente</label>
        <select bind:value={formData.patient} class="form-select" required>
          <option value="">Seleccionar paciente</option>
          {#each patients as p}
            <option value={p}>{p}</option>
          {/each}
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Doctor</label>
        <select bind:value={formData.doctor} class="form-select" required>
          <option value="">Seleccionar doctor</option>
          {#each doctors as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Fecha y Hora</label>
        <input type="datetime-local" bind:value={formData.dateTime} class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Motivo</label>
        <textarea bind:value={formData.reason} class="form-control" rows="3" required></textarea>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" on:click={cancel}>Cancelar</button>
        <button type="submit" class="btn btn-primary">Agendar</button>
      </div>
    </form>
  </div>
</div>