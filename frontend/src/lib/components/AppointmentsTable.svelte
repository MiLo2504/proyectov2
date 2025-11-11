<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { auth } from "$lib/stores/auth.js";
  import { listAppointments } from "$lib/services/appointmentService.js";

  export let role = "doctor"; // Por defecto es doctor

  let appointments: any[] = [];
  let loading = true;
  let tableElement: HTMLTableElement | null = null;
  let dataTable: any = null;
  let initialized = false;
  let lastInitCount = 0;

  // Función para cargar las citas desde el backend
  async function loadAppointments() {
    loading = true;
    try {
      const data = await listAppointments(role);
      appointments = data || [];
    } catch (error) {
      console.error("Error cargando citas:", error);
      appointments = [];
    } finally {
      loading = false;
    }
  }

  // Función para manejar cambios de estado
  async function handleStateChange(appt: any) {
    try {
      const { updateAppointment } = await import(
        "$lib/services/appointmentService.js"
      );
      await updateAppointment(appt.id_appointment, { id_state: appt.id_state });
      alert("Estado de la cita actualizado correctamente ✅");
    } catch (error) {
      console.error("Error actualizando estado de cita:", error);
      alert("Error al actualizar el estado de la cita ❌");
      // Recargar las citas para revertir el cambio visual
      await loadAppointments();
    }
  }

  function loadCssOnce(href: string) {
    if (typeof document === "undefined") return;
    if (
      [...document.styleSheets].some(
        (s: any) => s?.href && s.href.includes(href)
      )
    )
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-injected-by", "appointmentsTable");
    document.head.appendChild(link);
  }

  function loadScriptOnce(src: string): Promise<void> {
    if (typeof document === "undefined") return Promise.resolve();
    if ([...document.scripts].some((s: any) => s?.src && s.src.includes(src)))
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-injected-by", "appointmentsTable");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(script);
    });
  }

  async function ensureDataTablesLoaded() {
    // DataTables v2 (vanilla) + Bootstrap integration
    loadCssOnce(
      "https://cdn.datatables.net/2.3.4/css/dataTables.bootstrap5.css"
    );
    // Bootstrap bundle (required by some styles)
    await loadScriptOnce(
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js"
    );
    // DataTables v2 (vanilla)
    await loadScriptOnce("https://cdn.datatables.net/2.3.4/js/dataTables.js");
    await loadScriptOnce(
      "https://cdn.datatables.net/2.3.4/js/dataTables.bootstrap5.js"
    );
  }

  // Función para inicializar DataTables
  async function initDataTable() {
    try {
      await ensureDataTablesLoaded();
      // @ts-ignore
      const DataTableCtor =
        (window as any).DataTable || (globalThis as any).DataTable;
      if (DataTableCtor && tableElement) {
        try {
          if (dataTable && typeof dataTable.destroy === "function")
            dataTable.destroy();
        } catch (e) {}

        dataTable = new DataTableCtor(tableElement, {
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
          order: [[2, "desc"]], // Ordenar por fecha descendente
          columnDefs: [
            { targets: [4], orderable: false }, // Columna de acciones no ordenable
          ],
        });
        initialized = true;
        lastInitCount = appointments.length;
      }
    } catch (e) {
      console.error("No se pudo inicializar DataTable:", e);
    }
  }

  // Función pública para refrescar desde el padre
  export async function refresh() {
    await loadAppointments();
  }

  onMount(async () => {
    await loadAppointments();
    await tick();
    await initDataTable();
  });

  onDestroy(() => {
    try {
      if (dataTable && typeof dataTable.destroy === "function")
        dataTable.destroy();
    } catch (e) {}
    dataTable = null;
    initialized = false;
  });

  // Reactivo: reinicializar cuando cambia la cantidad de citas
  $: (async () => {
    if (!tableElement) return;
    if (!initialized) return;
    if (appointments.length === lastInitCount) return;

    try {
      if (dataTable && typeof dataTable.destroy === "function")
        dataTable.destroy();
    } catch (e) {}
    dataTable = null;
    initialized = false;
    await tick();
    await initDataTable();
  })();
</script>

<div class="card p-3 shadow-sm">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="fw-bold mb-0">Mis Citas Programadas</h5>
    <button class="btn btn-outline-primary btn-sm" on:click={loadAppointments}>
      <i class="bi bi-arrow-clockwise"></i> Actualizar
    </button>
  </div>

  {#if loading}
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  {:else}
    <div class="table-responsive">
      <table bind:this={tableElement} class="table table-striped align-middle">
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
          {#each appointments as appt}
            <tr>
              <td>{appt.id_appointment}</td>
              <td>{appt.patient_name || `Usuario #${appt.id_user}`}</td>
              <td
                >{new Date(appt.appointment_date).toLocaleString("es-PE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}</td
              >
              <td>
                {#if appt.id_state === 1}
                  <span class="badge bg-secondary">Pendiente</span>
                {:else if appt.id_state === 2}
                  <span class="badge bg-primary">Confirmada</span>
                {:else if appt.id_state === 3}
                  <span class="badge bg-danger">Cancelada</span>
                {:else if appt.id_state === 4}
                  <span class="badge bg-success">Completada</span>
                {:else if appt.id_state === 5}
                  <span class="badge bg-warning">No Asistió</span>
                {:else}
                  <span class="badge bg-info">Desconocido</span>
                {/if}
              </td>
              <td>
                <select
                  class="form-select form-select-sm"
                  bind:value={appt.id_state}
                  on:change={() => handleStateChange(appt)}
                >
                  <option value={1}>Pendiente</option>
                  <option value={2}>Confirmada</option>
                  <option value={3}>Cancelada</option>
                  <option value={4}>Completada</option>
                  <option value={5}>No Asistió</option>
                </select>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="text-center text-muted">
                No hay citas programadas
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  :global(.dataTables_wrapper .dataTables_length select),
  :global(.dataTables_wrapper .dataTables_filter input) {
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    padding: 0.375rem 0.75rem;
  }
</style>
