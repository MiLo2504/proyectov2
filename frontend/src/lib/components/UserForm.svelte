<script lang="ts">
  export let newUser: any = {
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
    genero: "",
    id: undefined,
  };

  // Si se pasa `user` (modo edición), el formulario usará esos valores.
  export let user: any = null;
  export let onCancel: (() => void) | null = null;

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

  import { onMount } from "svelte";
  let typeDocuments = documentTypes;

  onMount(() => {
    // intentar cargar desde la API, pero conservar el fallback documentTypes
    fetch("http://127.0.0.1:8000/type_documents/")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) typeDocuments = data;
      })
      .catch((e) => {
        console.error(
          "No se pudieron cargar tipos de documento, usando fallback",
          e
        );
      });
  });

  export let onSubmit: (payload: any) => void;

  // Si el componente recibe `user` (edición), sincronizamos el objeto mostrado.
  $: if (user) {
    // copia simple para evitar mutar el objeto padre
    newUser = {
      user_name: user.user_name ?? "",
      password: user.password ?? "",
      full_name: user.full_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      date_birth: user.date_birth ?? "",
      address: user.address ?? "",
      phone: user.phone ?? "",
      id_type_document: user.id_type_document ?? "",
      num_document: user.num_document ?? "",
      id_rol: user.id_rol ?? "",
      genero: user.genero ?? "",
      id: user.id ?? undefined,
    };
  }

  function handleSubmit() {
    const isEdit = !!user;
    if (
      !newUser.user_name ||
      !newUser.email ||
      (!isEdit && !newUser.password) ||
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
      <label for="id_type_document" class="form-label visually-hidden"
        >Tipo de documento</label
      >
      <select
        id="id_type_document"
        class="form-select"
        bind:value={newUser.id_type_document}
      >
        <option value="">Tipo de documento</option>
        {#each typeDocuments as type}
          <option value={type.id}>{type.name}</option>
        {/each}
      </select>
    </div>
    <div class="col-md-6">
      <input
        type="number"
        class="form-control"
        placeholder="Número de documento"
        bind:value={newUser.num_document}
      />
    </div>
    <div class="col-md-6">
      <label for="genero" class="form-label visually-hidden">Género</label>
      <select id="genero" class="form-select" bind:value={newUser.genero}>
        <option value="">Género</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="Otro">Otro</option>
      </select>
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

  <div class="d-flex gap-2 mt-3 justify-content-end">
    {#if onCancel}
      <button type="button" class="btn btn-secondary" on:click={onCancel}>
        Cancelar
      </button>
    {/if}
    <button type="submit" class="btn btn-primary">
      {#if user}Guardar Cambios{:else}Crear Usuario{/if}
    </button>
  </div>
</form>
