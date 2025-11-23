<script>
  import { can } from "$lib/stores/permissions.js";

  export let module = "";
  export let action = "ver";
  export let variant = "primary"; // primary, secondary, success, danger, warning
  export let size = "md"; // sm, md, lg
  export let outline = false;
  export let disabled = false;
  export let icon = "";
  export let title = "";
  export let onClick = () => {};

  $: hasPermission = $can(module, action);
  $: isDisabled = disabled || !hasPermission;

  $: btnClass = `btn btn-${outline ? "outline-" : ""}${variant} btn-${size}`;

  function handleClick(event) {
    if (!isDisabled && onClick) {
      onClick(event);
    }
  }
</script>

{#if hasPermission}
  <button class={btnClass} disabled={isDisabled} {title} on:click={handleClick}>
    {#if icon}
      <i class="bi bi-{icon} me-1"></i>
    {/if}
    <slot />
  </button>
{:else}
  <!-- Botón oculto o deshabilitado según preferencia -->
  <!-- Por defecto no se muestra si no hay permiso -->
{/if}
