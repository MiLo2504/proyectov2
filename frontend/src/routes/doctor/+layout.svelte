<script>
  // Usar ruta relativa para evitar problemas de resolución de alias durante SSR
  import DoctorNavbar from "../../lib/components/DoctorNavbar.svelte";
</script>

<DoctorNavbar />

<main class="container-fluid">
  <div class="row">
    <div class="col">
      <slot />
    </div>
  </div>
</main>
