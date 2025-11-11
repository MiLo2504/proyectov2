<script lang="ts">
  /** Objeto del paciente (debe tener los campos de la tabla `user`) */
  export let patient: any;

  // Mapeo de tipo de documento (puedes cargarlo desde API si prefieres)
  const documentTypes = {
    1: "DNI",
    2: "Carnet de Extranjería",
    3: "Pasaporte",
  };

  $: tipoDocumento = documentTypes[patient.id_type_document] ?? "DNI";
</script>

<div class="card shadow-sm h-100">
  <div class="card-body d-flex flex-column">
    <h5 class="card-title fw-bold mb-3">Mi Perfil</h5>
    <hr />

    <div class="row g-3 flex-grow-1">
      <!-- Nombre de Usuario -->
      <div class="col-12">
        <strong>Nombre de Usuario</strong><br />
        <span class="text-muted">{patient.user_name ?? "-"}</span>
      </div>

      <!-- Nombre y Apellido -->
      <div class="col-md-6">
        <strong>Nombre</strong><br />
        <span class="text-muted">{patient.full_name ?? "-"}</span>
      </div>
      <div class="col-md-6">
        <strong>Apellido</strong><br />
        <span class="text-muted">{patient.last_name ?? "-"}</span>
      </div>

      <!-- Tipo y Número de Documento -->
      <div class="col-md-6">
        <strong>Tipo de Documento</strong><br />
        <span class="text-muted">{tipoDocumento}</span>
      </div>
      <div class="col-md-6">
        <strong>Número de Documento</strong><br />
        <span class="text-muted">{patient.num_document ?? "-"}</span>
      </div>

      <!-- Fecha de Nacimiento -->
      <div class="col-12">
        <strong>Fecha de Nacimiento</strong><br />
        <span class="text-muted">
          {patient.date_birth
            ? new Date(patient.date_birth).toLocaleDateString("es-PE")
            : "dd/mm/aaaa"}
        </span>
      </div>

      <!-- Teléfono -->
      <div class="col-12">
        <strong>Teléfono</strong><br />
        <span class="text-muted">{patient.phone ?? "-"}</span>
      </div>

      <!-- Correo Electrónico -->
      <div class="col-12">
        <strong>Correo Electrónico</strong><br />
        <span class="text-muted">{patient.email ?? "-"}</span>
      </div>

      <!-- Dirección -->
      <div class="col-12">
        <strong>Dirección</strong><br />
        <span class="text-muted">{patient.address ?? "-"}</span>
      </div>
    </div>
  </div>
</div>
