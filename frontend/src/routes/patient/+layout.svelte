<script>
  import PatientNavbar from "../../lib/components/NavbarPaciente.svelte";
  import { auth } from "$lib/stores/auth.js";

  let currentUser = null;
  auth.subscribe((value) => {
    currentUser = value.user;
  });
</script>

<PatientNavbar nombre={currentUser?.full_name || "Paciente"} />

<main class="flex-grow-1">
  <slot />
</main>
