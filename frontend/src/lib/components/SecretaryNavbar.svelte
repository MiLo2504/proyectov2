<script lang="ts">
  import { goto } from "$app/navigation";

  let userName = "Secretaria Ana"; // Cambia según autenticación
  let profileImage = "https://i.pravatar.cc/40"; // Imagen placeholder

  function logout() {
    alert("Sesión cerrada correctamente 🩺");
    goto("/login");
  }
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-white shadow">
  <div class="container">
    <a class="navbar-brand text-primary fw-bold" href="/secretary"
      >MediVision - Secretaría</a
    >

    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
      <div class="d-lg-none mt-3 mb-2">
        <div class="d-flex align-items-center">
          <span class="fw-semibold text-dark me-2">{userName}</span>
          <img
            src={profileImage}
            alt="perfil"
            class="rounded-circle border"
            width="40"
            height="40"
          />
        </div>
      </div>
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" href="/secretary">Agendar Citas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/secretary/requests">Solicitudes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/secretary/reports">Reportes</a>
        </li>
      </ul>
      <div class="d-lg-none mb-3">
        <button class="btn btn-primary w-100" on:click={logout}
          >Cerrar sesión</button
        >
      </div>
      <div class="d-none d-lg-flex align-items-center">
        <span class="me-2 fw-semibold text-dark">{userName}</span>
        <img
          src={profileImage}
          alt="perfil"
          class="rounded-circle border"
          width="40"
          height="40"
        />
        <button class="btn btn-primary ms-2" on:click={logout}
          >Cerrar sesión</button
        >
      </div>
    </div>
  </div>
</nav>
