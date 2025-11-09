<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  export let open: boolean = false;
  export let appointment: any = null; // objeto con campos id, patient, doctor, dateTime, reason, state

  const dispatch = createEventDispatcher();

  // Campos locales del formulario
  let patient = "";
  let doctor = "";
  let dateTime = ""; // formato para input datetime-local: YYYY-MM-DDTHH:MM
  let reason = "";
  let state = 1;
  let _uid = "";

  onMount(() => {
    _uid = Math.random().toString(36).slice(2, 9);
  });

  // Cuando el modal se abre, copiar los valores del appointment
  $: if (open && appointment) {
    patient = appointment.patient ?? "";
    doctor = appointment.doctor ?? "";
    reason = appointment.reason ?? "";
    state = typeof appointment.state === "number" ? appointment.state : 1;
    try {
      dateTime = appointment.dateTime
        ? new Date(appointment.dateTime).toISOString().slice(0, 16)
        : "";
    } catch {
      dateTime = "";
    }
  }

  function close() {
    dispatch("close");
  }

  function backdropKeydown(e: KeyboardEvent) {
    // Enter or Space should activate (close)
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      close();
    }
  }

  function wrapperKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function submit() {
    const payload = {
      ...appointment,
      patient,
      doctor,
      reason,
      state: Number(state),
      dateTime: dateTime ? new Date(dateTime).toISOString() : null,
    };
    dispatch("save", { appointment: payload });
  }
</script>

{#if open}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="0"
    on:click={close}
    on:keydown={backdropKeydown}
    aria-label="Cerrar modal"
  ></div>
  <div
    class="modal-wrapper"
    role="dialog"
    aria-modal="true"
    on:keydown={wrapperKeydown}
    tabindex="-1"
  >
    <div class="modal-card shadow">
      <div
        class="modal-header d-flex justify-content-between align-items-center"
      >
        <h5 class="modal-title">Editar cita</h5>
        <button
          class="btn btn-sm btn-outline-secondary"
          type="button"
          on:click={close}
          aria-label="Cerrar">✕</button
        >
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label" for={"patient-" + _uid}>Paciente</label>
          <input
            id={"patient-" + _uid}
            class="form-control"
            bind:value={patient}
            placeholder="Nombre del paciente"
          />
        </div>
        <div class="mb-3">
          <label class="form-label" for={"doctor-" + _uid}>Doctor</label>
          <input
            id={"doctor-" + _uid}
            class="form-control"
            bind:value={doctor}
            placeholder="Nombre del doctor"
          />
        </div>
        <div class="mb-3">
          <label class="form-label" for={"datetime-" + _uid}>Fecha y hora</label
          >
          <input
            id={"datetime-" + _uid}
            class="form-control"
            type="datetime-local"
            bind:value={dateTime}
          />
        </div>
        <div class="mb-3">
          <label class="form-label" for={"reason-" + _uid}>Motivo</label>
          <textarea
            id={"reason-" + _uid}
            class="form-control"
            rows={3}
            bind:value={reason}
          ></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label" for={"state-" + _uid}>Estado</label>
          <select id={"state-" + _uid} class="form-select" bind:value={state}>
            <option value={1}>Activa</option>
            <option value={0}>Cancelada</option>
          </select>
        </div>
      </div>

      <div class="modal-footer d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" type="button" on:click={close}
          >Cancelar</button
        >
        <button class="btn btn-primary" type="button" on:click={submit}
          >Guardar</button
        >
      </div>
    </div>
  </div>

  <style>
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1050;
    }
    .modal-wrapper {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1060;
      padding: 1rem;
    }
    .modal-card {
      width: 100%;
      max-width: 680px;
      background: var(--bs-body-bg, #fff);
      border-radius: 0.5rem;
      overflow: hidden;
    }
    .modal-header {
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .modal-body {
      padding: 1rem;
    }
    .modal-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }
  </style>
{/if}
