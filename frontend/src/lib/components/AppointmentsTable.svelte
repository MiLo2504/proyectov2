<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import EditAppointmentModal from "$lib/components/EditAppointmentsModal.svelte";
  export let appointments: any[] = [];
  export let onRefresh: () => void;
  export let onEdit: (appt: any) => void;

  let tableElement: HTMLTableElement;
  let dataTable: any = null;
  let dataTableAvailable = false;
  // Modal de edición (visual)
  let showEditModal = false;
  let editingAppt: any = null;

  function openEditModal(appt: any) {
    editingAppt = appt;
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingAppt = null;
  }

  function handleSave(event: CustomEvent) {
    const updated = event.detail?.appointment ?? null;
    if (!updated) return;
    if (typeof onEdit === "function") onEdit(updated);
    if (typeof onRefresh === "function") onRefresh();
    closeEditModal();
  }

  // Cargar DataTables (versión moderna sin jQuery)
  async function loadDataTables() {
    if (typeof window === "undefined") return;

    // Cargar CSS
    if (!document.querySelector('link[href*="dataTables.bootstrap5"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.datatables.net/2.1.8/css/dataTables.bootstrap5.min.css";
      document.head.appendChild(link);
    }

    // Cargar DataTables UMD (sin jQuery)
    if (!(window as any).DataTable) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.datatables.net/2.1.8/js/dataTables.min.js";
        script.onload = () => resolve(null);
        script.onerror = () => reject(new Error("Failed to load DataTables"));
        document.head.appendChild(script);
      });
    }

    // Cargar integración Bootstrap 5
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.datatables.net/2.1.8/js/dataTables.bootstrap5.min.js";
      script.onload = () => resolve(null);
      script.onerror = () =>
        reject(new Error("Failed to load Bootstrap5 plugin"));
      document.head.appendChild(script);
    });

    // Indicar si DataTable está disponible
    dataTableAvailable =
      typeof window !== "undefined" && !!(window as any).DataTable;
  }

  onMount(async () => {
    try {
      await loadDataTables();

      // Esperar a que el DOM esté listo
      await new Promise(requestAnimationFrame);

      if (!tableElement) return;
      // Si DataTables está disponible, inicializamos; si no, usaremos render nativo
      if (dataTableAvailable) {
        dataTable = new (window as any).DataTable(tableElement, {
          data: appointments,
          responsive: true,
          language: {
            url: "https://cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json",
          },
          columns: [
            { data: "patient", title: "Paciente" },
            { data: "doctor", title: "Doctor" },
            {
              data: "dateTime",
              title: "Fecha y Hora",
              render: (data) => new Date(data).toLocaleString("es-PE"),
            },
            { data: "reason", title: "Motivo" },
            {
              data: null,
              title: "Estado",
              render: (data) =>
                `<span class="badge bg-${data.state === 1 ? "success" : "danger"}">
                ${data.state === 1 ? "Activa" : "Cancelada"}
              </span>`,
            },
            {
              data: null,
              title: "Acciones",
              orderable: false,
              render: (data) => `
              <button class="btn btn-sm btn-primary edit-btn" data-id="${data.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${data.id}">
                <i class="bi bi-trash"></i>
              </button>
            `,
            },
          ],
        });
      } else {
        // Fallback: renderizar tabla sin DataTables
        renderPlainTable();
      }

      // Eventos delegados
      tableElement.addEventListener("click", (e) => {
        // `closest` devuelve un Element; en TS Element no garantiza `dataset`.
        // Usamos getAttribute('data-id') (disponible en Element) para evitar errores
        // de tipado y runtime cuando el target no es un HTMLElement.
        const clicked = e.target as HTMLElement;
        const targetEl = clicked.closest(".edit-btn, .delete-btn");
        if (!targetEl) return;

        const idAttr = targetEl.getAttribute("data-id") || "";
        const id = parseInt(idAttr, 10);
        if (isNaN(id)) return;

        const appt = appointments.find((a) => a.id === id);
        if (!appt) return;

        const classList = (targetEl as Element).classList;
        if (classList.contains("edit-btn")) {
          // abrir modal de edición visual
          openEditModal(appt);
        } else if (classList.contains("delete-btn")) {
          if (confirm("¿Cancelar esta cita?")) {
            cancelAppointment(id);
          }
        }
      });
    } catch (err) {
      console.error("Error inicializando DataTable:", err);
    }
  });

  function renderPlainTable() {
    if (!tableElement) return;
    let tbody = tableElement.tBodies[0];
    if (!tbody) {
      tbody = document.createElement("tbody");
      tableElement.appendChild(tbody);
    }

    if (!appointments || appointments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay citas</td></tr>`;
      return;
    }

    tbody.innerHTML = appointments
      .map((a) => {
        const date = a.dateTime
          ? new Date(a.dateTime).toLocaleString("es-PE")
          : "";
        const estado =
          a.state === 1
            ? `<span class="badge bg-success">Activa</span>`
            : `<span class="badge bg-danger">Cancelada</span>`;
        return `
          <tr>
            <td>${escapeHtml(String(a.patient || ""))}</td>
            <td>${escapeHtml(String(a.doctor || ""))}</td>
            <td>${escapeHtml(date)}</td>
            <td>${escapeHtml(String(a.reason || ""))}</td>
            <td>${estado}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-btn" data-id="${a.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${a.id}">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>`;
      })
      .join("");
  }

  // pequeña función para escapar texto antes de inyectarlo en innerHTML
  function escapeHtml(str: string) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async function cancelAppointment(id: number) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: 0 }),
      });
      if (res.status === 404) {
        alert("Endpoint para cancelar citas no implementado (404).");
        return;
      }
      if (!res.ok) throw new Error();
      alert("Cita cancelada");
      onRefresh();
    } catch {
      alert("Error al cancelar");
    }
  }

  // Reactividad: actualizar datos
  $: if (dataTable && appointments) {
    // Si DataTables está activo, intentamos usar su API; si no, render nativo
    try {
      if (typeof dataTable.clear === "function") {
        dataTable.clear();
        if (dataTable.rows && typeof dataTable.rows.add === "function") {
          dataTable.rows.add(appointments);
        } else if (typeof dataTable.data === "function") {
          // posible API alternativa
          dataTable.data(appointments);
        }
        if (typeof dataTable.draw === "function") dataTable.draw();
      } else if (typeof dataTable.data === "function") {
        dataTable.data(appointments);
      } else {
        // API desconocida -> destruir y reinit para garantizar consistencia
        try {
          dataTable.destroy();
        } catch (e) {}
        dataTable = new (window as any).DataTable(tableElement, {
          data: appointments,
        });
      }
    } catch (e) {
      console.warn("Error actualizando DataTable, se usará render nativo", e);
      renderPlainTable();
    }
  } else if (!dataTable) {
    // Si no hay instancia de DataTable, renderizamos la tabla nativamente
    renderPlainTable();
  }

  onDestroy(() => {
    if (dataTable && typeof dataTable.destroy === "function")
      dataTable.destroy();
  });
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0">Citas Programadas</h5>
      <button class="btn btn-outline-primary btn-sm" on:click={onRefresh}>
        Actualizar
      </button>
    </div>

    <div class="table-responsive">
      <table
        bind:this={tableElement}
        class="table table-hover"
        style="width:100%"
      >
        <thead class="table-light">
          <tr>
            <th>Paciente</th>
            <th>Doctor</th>
            <th>Fecha y Hora</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    <!-- Modal de edición visual -->
    <EditAppointmentModal
      open={showEditModal}
      appointment={editingAppt}
      on:close={closeEditModal}
      on:save={handleSave}
    />
  </div>
</div>
