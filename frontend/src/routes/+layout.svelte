<script>
  // Import global Bootstrap CSS (requires `bootstrap` installed in node_modules)
  import "bootstrap/dist/css/bootstrap.min.css";

  import Footer from "../lib/components/Footer.svelte";
  import Navbar from "../lib/components/navbar.svelte";
</script>

<main class="flex-grow-1">
  <slot />
</main>

<Footer />
