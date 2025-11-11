<script lang="ts">
  export let analysis = null;
  export let onBack;

  function handleBack() {
    if (onBack) onBack();
  }
</script>

<div class="container my-5">
  <button class="btn btn-outline-primary mb-3" on:click={handleBack}
    >← Regresar</button
  >

  <div class="card shadow-sm border-0">
    <div class="card-body">
      <h3 class="fw-bold">{analysis?.titulo}</h3>
      <p class="text-muted mb-3">Fecha del análisis: {analysis?.fecha}</p>

      <div class="row g-4">
        <div class="col-lg-6">
          <img
            src={analysis?.imagen}
            alt={analysis?.titulo}
            class="img-fluid rounded shadow-sm"
          />
        </div>

        <div class="col-lg-6">
          <div class="mb-3 p-3 bg-light rounded">
            <h6 class="fw-bold text-primary">
              <i class="bi bi-robot me-2"></i>Resultados de la IA
            </h6>
            <p>{analysis?.resultado_ia}</p>
          </div>

          <div class="p-3 bg-light rounded">
            <h6 class="fw-bold text-primary">
              <i class="bi bi-chat-left-text me-2"></i>Comentarios del Doctor
            </h6>
            <p>{analysis?.comentario_doctor}</p>
            <small class="text-muted">- {analysis?.doctor}</small>
          </div>

          <div class="text-end mt-3">
            <button class="btn btn-primary"
              ><i class="bi bi-download me-1"></i> Descargar</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
