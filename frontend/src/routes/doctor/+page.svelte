<script>
  import { onMount, onDestroy } from "svelte";
  import AnalysesTable from "$lib/components/AnalysesTable.svelte";
  import AppointmentsTable from "$lib/components/AppointmentsTable.svelte";

  let loading = false;
  let error = "";
  let activeTab = "analisis";
  let apptComp;
  let anComp;

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

  let dtLoadingPromise = null;
  async function ensureDataTablesLoaded() {
    // Evitar cargas duplicadas concurrentes
    if (dtLoadingPromise) return dtLoadingPromise;
    dtLoadingPromise = (async () => {
      // CSS base + tema bootstrap (faltaba el core css para estilos completos)
      loadCssOnce(
        "https://cdn.datatables.net/2.3.4/css/dataTables.dataTables.css"
      );
      loadCssOnce(
        "https://cdn.datatables.net/2.3.4/css/dataTables.bootstrap5.css"
      );
      // Scripts: bootstrap primero (para estilos y modal), luego núcleo DataTables y adaptación bootstrap
      await loadScriptOnce(
        "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js"
      );
      await loadScriptOnce("https://cdn.datatables.net/2.3.4/js/dataTables.js");
      await loadScriptOnce(
        "https://cdn.datatables.net/2.3.4/js/dataTables.bootstrap5.js"
      );
      // Polling hasta que exista window.DataTable (seguridad por asincronía)
      const start = Date.now();
      while (typeof window !== "undefined" && !window.DataTable) {
        if (Date.now() - start > 4000) {
          console.error("Timeout esperando DataTables");
          break;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    })();
    return dtLoadingPromise;
  }

  onMount(() => {
    // Pre-cargar DataTables antes de que los componentes lo pidan para reducir condiciones de carrera
    ensureDataTablesLoaded().catch((e) =>
      console.error("Error pre-cargando DataTables", e)
    );
  });

  onDestroy(() => {
    // sin referencias globales a DataTables aquí
  });

  // Refrescar análisis cuando la ventana recupere visibilidad
  if (typeof document !== "undefined") {
    const onVisible = async () => {
      if (document.visibilityState === "visible" && activeTab === "analisis") {
        try {
          await anComp?.refresh?.();
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
    // refrescar el componente activo si aplica
    if (tab === "analisis") {
      try {
        await anComp?.refresh?.();
      } catch {}
    } else if (tab === "citas") {
      try {
        await apptComp?.refresh?.();
      } catch {}
    }
  }
</script>

<div class="container py-2">
  <h1 class="mb-3">Panel del Doctor</h1>

  {#if error}
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
          Análisis
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
          Citas
        </button>
      </li>
    </ul>

    <div class="tab-content">
      <div
        class="tab-pane fade {activeTab === 'citas' ? 'show active' : ''}"
        role="tabpanel"
      >
        {#if activeTab === "citas"}
          <AppointmentsTable bind:this={apptComp} {ensureDataTablesLoaded} />
        {/if}
      </div>
      <div
        class="tab-pane fade {activeTab === 'analisis' ? 'show active' : ''}"
        role="tabpanel"
      >
        {#if activeTab === "analisis"}
          <AnalysesTable bind:this={anComp} {ensureDataTablesLoaded} />
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Re-init DataTable cuando cambia el número de filas -->
<!-- reinit control moved to reactive script block -->

<style>
  /* estilos globales para DataTables ya están en componentes */
</style>
