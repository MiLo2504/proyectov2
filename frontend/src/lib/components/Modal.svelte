<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let size: 'sm' | 'md' | 'lg' = 'sm';
  export let closeOnBackdrop = true;
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function onBackdrop(e: MouseEvent) {
    if (!closeOnBackdrop) return;
    if ((e.target as HTMLElement).classList.contains('modal-backdrop') || (e.target as HTMLElement).classList.contains('modal-overlay')) {
      close();
    }
  }
</script>

<div class="modal-overlay" on:click={onBackdrop}>
  <div class="modal-backdrop"></div>
  <div class="modal-dialog {sizeClass}" role="dialog" aria-modal="true">
    <div class="modal-content">
      <slot />
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
  }
  .modal-dialog {
    position: relative;
    z-index: 1060;
    max-width: 100%;
    width: auto;
    margin: 1rem;
  }
  .modal-content {
    border-radius: 0.5rem;
    overflow: hidden;
    background: white;
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
    padding: 0.5rem;
  }
  .modal-dialog.sm { width: 540px; }
  .modal-dialog.md { width: 720px; }
  .modal-dialog.lg { width: 960px; }
</style>

<script lang="ts">
  // compute size class
  $: sizeClass = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
</script>
