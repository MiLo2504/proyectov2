<script lang="ts">
  import { onMount } from "svelte";

  let doctor = "";
  let date = "";
  let time = "";
  let reason = "";
  let availableTimes = [];

  const doctors = [
    { id: 1, name: "Dr. Alan García" },
    { id: 2, name: "Dra. Sofía Vergara" },
    { id: 3, name: "Dr. Luis Martínez" },
  ];

  // Horarios disponibles (8 AM - 6 PM, cada 30 min)
  const allTimes = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  // Citas ocupadas (simuladas)
  let bookedSlots = [
    { doctor_id: 1, date: "2025-11-05", time: "10:00" },
    { doctor_id: 1, date: "2025-11-05", time: "10:30" },
    { doctor_id: 2, date: "2025-11-06", time: "14:30" },
  ];

  // Calcular horarios disponibles
  function updateAvailableTimes() {
    if (!doctor || !date) {
      availableTimes = [];
      return;
    }

    const doctorId = parseInt(doctor);
    availableTimes = allTimes.filter((t) => {
      return !bookedSlots.some(
        (slot) =>
          slot.doctor_id === doctorId && slot.date === date && slot.time === t
      );
    });
  }

  $: doctor, date, updateAvailableTimes();

  async function handleSubmit() {
    if (!doctor || !date || !time || !reason) {
      alert("Completa todos los campos");
      return;
    }

    // Simular guardado
    bookedSlots = [
      ...bookedSlots,
      {
        doctor_id: parseInt(doctor),
        date,
        time,
      },
    ];

    alert(
      `Cita agendada con ${doctors.find((d) => d.id === parseInt(doctor))?.name} el ${date} a las ${time}`
    );
    doctor = date = time = reason = "";
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="fw-bold mb-3">Agendar Nueva Cita</h4>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="mb-3">
        <label class="form-label" for="pc-doctor">Doctor</label>
        <select id="pc-doctor" bind:value={doctor} class="form-select" required>
          <option value="">Seleccionar doctor</option>
          {#each doctors as d}
            <option value={d.id}>{d.name}</option>
          {/each}
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label" for="pc-date">Fecha</label>
        <input
          id="pc-date"
          type="date"
          bind:value={date}
          class="form-control"
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="pc-time">Hora Disponible</label>
        {#if availableTimes.length > 0}
          <select id="pc-time" bind:value={time} class="form-select" required>
            <option value="">Seleccionar hora</option>
            {#each availableTimes as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
        {:else if doctor && date}
          <div class="alert alert-warning py-2">
            No hay horarios disponibles para este doctor en la fecha
            seleccionada.
          </div>
        {:else}
          <p class="text-muted">Selecciona doctor y fecha</p>
        {/if}
      </div>

      <div class="mb-3">
        <label class="form-label" for="pc-reason">Motivo</label>
        <textarea
          id="pc-reason"
          bind:value={reason}
          class="form-control"
          rows="2"
          required
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary w-100" disabled={!time}>
        Agendar Cita
      </button>
    </form>
  </div>
</div>
