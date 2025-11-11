<!-- AnalysisUpload.svelte -->
<script>
  export let onAnalyze;
  let file = null;
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h5>Subir Imagen Médica</h5>
    <input
      type="file"
      accept="image/*"
      bind:files={file}
      class="form-control mb-3"
    />
    <button
      class="btn btn-success w-100"
      on:click={() => onAnalyze(file[0])}
      disabled={!file}
    >
      Analizar con IA
    </button>
  </div>
</div>
