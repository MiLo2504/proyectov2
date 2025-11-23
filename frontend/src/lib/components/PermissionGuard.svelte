<script>
  import { can } from "$lib/stores/permissions.js";

  export let module = "";
  export let action = "ver"; // ver, crear, editar, eliminar
  export let requireAll = false; // Si se pasan múltiples acciones

  $: hasPermission = Array.isArray(action)
    ? requireAll
      ? action.every((a) => $can(module, a))
      : action.some((a) => $can(module, a))
    : $can(module, action);
</script>

{#if hasPermission}
  <slot />
{:else}
  <slot name="fallback">
    <!-- Fallback por defecto: no mostrar nada -->
  </slot>
{/if}
