<script>
  import DoctorNavbar from "../../lib/components/DoctorNavbar.svelte";
  import { auth } from "$lib/stores/auth.js";

  let currentUser = null;

  // Nos suscribimos al store de autenticación
  auth.subscribe((value) => {
    currentUser = value.user;
  });

  // Nombre completo del doctor, combinando full_name + last_name
  $: doctorName = currentUser
    ? `${currentUser.full_name || currentUser.user_name || ""} ${currentUser.last_name || ""}`.trim()
    : "Doctor";
</script>

<DoctorNavbar nombre={doctorName} />

<main class="container-fluid">
  <div class="row">
    <div class="col">
      <slot />
    </div>
  </div>
</main>
