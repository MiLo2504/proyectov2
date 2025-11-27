<script lang="ts">
  export let analyses = [];
  export let loading = false;
  export let onViewDetail;

  $: hasAnalyses = analyses.length > 0;
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="mb-3 fw-bold">Mi listado de Análisis</h4>

    {#if loading}
      <p>Cargando análisis...</p>
    {:else if !hasAnalyses}
      <p class="text-muted">Aún no tienes análisis registrados.</p>
    {:else}
      <div class="row g-3">
        {#each analyses as item}
          <div class="col-md-6">
    <button
      type="button"
      class="card border-0 shadow-sm overflow-hidden h-100 hoverable w-100 text-start"
      on:click={() => onViewDetail(item)}  
      aria-label="Ver detalle del análisis"
      style="cursor: pointer; background: none; border: none; padding: 0;"
    >
      <div class="card-body">
        <!-- Título genérico, sin resultado de IA -->
        <h6 class="fw-bold mb-2">
          Análisis de imagen #{item.id_analysis}
        </h6>

        <!-- Estado -->
        <p class="mb-1">
          <strong>Estado:</strong>
          {item.statusLabel}
        </p>

        <!-- Fecha -->
        <p class="text-muted mb-0">
          <strong>Fecha:</strong>
          {#if item.date}
            {new Date(item.date).toLocaleDateString()}
          {:else}
            Sin fecha
          {/if}
        </p>
      </div>
    </button>
  </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
