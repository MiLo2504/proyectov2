<script>
  import { onMount, onDestroy } from "svelte";
  import AnalysesTable from "$lib/components/AnalysesTable.svelte";
  import AppointmentsTable from "$lib/components/AppointmentsTable.svelte";

  let loading = false;
  let error = "";
  let activeTab = "dashboard";
  let apptComp;
  let anComp;

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
          class="nav-link {activeTab === 'dashboard' ? 'active' : ''}"
          type="button"
          role="tab"
          aria-selected={activeTab === "dashboard"}
          on:click={() => switchTab("dashboard")}
        >
          Dashboard
        </button>
      </li>
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
        class="tab-pane fade {activeTab === 'dashboard' ? 'show active' : ''}"
        role="tabpanel"
      >
        {#if activeTab === "dashboard"}
          <div class="card p-3 shadow-sm">
            <h5 class="fw-bold mb-3">Dashboard de Análisis</h5>
            <div class="ratio ratio-16x9">
              <iframe
                title="dashboard"
                src="https://app.powerbi.com/view?r=eyJrIjoiNjQ5ZTlhYWUtNjI3MS00YWZkLWE0ZjMtZmQ4ZjBjYTU5YWQ0IiwidCI6IjFlOWFhYmU4LTY3ZjgtNGYxYy1hMzI5LWE3NTRlOTI0OTlhZSIsImMiOjR9"
                frameborder="0"
                allowFullScreen={true}
              ></iframe>
            </div>
          </div>
        {/if}
      </div>
      <div
        class="tab-pane fade {activeTab === 'analisis' ? 'show active' : ''}"
        role="tabpanel"
      >
        {#if activeTab === "analisis"}
          <AnalysesTable bind:this={anComp} />
        {/if}
      </div>
      <div
        class="tab-pane fade {activeTab === 'citas' ? 'show active' : ''}"
        role="tabpanel"
      >
        {#if activeTab === "citas"}
          <AppointmentsTable bind:this={apptComp} />
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
