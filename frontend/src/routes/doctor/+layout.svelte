<script>
  import DoctorNavbar from "../../lib/components/DoctorNavbar.svelte";
  import { onMount } from "svelte";

  let doctorName = "Doctor"; // valor por defecto mientras carga

  // Función para leer y parsear la cookie user_data
  function getUserFromCookie() {
    if (typeof document === "undefined") return null; // por SSR

    const match = document.cookie.match(/(?:^|; )user_data=([^;]*)/);
    if (!match) return null;

    try {
      const value = decodeURIComponent(match[1]);
      return JSON.parse(value);
    } catch (e) {
      console.error("Error al parsear user_data:", e);
      return null;
    }
  }

  onMount(() => {
    const user = getUserFromCookie();
    if (user) {
      // Construimos el nombre usando los campos que vienen de la API
      const fullName = user.full_name || user.user_name || "";
      const lastName = user.last_name || "";
      const combined = `${fullName} ${lastName}`.trim();

      doctorName = combined || "Doctor";
    }
  });
</script>

<DoctorNavbar nombre={doctorName} />

<main class="container-fluid">
  <div class="row">
    <div class="col">
      <slot />
    </div>
  </div>
</main>
