<script>
  import { onMount } from "svelte";
  import { permissions } from "$lib/stores/permissions.js";
  import { auth } from "$lib/stores/auth.js";

  /** @type {import('./$types').LayoutData} */
  export let data;

  let userFullName = "";
  let userRoleName = "";
  let userPhoto = "https://i.pravatar.cc/40";

  // Cargar permisos en el store cuando el layout se monta
  onMount(() => {
    if (data.user) {
      permissions.loadPermissions(data.user);

      // Sincronizar con auth store si es necesario
      auth.update((current) => ({
        ...current,
        user: data.user,
        isAuthenticated: true,
      }));

      userFullName = data.user.full_name || data.user.user_name || "Usuario";
      userRoleName = data.user.rol_name || "Usuario";
    }
  });
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-white shadow">
  <div class="container">
    <a class="navbar-brand text-primary fw-bold" href="/dinamico">
      MediVision
    </a>

    <!-- Botón hamburguesa -->
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

    <!-- Menú colapsable -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <!-- Nombre y foto arriba en móvil -->
      <div class="d-lg-none mt-3 mb-2">
        <div class="d-flex align-items-center">
          <span class="fw-semibold text-dark me-2">{userFullName}</span>
          <img
            src={userPhoto}
            alt="perfil"
            class="rounded-circle border"
            width="40"
            height="40"
          />
        </div>
        <span class="badge bg-primary mt-1">{userRoleName}</span>
      </div>

      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" href="/dinamico">
            <i class="bi bi-house-door me-1"></i>
            Inicio
          </a>
        </li>
      </ul>

      <!-- Botón cerrar sesión debajo en móvil -->
      <div class="d-lg-none mb-3">
        <a href="/login" class="btn btn-primary w-100">Cerrar sesión</a>
      </div>

      <!-- Usuario + cerrar sesión (visible solo en escritorio) -->
      <div class="d-none d-lg-flex align-items-center">
        <div class="me-3 text-end">
          <div class="fw-semibold text-dark">{userFullName}</div>
          <small class="text-muted">{userRoleName}</small>
        </div>
        <img
          src={userPhoto}
          alt="perfil"
          class="rounded-circle border"
          width="40"
          height="40"
        />
        <a href="/login" class="btn btn-primary ms-3">Cerrar sesión</a>
      </div>
    </div>
  </div>
</nav>

<main class="flex-grow-1">
  <div class="container py-4">
    <slot />
  </div>
</main>

<style>
  :global(body) {
    background-color: #f8f9fa;
  }
</style>
