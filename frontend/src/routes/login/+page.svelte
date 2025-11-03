<script lang="ts">
  import { goto } from "$app/navigation";

  // Estado reactivo
  let email = "";
  let password = "";
  let errorMessage = "";

  // Función para mostrar errores
  function showError(message) {
    errorMessage = message;
  }

  // Función de inicio de sesión
  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      showError("Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.detail || "Credenciales incorrectas");
        return;
      }

      // Guardar token (puedes usar un store o cookies en lugar de localStorage)
      localStorage.setItem("token", data.access_token);

      // Redirigir usando SvelteKit
      alert("Inicio de sesión exitoso ✅");
      goto("/dashboard"); // Ajusta la ruta según tu aplicación
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    }
  }
</script>

<div class="d-flex justify-content-center align-items-center vh-100 bg-light">
  <div class="card shadow-lg p-4 border-0 rounded-4" style="width: 25rem;">
    <h3 class="text-center mb-4 fw-bold text-primary">Iniciar Sesión</h3>

    <!-- Mensaje de error -->
    {#if errorMessage}
      <div class="alert alert-danger text-center py-2">{errorMessage}</div>
    {/if}

    <form on:submit|preventDefault={handleLogin}>
      <!-- Correo -->
      <div class="mb-3">
        <label for="email" class="form-label">Correo electrónico</label>
        <input
          id="email"
          type="email"
          class="form-control"
          placeholder="usuario@ejemplo.com"
          bind:value={email}
          required
        />
      </div>

      <!-- Contraseña -->
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          type="password"
          class="form-control"
          placeholder="********"
          bind:value={password}
          required
        />
      </div>

      <!-- Botón -->
      <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
        Iniciar sesión
      </button>
    </form>

    <!-- Enlace a registro -->
    <div class="text-center mt-3">
      <small>
        ¿No tienes cuenta? <a href="/register" class="text-primary"
          >Regístrate</a
        >
      </small>
    </div>
  </div>
</div>
