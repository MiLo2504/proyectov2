<script lang="ts">
  import { enhance } from "$app/forms";

  /** @type {import('./$types').ActionData} */
  export let form;

  let submitting = false;
  let errorMessage = form?.error || "";
</script>

<div class="d-flex justify-content-center align-items-center vh-100 bg-light">
  <div class="card shadow-lg p-4 border-0 rounded-4" style="width: 25rem;">
    <h3 class="text-center mb-4 fw-bold text-primary">Iniciar Sesión</h3>

    <!-- Mensaje de error -->
    {#if errorMessage}
      <div class="alert alert-danger text-center py-2">{errorMessage}</div>
    {/if}

    <form
      method="POST"
      use:enhance={() => {
        submitting = true;
        errorMessage = "";

        return async ({ result, update }) => {
          submitting = false;
          if (result.type === "failure") {
            errorMessage = result.data?.error || "Error al iniciar sesión";
          }
          await update();
        };
      }}
    >
      <!-- Correo -->
      <div class="mb-3">
        <label for="username" class="form-label">Correo electrónico</label>
        <input
          id="username"
          name="username"
          type="email"
          class="form-control"
          placeholder="usuario@ejemplo.com"
          required
        />
      </div>

      <!-- Contraseña -->
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          class="form-control"
          placeholder="********"
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
