<script>
  import "bootstrap/dist/css/bootstrap.min.css";
  import { onMount } from "svelte";
  import Navbar from "../../lib/components/Navbar.svelte";
  import { goto } from "$app/navigation";
  import { createUser } from "$lib/services/userService.js";
  import { fetchRoles } from "$lib/services/roleService.js";

  let formData = {
    user_name: "",
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
    password: "",
  };

  // Roles y tipos de documento desde API
  let patientRoleId = null;
  let typeDocuments = [];

  onMount(async () => {
    // Cargar tipos de documento desde API (con fallback vacío)
    try {
      const res = await fetch("http://127.0.0.1:8000/type_documents/");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) typeDocuments = data;
      }
    } catch (e) {
      console.warn("No se pudieron cargar tipos de documento (register)", e);
    }

    // Obtener id del rol Paciente desde API de roles
    try {
      const roles = await fetchRoles();
      const paciente = (roles || []).find(
        (r) => String(r.name || "").toLowerCase() === "paciente"
      );
      patientRoleId = paciente ? paciente.id : null;
    } catch (e) {
      console.warn("No se pudieron cargar roles (register)", e);
      // si no hay API, intenta fallback a 1
      patientRoleId = 1;
    }
  });

  async function registerUser() {
    try {
      const payload = {
        user_name: formData.user_name,
        password: formData.password,
        full_name: formData.full_name,
        last_name: formData.last_name,
        email: formData.email,
        date_birth: formData.date_birth || null,
        address: formData.address || null,
        phone: formData.phone || null,
        id_type_document: formData.id_type_document,
        num_document: formData.num_document,
        id_rol: patientRoleId || 1, // forzar Paciente
        genero: formData.genero || null,
      };

      const created = await createUser(payload);
      alert("Registro exitoso. Ya puedes iniciar sesión.");
      // Resetear formulario
      formData = {
        user_name: "",
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
        password: "",
      };
      // Redirigir a login
      goto("/login");
    } catch (e) {
      console.error("Error en registro:", e);
      alert(e?.message || "No se pudo completar el registro");
    }
  }
</script>

<div class="container mt-5 mb-5">
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card shadow-lg border-0 rounded-4">
        <div class="card-body p-4">
          <h3 class="text-center mb-4 fw-bold text-primary">
            Registro de Usuario
          </h3>

          <form on:submit|preventDefault={registerUser}>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="user_name" class="form-label"
                  >Nombre de usuario</label
                >
                <input
                  type="text"
                  id="user_name"
                  bind:value={formData.user_name}
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  bind:value={formData.email}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="full_name" class="form-label">Nombre</label>
                <input
                  type="text"
                  id="full_name"
                  bind:value={formData.full_name}
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label for="last_name" class="form-label">Apellido</label>
                <input
                  type="text"
                  id="last_name"
                  bind:value={formData.last_name}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="id_type_document" class="form-label"
                  >Tipo de documento</label
                >
                <select
                  id="id_type_document"
                  bind:value={formData.id_type_document}
                  class="form-select"
                  required
                >
                  <option value="">Seleccione...</option>
                  {#each typeDocuments as doc}
                    <option value={doc.id}>{doc.name}</option>
                  {/each}
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label for="num_document" class="form-label"
                  >Número de documento</label
                >
                <input
                  type="number"
                  id="num_document"
                  bind:value={formData.num_document}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="mb-4">
                <label for="genero" class="form-label">Género</label>
                <select
                  id="genero"
                  class="form-select"
                  bind:value={formData.genero}
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="date_birth" class="form-label"
                  >Fecha de nacimiento</label
                >
                <input
                  type="date"
                  id="date_birth"
                  bind:value={formData.date_birth}
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label for="phone" class="form-label">Teléfono</label>
                <input
                  type="text"
                  id="phone"
                  bind:value={formData.phone}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="mb-3">
              <label for="address" class="form-label">Dirección</label>
              <input
                type="text"
                id="address"
                bind:value={formData.address}
                class="form-control"
                required
              />
            </div>

            <div class="mb-4">
              <label for="password" class="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                bind:value={formData.password}
                class="form-control"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2 fw-semibold"
            >
              Registrarse
            </button>

            <div class="text-center mt-3">
              <small
                >¿Ya tienes una cuenta? <a
                  href="/login"
                  class="text-decoration-none">Inicia sesión</a
                ></small
              >
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
