<script>
  // Aquí podrías luego conectar el nombre y foto del admin desde tu store o API
  let admin = {
    nombre: "Administrador",
    foto: "https://i.pravatar.cc/40",
  };
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-white shadow">
  <div class="container">
    <a class="navbar-brand text-primary fw-bold" href="/">MediVision</a>

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
          <span class="fw-semibold text-dark me-2">{admin.nombre}</span>
          <img
            src={admin.foto}
            alt="perfil"
            class="rounded-circle border"
            width="40"
            height="40"
          />
        </div>
      </div>

      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" href="/">Inicio</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#usuarios">Usuarios</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="admin/roles">Crear Rol</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="#resultados">Resultados</a>
        </li>
      </ul>

      <!-- Botón cerrar sesión debajo en móvil -->
      <div class="d-lg-none mb-3">
        <a href="/login" class="btn btn-primary">Cerrar sesión</a>
      </div>

      <!-- Usuario + cerrar sesión (visible solo en escritorio) -->
      <div class="d-none d-lg-flex align-items-center">
        <span class="me-2 fw-semibold text-dark">{admin.nombre}</span>
        <img
          src={admin.foto}
          alt="perfil"
          class="rounded-circle border"
          width="40"
          height="40"
        />admin.nombre
        <a href="/login" class="btn btn-primary ms-2">Cerrar sesión</a>
      </div>
    </div>
  </div>
</nav>
