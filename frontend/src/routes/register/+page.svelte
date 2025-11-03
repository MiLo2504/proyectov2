<script>
  import "bootstrap/dist/css/bootstrap.min.css";
  import { onMount } from "svelte";
  import Navbar from "../../lib/components/Navbar.svelte";

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
    password: "",
  };

  let roles = [
    { id: 1, name: "Paciente" },
    { id: 2, name: "Doctor" },
    { id: 3, name: "Administrador" },
  ];

  let typeDocuments = [
    { id: 1, name: "Cédula" },
    { id: 2, name: "Tarjeta de identidad" },
    { id: 3, name: "Pasaporte" },
  ];

  function registerUser() {
    console.log("Datos del registro:", formData);

    // Aquí luego conectarás con FastAPI (POST)
    // Ejemplo:
    // await fetch("http://127.0.0.1:8000/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData)
    // });
    alert("Registro enviado (simulado). Revisa la consola.");
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
                <label class="form-label">Nombre de usuario</label>
                <input
                  type="text"
                  bind:value={formData.user_name}
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Correo electrónico</label>
                <input
                  type="email"
                  bind:value={formData.email}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Nombre</label>
                <input
                  type="text"
                  bind:value={formData.full_name}
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Apellido</label>
                <input
                  type="text"
                  bind:value={formData.last_name}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Tipo de documento</label>
                <select
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
                <label class="form-label">Número de documento</label>
                <input
                  type="number"
                  bind:value={formData.num_document}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha de nacimiento</label>
                <input
                  type="date"
                  bind:value={formData.date_birth}
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Teléfono</label>
                <input
                  type="text"
                  bind:value={formData.phone}
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Dirección</label>
              <input
                type="text"
                bind:value={formData.address}
                class="form-control"
                required
              />
            </div>

            <div class="mb-4">
              <label class="form-label">Contraseña</label>
              <input
                type="password"
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
