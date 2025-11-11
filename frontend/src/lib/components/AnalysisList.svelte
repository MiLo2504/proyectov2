<script lang="ts">
  export let analyses = [];
  export let loading = false;
  export let onViewDetail;

  $: hasAnalyses = analyses.length > 0;
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="mb-3 fw-bold">Resultados de Análisis</h4>

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
              on:click={() => onViewDetail(item.id)}
              aria-label="Ver detalle del análisis"
              style="cursor: pointer; background: none; border: none; padding: 0;"
            >
              <img
                src={item.url_image}
                alt="imagen del análisis"
                class="card-img-top"
                style="height: 160px; object-fit: cover;"
              />
              <div class="card-body">
                <h6 class="fw-bold">
                  {item.result_ia || "Análisis en revisión"}
                </h6>
                <p class="text-muted mb-0">
                  Fecha: {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
