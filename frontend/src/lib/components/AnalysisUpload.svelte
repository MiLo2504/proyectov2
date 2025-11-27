<script lang="ts">
  // El padre debe pasar una función onAnalyze(file: File)
  export let onAnalyze: (file: File) => void;

  let fileInput: FileList | null = null;

  function handleAnalyze() {
    if (!fileInput || fileInput.length === 0) {
      alert("Por favor selecciona una imagen primero");
      return;
    }

    const selectedFile = fileInput[0];

    if (!selectedFile.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida (JPG/PNG)");
      return;
    }

    if (onAnalyze) {
      onAnalyze(selectedFile);
    }
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="mb-3 fw-bold">Nuevo análisis</h4>
    <p class="text-muted">
      Sube una radiografía o imagen médica para que el modelo de IA la analice.
    </p>

    <input
      type="file"
      accept="image/png,image/jpeg,image/jpg"
      bind:files={fileInput}
      class="form-control mb-3"
    />

    <button
      class="btn btn-success w-100"
      on:click|preventDefault={handleAnalyze}
      disabled={!fileInput || fileInput.length === 0}
    >
      Analizar con IA
    </button>
  </div>
</div>
