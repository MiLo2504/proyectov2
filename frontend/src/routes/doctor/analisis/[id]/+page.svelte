<!-- SSR desactivado: movido a +page.js -->

<script>
  import { onMount } from "svelte";
  import {
    fetchAnalysisById,
    updateAnalysisObservation,
  } from "$lib/services/analysisService.js";
  import { fetchUserById } from "$lib/services/userService.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  export let data; // puede venir vacío en primera render; usamos $page como fuente de verdad
  $: id = Number(
    $page?.params?.id ??
      data?.id ??
      (typeof window !== "undefined"
        ? window.location.pathname.split("/").filter(Boolean).pop()
        : undefined)
  );

  let loading = true;
  let error = "";
  let analysis = null;
  let patient = null;
  let obsDraft = "";
  let iaRows = [];
  let iaRaw = "";

  function tryParseIA(val) {
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }

  function computeAge(iso) {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age;
    } catch {
      return null;
    }
  }

  onMount(async () => {
    loading = true;
    error = "";
    try {
      if (!Number.isFinite(id)) {
        throw new Error("ID inválido en la URL");
      }
      const a = await fetchAnalysisById(id);
      analysis = a;
      obsDraft = a?.observation_doctor || "";
      iaRaw = a?.result_ia || "";

      const parsed = tryParseIA(a?.result_ia);
      if (Array.isArray(parsed)) {
        // esperamos objetos con { metric|métrica, value|resultado, normal|rango, interpretation|interpretación }
        iaRows = parsed.map((r) => ({
          metric:
            r.metric || r.metrica || r.Métrica || r.Metrica || r.label || "-",
          value: r.value || r.resultado || r.Value || r.Valor || "-",
          normal: r.normal || r.rango || r.Normal || r["Rango Normal"] || "-",
          interpretation:
            r.interpretation || r.interpretacion || r["Interpretación"] || "-",
        }));
      } else if (parsed && typeof parsed === "object") {
        // objeto con pares clave-valor
        iaRows = Object.entries(parsed).map(([k, v]) => ({
          metric: k,
          value: String(v ?? "-"),
          normal: "-",
          interpretation: "-",
        }));
      } else {
        iaRows = [];
      }

      if (a?.id_user != null) {
        patient = await fetchUserById(a.id_user);
      }
    } catch (e) {
      console.error(e);
      error = e?.message || "No se pudo cargar el análisis";
    } finally {
      loading = false;
    }
  });

  async function saveObservation() {
    try {
      const updated = await updateAnalysisObservation(id, obsDraft);
      if (updated) analysis = updated;
      alert("Observación guardada");
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo guardar");
    }
  }
</script>

<div class="container py-3">
  <a href="/doctor" class="btn btn-link mb-2">← Volver</a>

  {#if loading}
    <div class="alert alert-info">Cargando...</div>
  {:else if error}
    <div class="alert alert-danger">{error}</div>
  {:else if !analysis}
    <div class="alert alert-warning">Análisis no encontrado</div>
  {:else}
    <h2 class="mb-3">Detalles del Paciente</h2>

    <div class="row g-3">
      <div class="col-lg-8">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Análisis Generado por IA</h5>

            {#if analysis.url_image}
              <img
                src={analysis.url_image}
                alt="Imagen médica"
                class="img-fluid rounded border mb-3"
              />
            {/if}

            {#if iaRows.length > 0}
              <div class="table-responsive">
                <table class="table table-sm table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Métrica</th>
                      <th>Resultado</th>
                      <th>Rango Normal</th>
                      <th>Interpretación IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each iaRows as r}
                      <tr>
                        <td>{r.metric}</td>
                        <td>{r.value}</td>
                        <td>{r.normal}</td>
                        <td>{r.interpretation}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="border rounded p-2 bg-light">
                <div class="small text-muted mb-1">Resultado IA (texto)</div>
                <pre class="mb-0" style="white-space: pre-wrap;">{iaRaw ||
                    "—"}</pre>
              </div>
            {/if}

            <button
              class="btn btn-primary mt-3"
              type="button"
              on:click={() => document.getElementById("obsDoctor")?.focus()}
            >
              Validar Resultados de IA
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Observaciones del Doctor</h5>
            <textarea
              id="obsDoctor"
              class="form-control mb-3"
              rows="6"
              bind:value={obsDraft}
              placeholder="Añada sus observaciones aquí..."
            ></textarea>
            <button class="btn btn-success" on:click={saveObservation}
              >Guardar Observaciones</button
            >
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex flex-column align-items-center text-center">
              <div
                class="rounded-circle bg-warning d-flex align-items-center justify-content-center mb-2"
                style="width:80px;height:80px;"
              >
                <span class="fw-bold"
                  >{(patient?.full_name || patient?.name || "U")?.charAt(0) ||
                    "U"}</span
                >
              </div>
              <h5 class="mb-1">
                {patient?.full_name || patient?.name || "Paciente"}
              </h5>
              <div class="text-muted">ID Paciente: U-{analysis.id_user}</div>
            </div>

            <hr />
            <dl class="row mb-0 small">
              <dt class="col-5">Edad:</dt>
              <dd class="col-7">
                {computeAge(patient?.date_birth) ?? "—"} años
              </dd>
              <dt class="col-5">Género:</dt>
              <dd class="col-7">{patient?.genero || "—"}</dd>
              <dt class="col-5">Contacto:</dt>
              <dd class="col-7">{patient?.email || "—"}</dd>
              <dt class="col-5">Última Visita:</dt>
              <dd class="col-7">
                {analysis?.updated_at
                  ? new Date(analysis.updated_at).toLocaleDateString()
                  : analysis?.created_at
                    ? new Date(analysis.created_at).toLocaleDateString()
                    : "—"}
              </dd>
            </dl>

            <hr />
            <div class="d-grid gap-2">
              <a class="btn btn-outline-secondary btn-sm" href="/doctor"
                >← Volver a la lista de pacientes</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
