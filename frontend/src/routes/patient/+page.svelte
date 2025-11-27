<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth";
  import PatientInfoForm from "$lib/components/PatientInfoForm.svelte";
  import PatientInfoCard from "$lib/components/PatientInfoCard.svelte";
  import AnalysisUpload from "$lib/components/AnalysisUpload.svelte";
  import AnalysisList from "$lib/components/AnalysisList.svelte";
  import AppointmentsForm from "$lib/components/AppointmentsForm.svelte";

  import {
    fetchPatient,
    updatePatient,
    uploadAnalysis,
    fetchAnalyses,
  } from "$lib/services/patientService";

  // Estado principal de la página
  let patient: any = null;
  let loadingPatient = true;
  let analyses: any[] = [];
  let analysesLoading = false;
  let selectedAnalysis: any = null;
  let activeTab: "profile" | "analysis" | "appointments" | "actualizar" =
    "profile";
  let editMode = false; // por si usas modo edición en datos del paciente

  // =========================================
  // CARGA INICIAL
  // =========================================
  onMount(async () => {
    // 1) Tomar el usuario del store auth
    let storedUser: any = null;
    const unsubscribe = auth.subscribe((value) => {
      storedUser = value?.user || null;
    });
    unsubscribe();

    if (!storedUser || !storedUser.id) {
      console.warn("No hay usuario en auth store");
      loadingPatient = false;
      return;
    }

    try {
      // 2) Cargar datos del paciente desde el backend
      await loadPatient(storedUser.id);
      // 3) Cargar análisis de ese paciente
      await loadAnalyses(storedUser.id);
    } catch (err) {
      console.error("Error en carga inicial del paciente:", err);
    } finally {
      loadingPatient = false;
    }
  });

  async function loadPatient(patientId: number) {
    try {
      const data = await fetchPatient(patientId);
      patient = data;
    } catch (err) {
      console.error("Error al cargar paciente:", err);
      patient = null;
    }
  }

  async function loadAnalyses(patientId: number) {
    analysesLoading = true;
    try {
      analyses = await fetchAnalyses(patientId);
    } catch (err) {
      console.error("Error al cargar análisis:", err);
      analyses = [];
    } finally {
      analysesLoading = false;
    }
  }

  // =========================================
  // MANEJO DE PESTAÑAS
  // =========================================
  function setTab(tab: typeof activeTab) {
    activeTab = tab;
  }

  // =========================================
  // GUARDAR DATOS DEL PACIENTE
  // =========================================
  async function handleSavePatient(updatedData: any) {
    if (!patient?.id) {
      alert("No hay paciente cargado");
      return;
    }

    try {
      const saved = await updatePatient(patient.id, updatedData);
      patient = saved;
      editMode = false;
      alert("Datos actualizados correctamente");
    } catch (err) {
      console.error("Error al guardar paciente:", err);
      alert("Error al actualizar los datos del paciente");
    }
  }

  // =========================================
  // SUBIR IMAGEN PARA ANÁLISIS CON IA
  // =========================================
  async function handleAnalyze(file: File) {
    if (!patient?.id) {
      alert("No hay paciente cargado");
      return;
    }

    try {
      analysesLoading = true;

      // Llamamos al servicio que pega al endpoint /analysis/upload-ia
      const newAnalysis = await uploadAnalysis(patient.id, file);

      // Agregamos el nuevo análisis al principio de la lista
      analyses = [newAnalysis, ...analyses];

      // Opcional: cambiamos a la pestaña de análisis
      activeTab = "analysis";
    } catch (err) {
      console.error("Error en handleAnalyze:", err);
      alert("Error al analizar la imagen");
    } finally {
      analysesLoading = false;
    }
  }

  // =========================================
  // CITAS / APPOINTMENTS (si ya las tienes)
  // =========================================
  function handleCreateAppointment(event: CustomEvent) {
    console.log("Crear cita con datos:", event.detail);
    // aquí luego puedes llamar a tu API de citas
  }

  function handleViewDetail(analysis: any) {
    selectedAnalysis = analysis;
    activeTab = "analysis";
  }

  const API_BASE_URL = "http://127.0.0.1:8000";

  function downloadImage() {
    if (!selectedAnalysis || !selectedAnalysis.url_image) {
      alert("No hay imagen asociada a este análisis");
      return;
    }

    // Ejemplo de selectedAnalysis.url_image:
    // "uploads/images/1764229435_WhatsApp Image 2025-11-24 at 10.03.06 PM.jpeg"
    let path = selectedAnalysis.url_image;

    // Si viniera con una barra inicial "/uploads/..." se la quitamos
    if (path.startsWith("/")) {
      path = path.slice(1); // "uploads/..."
    }

    // Construimos la URL completa
    const url = `${API_BASE_URL}/${path}`;
    console.log("Descargando desde:", url);

    // Creamos un enlace <a> para forzar la descarga
    const link = document.createElement("a");
    link.href = url;

    // Nombre del archivo (lo que va después del último "/")
    const parts = path.split("/");
    link.download = parts[parts.length - 1];

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<svelte:head>
  <title>Panel del paciente</title>
</svelte:head>

{#if loadingPatient}
  <div class="container py-5">
    <p>Cargando datos del paciente...</p>
  </div>
{:else if !patient}
  <div class="container py-5">
    <p>No se encontró información del paciente.</p>
  </div>
{:else}
  <div class="container py-4">
    <h1 class="mb-4">Hola, {patient.full_name} 👋</h1>

    <!-- Navegación de pestañas -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          class={"nav-link " + (activeTab === "profile" ? "active" : "")}
          on:click={() => setTab("profile")}
        >
          Perfil
        </button>
      </li>
      <li class="nav-item">
        <button
          class={"nav-link " + (activeTab === "analysis" ? "active" : "")}
          on:click={() => setTab("analysis")}
        >
          Análisis
        </button>
      </li>
      <li class="nav-item">
        <button
          class={"nav-link " + (activeTab === "appointments" ? "active" : "")}
          on:click={() => setTab("appointments")}
        >
          Citas
        </button>
      </li>
      <li class="nav-item">
        <button
          class={"nav-link " + (activeTab === "actualizar" ? "active" : "")}
          on:click={() => setTab("actualizar")}
        >
          Actualizar datos
        </button>
      </li>
    </ul>

    <!-- CONTENIDO DE LAS PESTAÑAS -->
    <div class="tab-content">
      <!-- PERFIL -->
      <div
        class={"tab-pane fade " +
          (activeTab === "profile" ? "show active" : "")}
      >
        <PatientInfoCard {patient} />
      </div>

      <!-- ANÁLISIS -->
      <div class="tab-pane" class:active={activeTab === "analysis"}>
        <div class="row">
          <div class="col-lg-5 mb-3">
            <AnalysisUpload onAnalyze={handleAnalyze} />
          </div>
          <div class="col-lg-7 mb-3">
            <AnalysisList
              {analyses}
              loading={analysesLoading}
              onViewDetail={handleViewDetail}
            />
          </div>
        </div>
      </div>

      {#if selectedAnalysis}
        <div class="row mt-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h4 class="fw-bold mb-0">Detalle del análisis</h4>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    on:click={() => (selectedAnalysis = null)}
                  >
                    Cerrar
                  </button>
                </div>

                <p>
                  <strong>Fecha:&nbsp;</strong>
                  {#if selectedAnalysis.date}
                    {new Date(selectedAnalysis.date).toLocaleString()}
                  {:else}
                    Sin fecha
                  {/if}
                </p>

                <p>
                  <strong>Estado:&nbsp;</strong>
                  {selectedAnalysis.statusLabel}
                </p>

                <p>
                  <strong>Resultado IA:&nbsp;</strong>
                  {#if selectedAnalysis.stateId === 2}
                    {selectedAnalysis.result_ia || "Sin resultado disponible"}
                  {:else}
                    En revisión por el médico
                  {/if}
                </p>

                <p>
                  <strong>Observación del doctor:&nbsp;</strong>
                  {#if selectedAnalysis.observation_doctor}
                    {selectedAnalysis.observation_doctor}
                  {:else}
                    Aún no hay observación registrada.
                  {/if}
                </p>

                {#if selectedAnalysis.url_image}
                  <div class="mt-3">
                    <p class="fw-semibold mb-2">Imagen del análisis:</p>
                    <!-- Botón de descarga, NO mostrar la imagen -->
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      on:click={downloadImage}
                    >
                      Descargar imagen
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- CITAS -->
      <div
        class={"tab-pane fade " +
          (activeTab === "appointments" ? "show active" : "")}
      >
        <AppointmentsForm on:createAppointment={handleCreateAppointment} />
      </div>

      <!-- ACTUALIZAR DATOS -->
      <div
        class={"tab-pane fade " +
          (activeTab === "actualizar" ? "show active" : "")}
      >
        <PatientInfoForm
          {patient}
          on:save={(event) => handleSavePatient(event.detail)}
        />
      </div>
    </div>
  </div>
{/if}
