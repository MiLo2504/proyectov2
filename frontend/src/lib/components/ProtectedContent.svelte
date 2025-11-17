<script>
  import { permissions } from "$lib/stores/auth.js";

  // Props: módulo(s) requerido(s)
  export let requireModule = null; // puede ser un ID, nombre, o array de ellos
  export let requireAll = false; // si true, requiere TODOS los módulos; si false, requiere AL MENOS UNO
  export let fallback = null; // contenido alternativo si no tiene permisos

  let hasAccess = false;

  $: {
    if (!requireModule) {
      hasAccess = true; // sin restricciones
    } else if (Array.isArray(requireModule)) {
      hasAccess = requireAll
        ? $permissions.hasAllModules(requireModule)
        : $permissions.hasAnyModule(requireModule);
    } else {
      hasAccess = $permissions.hasModule(requireModule);
    }
  }
</script>

{#if hasAccess}
  <slot />
{:else if fallback}
  {@html fallback}
{/if}
