<script lang="ts">
  import { goto } from "$app/navigation";
  import { login } from "$lib/stores/auth.js";

  // Estado reactivo
  let email = "";
  let password = "";
  let errorMessage = "";
  let submitting = false;

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
      submitting = true;
      errorMessage = ""; // Limpiar errores previos

      // Usamos la función del store que ya apunta al backend correcto
      const user = await login(email, password);

      // Redirección inteligente basada en rol Y permisos
      const role = user?.id_rol;
      const modules = user?.modules || [];
      const hasModule = (name) => modules.some((m) => m.name === name);

      let path = "/"; // Ruta por defecto

      // Prioridad: roles predefinidos primero
      if (role === 1) {
        path = "/admin";
      } else if (role === 2) {
        path = "/doctor";
      } else if (role === 3) {
        path = "/patient";
      } else if (role === 4 || role === 6) {
        path = "/secretary";
      }
      // Para roles personalizados, redirigir según permisos
      else if (hasModule("Administración")) {
        path = "/admin";
      } else if (hasModule("Citas")) {
        path = "/secretary"; // Si tiene citas pero no es rol predefinido
      } else if (hasModule("Pacientes")) {
        path = "/secretary";
      } else {
        // Si no tiene permisos claros, mostrar mensaje
        showError(
          "Tu cuenta no tiene permisos asignados. Contacta al administrador."
        );
        submitting = false;
        return;
      }

      goto(path);
    } catch (err) {
      // El store ya nos da un mensaje de error específico
      showError(err.message || "Credenciales inválidas o error de conexión");
      console.error(err);
    } finally {
      submitting = false;
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
      <button
        type="submit"
        class="btn btn-primary w-100 py-2 fw-bold"
        disabled={submitting}
      >
        {#if submitting}
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Iniciando...
        {:else}
          Iniciar sesión
        {/if}
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
