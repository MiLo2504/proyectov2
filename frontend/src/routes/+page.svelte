<script>
  import Navbar from "../lib/components/Navbar.svelte";
</script>

<Navbar />

<section class="container text-center py-5">
  <h1 class="fw-bold text-primary mb-4">Bienvenido a MediVision</h1>
  <p class="lead mb-5">
    Plataforma médica inteligente para el análisis de imágenes con IA.
  </p>
  <a href="/login" class="btn btn-primary btn-lg">Comenzar</a>
</section>

<section id="info" class="container py-5">
  <h2 class="text-primary mb-3">Información</h2>
  <p>
    MediVision permite a doctores y pacientes subir y analizar imágenes médicas
    usando algoritmos avanzados de inteligencia artificial.
  </p>
</section>

<section id="contacto" class="container py-5">
  <h2 class="text-primary mb-3">Contacto</h2>
  <p>Para soporte o más información, escríbenos a: soporte@medivision.com</p>
</section>
