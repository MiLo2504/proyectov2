<script>
  // Import global Bootstrap CSS (requires `bootstrap` installed in node_modules)
  import "bootstrap/dist/css/bootstrap.min.css";

  import Footer from "../lib/components/Footer.svelte";
  import Navbar from "../lib/components/Navbar.svelte";
</script>

<div class="app-container">
  <main class="flex-grow-1">
    <slot />
  </main>

  <Footer />
</div>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
