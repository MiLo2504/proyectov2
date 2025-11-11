<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from "svelte";
  import { fetchDocumentTypes } from "$lib/services/patientService.js";

  export let patient = null;

  let documentTypes = [];
  let formData = {
    user_name: "",
    full_name: "",
    last_name: "",
    email: "",
    date_birth: "",
    phone: "",
    address: "",
    num_document: "",
    id_type_document: null,
    password: "",
  };

  let lastPatientId = null;

  // Esta función se ejecutará después de cada actualización del componente
  afterUpdate(() => {
    // Si el 'patient' que llega como prop es diferente al que ya hemos procesado
    if (patient && patient.id !== lastPatientId) {
      lastPatientId = patient.id; // Actualizamos el ID del último paciente procesado
      formData = { ...patient, password: "" }; // Reseteamos el form con los nuevos datos

      // Asegurarse de que la fecha tenga el formato YYYY-MM-DD para el input type="date"
      if (formData.date_birth) {
        formData.date_birth = formData.date_birth.split("T")[0];
      }
    }
  });

  onMount(async () => {
    try {
      documentTypes = await fetchDocumentTypes();
    } catch (e) {
      console.error("Error al cargar tipos de documento", e);
    }
  });

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    // Filtrar la contraseña si está vacía para no enviarla
    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }
    dispatch("save", dataToSend);
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h4 class="fw-bold mb-3">Información Personal</h4>
    <form on:submit|preventDefault={handleSubmit}>
      <div class="mb-3">
        <label class="form-label" for="user_name">Nombre de Usuario</label>
        <input
          id="user_name"
          type="text"
          class="form-control"
          bind:value={formData.user_name}
        />
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label" for="full_name">Nombre</label>
          <input
            id="full_name"
            type="text"
            class="form-control"
            bind:value={formData.full_name}
          />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="last_name">Apellido</label>
          <input
            id="last_name"
            type="text"
            class="form-control"
            bind:value={formData.last_name}
          />
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label" for="id_type_document"
            >Tipo de Documento</label
          >
          <select
            id="id_type_document"
            class="form-select"
            bind:value={formData.id_type_document}
          >
            <option value={null} disabled>Seleccione...</option>
            {#each documentTypes as doc}
              <option value={doc.id}>{doc.name}</option>
            {/each}
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label" for="num_document"
            >Número de Documento</label
          >
          <input
            id="num_document"
            type="text"
            class="form-control"
            bind:value={formData.num_document}
          />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="date_birth">Fecha de Nacimiento</label>
        <input
          id="date_birth"
          type="date"
          class="form-control"
          bind:value={formData.date_birth}
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="phone">Teléfono</label>
        <input
          id="phone"
          type="text"
          class="form-control"
          bind:value={formData.phone}
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="email">Correo Electrónico</label>
        <input
          id="email"
          type="email"
          class="form-control"
          bind:value={formData.email}
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="address">Dirección</label>
        <input
          id="address"
          type="text"
          class="form-control"
          bind:value={formData.address}
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="password"
          >Nueva Contraseña (dejar en blanco para no cambiar)</label
        >
        <input
          id="password"
          type="password"
          class="form-control"
          bind:value={formData.password}
          autocomplete="new-password"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100"
        >Guardar Cambios</button
      >
    </form>
  </div>
</div>
