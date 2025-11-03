<script lang="ts">
  export let newUser = {
    user_name: "",
    password: "",
    full_name: "",
    last_name: "",
    email: "",
    date_birth: "",
    address: "",
    phone: "",
    id_type_document: "",
    num_document: "",
    id_rol: "",
  };

  // Roles y tipos de documento vendrían del backend idealmente
  export let roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Doctor" },
    { id: 3, name: "Paciente" },
    { id: 4, name: "Administrador (Secretaria)" },
  ];

  export let documentTypes = [
    { id: 1, name: "Cédula de Ciudadanía" },
    { id: 2, name: "Tarjeta de Identidad" },
  ];

  export let onSubmit;

  function handleSubmit() {
    if (
      !newUser.user_name ||
      !newUser.email ||
      !newUser.password ||
      !newUser.id_rol ||
      !newUser.id_type_document
    ) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    // Envía el objeto completo con nombres compatibles con la BD
    onSubmit(newUser);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="row g-2">
    <div class="col-md-6">
      <input
        class="form-control"
        placeholder="Nombre de usuario"
        bind:value={newUser.user_name}
      />
    </div>
    <div class="col-md-6">
      <input
        class="form-control"
        placeholder="Correo"
        bind:value={newUser.email}
      />
    </div>
    <div class="col-md-6">
      <input
        class="form-control"
        placeholder="Nombre"
        bind:value={newUser.full_name}
      />
    </div>
    <div class="col-md-6">
      <input
        class="form-control"
        placeholder="Apellido"
        bind:value={newUser.last_name}
      />
    </div>
    <div class="col-md-6">
      <select class="form-select" bind:value={newUser.id_type_document}>
        <option value="">Tipo de documento</option>
        {#each documentTypes as type}
          <option value={type.id}>{type.name}</option>
        {/each}
      </select>
    </div>
    <div class="col-md-6">
      <input
        class="form-control"
        placeholder="Número de documento"
        bind:value={newUser.num_document}
      />
    </div>
    <div class="col-md-6">
      <input type="date" class="form-control" bind:value={newUser.date_birth} />
    </div>
    <div class="col-md-6">
      <input
        class="form-control"
        placeholder="Teléfono"
        bind:value={newUser.phone}
      />
    </div>
    <div class="col-md-12">
      <input
        class="form-control"
        placeholder="Dirección"
        bind:value={newUser.address}
      />
    </div>
    <div class="col-md-12">
      <input
        type="password"
        class="form-control"
        placeholder="Contraseña"
        bind:value={newUser.password}
      />
    </div>
    <div class="col-md-12">
      <select class="form-select" bind:value={newUser.id_rol}>
        <option value="">Selecciona un rol</option>
        {#each roles as role}
          <option value={role.id}>{role.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="d-grid mt-3">
    <button type="submit" class="btn btn-primary">Crear Usuario</button>
  </div>
</form>
