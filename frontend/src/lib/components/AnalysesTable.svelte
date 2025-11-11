<script>
  import { onMount, onDestroy, tick, createEventDispatcher } from "svelte";
  import { listAnalysis } from "$lib/services/analysisService.js";
  import { fetchUsers } from "$lib/services/userService.js";
  import { listStateAnalysis } from "$lib/services/stateAnalysisService.js";

  const dispatch = createEventDispatcher();

  let loading = true;
  let error = "";
  let analyses = [];
  let users = [];
  let analysisStates = [];

  let tableEl;
  let dt = null;
  let initialized = false;
  let lastCount = 0;
  let initRetries = 0;

  $: userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));
  $: analysisStateMap = Object.fromEntries(
    (analysisStates || []).map((s) => [s.id_state_analysis, s.state_name])
  );

  // Mostrar sólo el último análisis por usuario (según created_at desc, luego id desc)
  $: latestAnalysesByUser = (() => {
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

  function badgeClass(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("pendiente") || n.includes("pending")) return "bg-secondary";
    if (n.includes("confirm") || n.includes("rev") || n.includes("review"))
      return "bg-primary";
    if (n.includes("comp") || n.includes("fin")) return "bg-success";
    if (n.includes("cancel")) return "bg-danger";
    return "bg-secondary";
  }

  function loadCssOnce(href) {
    if (typeof document === "undefined") return;
    if ([...document.styleSheets].some((s) => s?.href && s.href.includes(href)))
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-injected-by", "analysesTable");
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
      script.setAttribute("data-injected-by", "analysesTable");
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

  async function initDT() {
    try {
      await ensureDataTablesLoaded();
      const DataTableCtor = window?.DataTable || globalThis?.DataTable;
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
        lastCount = latestAnalysesByUser.length;
        initRetries = 0;
      }
    } catch (e) {
      console.error("DT análisis:", e);
    }
  }

  async function loadData() {
    loading = true;
    error = "";
    try {
      const [anas, allUsers, states] = await Promise.all([
        listAnalysis().catch(() => []),
        fetchUsers().catch(() => []),
        listStateAnalysis().catch(() => []),
      ]);
      analyses = anas || [];
      users = allUsers || [];
      analysisStates = states || [];
    } catch (e) {
      error = e?.message || "Error cargando análisis";
    } finally {
      loading = false;
      await tick();
      if (!error) {
        await initDT();
        dispatch("loaded", { total: analyses.length });
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

  export async function refresh() {
    try {
      if (dt && typeof dt.destroy === "function") dt.destroy();
    } catch {}
    dt = null;
    initialized = false;
    initRetries = 0;
    await loadData();
  }

  // Re-init DataTable cuando cambie el número de filas visibles
  $: (async () => {
    if (!initialized) return;
    if (!tableEl) return;
    const current = latestAnalysesByUser.length;
    if (current === lastCount) return;
    try {
      if (dt && typeof dt.destroy === "function") dt.destroy();
    } catch {}
    dt = null;
    initialized = false;
    await tick();
    await initDT();
  })();
</script>

{#if loading}
  <div class="alert alert-info">Cargando análisis...</div>
{:else if error}
  <div class="alert alert-danger">{error}</div>
{:else}
  <div class="table-responsive">
    <table class="table table-striped align-middle" bind:this={tableEl}>
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
                    class="badge {badgeClass(analysisStateMap[a?.id_state])}"
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
