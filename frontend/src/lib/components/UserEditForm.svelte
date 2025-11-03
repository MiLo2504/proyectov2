<script lang="ts">
  export let user = null;
  export let onSave;
  export let onCancel;

  function handleSave() {
    if (onSave) onSave();
  }
</script>

<div class="container py-4">
  <div class="card shadow-sm border-0">
    <div class="card-body">
      <h3 class="fw-bold text-primary mb-4">Editar Usuario #{user?.id}</h3>

      {#if user}
        <form on:submit|preventDefault={handleSave}>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nombre</label><input class="form-control" bind:value={user.nombre} /></div>
            <div class="col-md-6"><label class="form-label">Apellido</label><input class="form-control" bind:value={user.apellido} /></div>
            <div class="col-md-4"><label class="form-label">Tipo de Documento</label><select class="form-select" bind:value={user.tipoDocumento}><option>CC</option><option>TI</option><option>CE</option><option>Pasaporte</option></select></div>
            <div class="col-md-8"><label class="form-label">Número de Documento</label><input class="form-control" bind:value={user.documento} /></div>
            <div class="col-md-6"><label class="form-label">Correo</label><input type="email" class="form-control" bind:value={user.correo} /></div>
            <div class="col-md-6"><label class="form-label">Teléfono</label><input class="form-control" bind:value={user.telefono} /></div>
            <div class="col-md-12"><label class="form-label">Dirección</label><input class="form-control" bind:value={user.direccion} /></div>
            <div class="col-md-6"><label class="form-label">Rol</label><select class="form-select" bind:value={user.rol}><option>Admin</option><option>Doctor</option><option>Paciente</option><option>Administrador (Secretaria)</option></select></div>
            <div class="col-md-6"><label class="form-label">Estado</label><select class="form-select" bind:value={user.estado}><option>Activo</option><option>Inactivo</option></select></div>
          </div>

          <div class="mt-4 d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" on:click={onCancel}>Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      {:else}
        <p class="text-danger">Usuario no encontrado ❌</p>
      {/if}
    </div>
  </div>
</div>