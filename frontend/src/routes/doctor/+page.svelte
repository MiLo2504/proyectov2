<script>
  import { onMount, onDestroy, tick } from "svelte";
  import {
    listAppointments,
    updateAppointment,
  } from "$lib/services/appointmentService.js";
  import { listAnalysis } from "$lib/services/analysisService.js";
  import { updateAnalysisObservation } from "$lib/services/analysisService.js";
  import { fetchUsers } from "$lib/services/userService.js";
  import { listStateAppointments } from "$lib/services/stateAppointmentService.js";
  import { listStateAnalysis } from "$lib/services/stateAnalysisService.js";

  let loading = true;
  let error = "";
  let appointments = [];
  let analyses = [];
  let activeTab = "analisis";

  // Modal de revisión
  let selectedAnalysis = null;
  let obsDraft = "";
  let reviewModalEl;
  let reviewModal; // instancia Bootstrap.Modal

  // DataTables refs
  let apptTableEl;
  let anTableEl;
  let apptDT = null;
  let anDT = null;
  let apptInitialized = false;
  let anInitialized = false;
  let lastAnCount = 0;
  // Usar todos los análisis (el filtro de "Solo con IA" fue removido)
  let users = [];
  let apptStates = [];
  let analysisStates = [];
  $: apptStateMap = Object.fromEntries(
    (apptStates || []).map((s) => [s.id_state, s.state_name])
  );
  $: analysisStateMap = Object.fromEntries(
    (analysisStates || []).map((s) => [s.id_state_analysis, s.state_name])
  );
  $: userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));
  $: latestAnalysesByUser = (() => {
    // tomar el último análisis por usuario (por created_at desc, luego id desc)
    const arr = [...(analyses || [])].sort((a, b) => {
      const da = a?.created_at
        ? new Date(a.created_at).getTime()
        : a?.date
          ? new Date(a.date).getTime()
          : 0;
      const db = b?.created_at
        ? new Date(b.created_at).getTime()
        : b?.date
          ? new Date(b.date).getTime()
          : 0;
      if (db !== da) return db - da;
      return (b?.id || 0) - (a?.id || 0);
    });
    const map = new Map();
    for (const a of arr) {
      const uid = a?.id_user;
      if (uid == null) continue;
      if (!map.has(uid)) map.set(uid, a);
    }
    return [...map.values()];
  })();

  $: totalAppointments = appointments?.length || 0;
  $: totalAnalyses = analyses?.length || 0;

  function loadCssOnce(href) {
    if (typeof document === "undefined") return;
    if ([...document.styleSheets].some((s) => s?.href && s.href.includes(href)))
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-injected-by", "doctorPage");
    document.head.appendChild(link);
  }

  function loadScriptOnce(src) {
    if (typeof document === "undefined") return Promise.resolve();
    if ([...document.scripts].some((s) => s?.src && s.src.includes(src)))
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-injected-by", "doctorPage");
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
    await loadScriptOnce(
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js"
    );
    await loadScriptOnce("https://cdn.datatables.net/2.3.4/js/dataTables.js");
    await loadScriptOnce(
      "https://cdn.datatables.net/2.3.4/js/dataTables.bootstrap5.js"
    );
  }

  async function initApptDT() {
    try {
      await ensureDataTablesLoaded();
      const DataTableCtor = window?.DataTable || globalThis?.DataTable;
      if (DataTableCtor && apptTableEl) {
        try {
          if (apptDT && typeof apptDT.destroy === "function") apptDT.destroy();
        } catch (e) {}
        apptDT = new DataTableCtor(apptTableEl, {
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
        apptInitialized = true;
      }
    } catch (e) {
      console.error("DT citas:", e);
    }
  }

  async function initAnDT() {
    try {
      await ensureDataTablesLoaded();
      const DataTableCtor = window?.DataTable || globalThis?.DataTable;
      if (DataTableCtor && anTableEl) {
        try {
          if (anDT && typeof anDT.destroy === "function") anDT.destroy();
        } catch (e) {}
        anDT = new DataTableCtor(anTableEl, {
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
        anInitialized = true;
        lastAnCount = latestAnalysesByUser.length;
      }
    } catch (e) {
      console.error("DT análisis:", e);
    }
  }

  onMount(async () => {
    loading = true;
    error = "";
    try {
      const [apps, anas, allUsers, states, aStates] = await Promise.all([
        listAppointments().catch((e) => {
          console.error("Error cargando citas:", e);
          return [];
        }),
        listAnalysis().catch((e) => {
          console.error("Error cargando análisis:", e);
          return [];
        }),
        fetchUsers().catch((e) => {
          console.error("Error cargando usuarios:", e);
          return [];
        }),
        listStateAppointments().catch((e) => {
          console.error("Error cargando estados de cita:", e);
          return [];
        }),
        listStateAnalysis().catch((e) => {
          console.error("Error cargando estados de análisis:", e);
          return [];
        }),
      ]);
      appointments = apps || [];
      analyses = anas || [];
      users = allUsers || [];
      apptStates = states || [];
      analysisStates = aStates || [];
      await tick();
      // inicializar DT de la pestaña activa
      if (activeTab === "citas") await initApptDT();
      else await initAnDT();
    } catch (e) {
      error = e?.message || "Error cargando datos";
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    try {
      if (apptDT && typeof apptDT.destroy === "function") apptDT.destroy();
    } catch (e) {}
    try {
      if (anDT && typeof anDT.destroy === "function") anDT.destroy();
    } catch (e) {}
    apptDT = null;
    anDT = null;
    apptInitialized = false;
    anInitialized = false;
  });

  // Refrescar análisis cuando la ventana recupere visibilidad
  if (typeof document !== "undefined") {
    const onVisible = async () => {
      if (document.visibilityState === "visible" && activeTab === "analisis") {
        try {
          const fresh = await listAnalysis().catch(() => []);
          analyses = fresh || [];
          try {
            if (anDT && typeof anDT.destroy === "function") anDT.destroy();
          } catch {}
          anDT = null;
          anInitialized = false;
          await tick();
          await initAnDT();
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    onDestroy(() =>
      document.removeEventListener("visibilitychange", onVisible)
    );
  }

  async function switchTab(tab) {
    activeTab = tab;
    await tick();
    if (tab === "citas") {
      if (!apptInitialized) await initApptDT();
    } else {
      if (!anInitialized) await initAnDT();
      // Re-sincronizar análisis al volver a la pestaña
      try {
        const fresh = await listAnalysis().catch(() => []);
        analyses = fresh || [];
        try {
          if (anDT && typeof anDT.destroy === "function") anDT.destroy();
        } catch {}
        anDT = null;
        anInitialized = false;
        await tick();
        await initAnDT();
      } catch {}
    }
  }

  function formatDate(dt) {
    try {
      return dt ? new Date(dt).toLocaleString() : "-";
    } catch {
      return "-";
    }
  }
  function computeAge(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age;
    } catch {
      return "—";
    }
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
        // DataTables no detecta cambios del framework: destruir y re-inicializar
        try {
          if (apptDT && typeof apptDT.destroy === "function") apptDT.destroy();
        } catch {}
        apptDT = null;
        apptInitialized = false;
        await tick();
        await initApptDT();
      }
    } catch (e) {
      console.error("No se pudo cambiar estado de cita:", e);
      alert(e?.message || "Error cambiando estado");
    }
  }

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

  async function openReview(a) {
    selectedAnalysis = a;
    obsDraft = a?.observation_doctor || "";
    // asegurar bootstrap cargado (lo carga ensureDataTablesLoaded, pero por si acaso)
    try {
      await ensureDataTablesLoaded();
      const ModalCtor =
        window?.bootstrap?.Modal || globalThis?.bootstrap?.Modal;
      if (!ModalCtor) return;
      if (!reviewModal) {
        reviewModal = new ModalCtor(reviewModalEl, { backdrop: "static" });
      }
      reviewModal.show();
    } catch (e) {
      console.error("No se pudo abrir modal:", e);
    }
  }

  function closeReview() {
    try {
      reviewModal?.hide();
    } catch {}
    selectedAnalysis = null;
    obsDraft = "";
  }

  async function saveObservation() {
    if (!selectedAnalysis) return;
    const id = selectedAnalysis.id;
    try {
      const updated = await updateAnalysisObservation(id, obsDraft);
      if (updated) {
        analyses = (analyses || []).map((x) => (x?.id === id ? updated : x));
      }
      closeReview();
    } catch (e) {
      console.error("Error guardando observación:", e);
      alert(e?.message || "No se pudo guardar la observación");
    }
  }

  // Re-init DataTable de análisis cuando cambie el número de filas visibles
  $: (async () => {
    if (!anInitialized) return;
    if (!anTableEl) return;
    const current = latestAnalysesByUser.length;
    if (current === lastAnCount) return;
    try {
      if (anDT && typeof anDT.destroy === "function") anDT.destroy();
    } catch {}
    anDT = null;
    anInitialized = false;
    await tick();
    await initAnDT();
  })();
</script>

<div class="container py-2">
  <h1 class="mb-3">Panel del Doctor</h1>

  {#if loading}
    <div class="alert alert-info">Cargando datos...</div>
  {:else if error}
    <div class="alert alert-danger" role="alert">{error}</div>
  {:else}
    <ul class="nav nav-tabs mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link {activeTab === 'analisis' ? 'active' : ''}"
          type="button"
          role="tab"
          aria-selected={activeTab === "analisis"}
          on:click={() => switchTab("analisis")}
        >
          Análisis <span class="badge rounded-pill text-bg-secondary ms-2"
            >{totalAnalyses}</span
          >
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link {activeTab === 'citas' ? 'active' : ''}"
          type="button"
          role="tab"
          aria-selected={activeTab === "citas"}
          on:click={() => switchTab("citas")}
        >
          Citas <span class="badge rounded-pill text-bg-secondary ms-2"
            >{totalAppointments}</span
          >
        </button>
      </li>
    </ul>

    <div class="tab-content">
      <div
        class="tab-pane fade {activeTab === 'citas' ? 'show active' : ''}"
        role="tabpanel"
      >
        <div class="table-responsive">
          <table
            class="table table-striped align-middle"
            bind:this={apptTableEl}
          >
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
                        class="badge {apptStateBadgeClass(
                          apptStateMap[c?.id_state]
                        )}"
                        >{apptStateMap[c?.id_state] || c?.id_state || "-"}</span
                      >
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
      </div>

      <div
        class="tab-pane fade {activeTab === 'analisis' ? 'show active' : ''}"
        role="tabpanel"
      >
        <div class="table-responsive">
          <table class="table table-striped align-middle" bind:this={anTableEl}>
            <thead class="table-light">
              <tr>
                <th>NOMBRE</th>
                <th>EDAD</th>
                <th>GÉNERO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {#each latestAnalysesByUser as a}
                {#key a?.id}
                  {@const u = userMap[a?.id_user]}
                  <tr>
                    <td>{u?.full_name || u?.name || "-"}</td>
                    <td>{computeAge(u?.date_birth)}</td>
                    <td>{u?.genero || "-"}</td>
                    <td>
                      {#key a?.id_state}
                        <span
                          class="badge {apptStateBadgeClass(
                            analysisStateMap[a?.id_state]
                          )}"
                        >
                          {analysisStateMap[a?.id_state] || "-"}
                        </span>
                      {/key}
                    </td>
                    <td>
                      <a class="link-primary" href={`/doctor/analisis/${a?.id}`}
                        >Ver Análisis</a
                      >
                    </td>
                  </tr>
                {/key}
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Re-init DataTable cuando cambia el número de filas -->
<!-- reinit control moved to reactive script block -->

<style>
  :global(.dataTables_wrapper .dataTables_length select),
  :global(.dataTables_wrapper .dataTables_filter input) {
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    padding: 0.375rem 0.75rem;
  }
</style>
