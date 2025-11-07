<script>
  import { onMount, onDestroy, tick, createEventDispatcher } from "svelte";
  import {
    listAppointments,
    updateAppointment,
  } from "$lib/services/appointmentService.js";
  import { fetchUsers } from "$lib/services/userService.js";
  import { listStateAppointments } from "$lib/services/stateAppointmentService.js";

  export let ensureDataTablesLoaded; // función inyectada desde el padre

  const dispatch = createEventDispatcher();

  let loading = true;
  let error = "";
  let appointments = [];
  let users = [];
  let apptStates = [];

  // DataTables
  let tableEl;
  let dt = null;
  let initialized = false;
  let initRetries = 0;

  $: userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));
  $: apptStateMap = Object.fromEntries(
    (apptStates || []).map((s) => [s.id_state, s.state_name])
  );

  function apptStateBadgeClass(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("pendiente") || n.includes("pending")) return "bg-secondary";
    if (n.includes("confirmada") || n.includes("confirm")) return "bg-primary";
    if (n.includes("cancelada") || n.includes("cancel")) return "bg-danger";
    if (n.includes("completada") || n.includes("complete")) return "bg-success";
    if (
      n.includes("no asist") ||
      n.includes("no show") ||
      n.includes("no-show")
    )
      return "bg-warning text-dark";
    return "bg-secondary";
  }

  function formatDate(dt) {
    try {
      return dt ? new Date(dt).toLocaleString() : "-";
    } catch {
      return "-";
    }
  }

  async function initDT() {
    try {
      await ensureDataTablesLoaded?.();
      const DataTableCtor = window?.DataTable || globalThis?.DataTable;
      // Si aún no está listo o la tabla no está conectada al DOM, reintentar unas veces
      if (
        (!DataTableCtor || !tableEl || !document.contains(tableEl)) &&
        initRetries < 20
      ) {
        initRetries += 1;
        await new Promise((r) => setTimeout(r, 100));
        return initDT();
      }
      if (DataTableCtor && tableEl) {
        try {
          if (dt && typeof dt.destroy === "function") dt.destroy();
        } catch {}
        dt = new DataTableCtor(tableEl, {
          paging: true,
          searching: true,
          ordering: true,
          lengthMenu: [10, 25, 50, 100],
          pageLength: 10,
          layout: {
            topStart: "pageLength",
            topEnd: "search",
            bottomStart: "info",
            bottomEnd: "paging",
          },
          language: {
            url: "https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json",
          },
        });
        initialized = true;
        initRetries = 0;
      }
    } catch (e) {
      console.error("DT citas:", e);
    }
  }

  async function loadData() {
    loading = true;
    error = "";
    try {
      const [apps, allUsers, states] = await Promise.all([
        listAppointments().catch(() => []),
        fetchUsers().catch(() => []),
        listStateAppointments().catch(() => []),
      ]);
      appointments = apps || [];
      users = allUsers || [];
      apptStates = states || [];
    } catch (e) {
      error = e?.message || "Error cargando citas";
    } finally {
      // aseguramos que la tabla esté en el DOM antes de initDT
      loading = false;
      await tick();
      if (!error) {
        await initDT();
        dispatch("loaded", { total: appointments.length });
      }
    }
  }

  onMount(loadData);

  onDestroy(() => {
    try {
      if (dt && typeof dt.destroy === "function") dt.destroy();
    } catch {}
    dt = null;
    initialized = false;
  });

  // API pública para permitir refresh desde el padre si fuera necesario
  export async function refresh() {
    try {
      if (dt && typeof dt.destroy === "function") dt.destroy();
    } catch {}
    dt = null;
    initialized = false;
    initRetries = 0;
    await loadData();
  }

  async function changeAppointmentState(appt, newStateId) {
    if (!appt || !appt.id_appointment) return;
    try {
      const updated = await updateAppointment(appt.id_appointment, {
        id_state: newStateId,
      });
      if (updated) {
        appointments = (appointments || []).map((x) =>
          x?.id_appointment === appt.id_appointment
            ? { ...x, id_state: updated.id_state }
            : x
        );
        try {
          if (dt && typeof dt.destroy === "function") dt.destroy();
        } catch {}
        dt = null;
        initialized = false;
        await tick();
        await initDT();
      }
    } catch (e) {
      console.error("No se pudo cambiar estado de cita:", e);
      alert(e?.message || "Error cambiando estado");
    }
  }
</script>

{#if loading}
  <div class="alert alert-info">Cargando citas...</div>
{:else if error}
  <div class="alert alert-danger">{error}</div>
{:else}
  <div class="table-responsive">
    <table class="table table-striped align-middle" bind:this={tableEl}>
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Paciente</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each appointments as c}
          <tr>
            <td>{c?.id_appointment}</td>
            <td
              >{userMap[c?.id_user]?.full_name ||
                userMap[c?.id_user]?.name ||
                c?.id_user ||
                "-"}</td
            >
            <td>{formatDate(c?.appointment_date)}</td>
            <td>
              {#key c?.id_state}
                <span
                  class="badge {apptStateBadgeClass(apptStateMap[c?.id_state])}"
                >
                  {apptStateMap[c?.id_state] || c?.id_state || "-"}
                </span>
              {/key}
            </td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <select
                  class="form-select form-select-sm"
                  value={c?.id_state}
                  on:change={(e) => {
                    const v = Number(e.currentTarget?.value);
                    if (!Number.isFinite(v) || v === c?.id_state) return;
                    changeAppointmentState(c, v);
                  }}
                >
                  {#each apptStates as s}
                    <option
                      value={s.id_state}
                      selected={s.id_state === c?.id_state}
                      >{s.state_name}</option
                    >
                  {/each}
                </select>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  :global(.dataTables_wrapper .dataTables_length select),
  :global(.dataTables_wrapper .dataTables_filter input) {
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    padding: 0.375rem 0.75rem;
  }
  .badge {
    font-weight: 500;
  }
  .table td,
  .table th {
    vertical-align: middle;
  }
  .table {
    width: 100%;
  }
  .table-responsive {
    overflow-x: auto;
  }
  .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.02);
  }
</style>
