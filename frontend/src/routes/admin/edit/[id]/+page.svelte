<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import UserEditForm from "../../../../lib/components/UserEditForm.svelte";
  import {
    fetchUserById,
    updateUser,
  } from "../../../../lib/services/userService.js";

  let user: any = null;
  let loading = true;

  onMount(async () => {
    loading = true;
    try {
      const id = $page.params.id;
      user = await fetchUserById(id);
    } catch (err) {
      console.error("Error cargando usuario:", err);
      user = null;
    } finally {
      loading = false;
    }
  });

  async function handleSave(updatedUser) {
    try {
      await updateUser(updatedUser);
      alert("Usuario actualizado");
      goto("/admin");
    } catch (err) {
      console.error("Error guardando usuario:", err);
      alert("Error al guardar usuario");
    }
  }

  function handleCancel() {
    goto("/admin");
  }
</script>

{#if loading}
  <div class="text-center py-4">
    <div class="spinner-border text-primary"></div>
  </div>
{:else}
  <UserEditForm {user} onSave={handleSave} onCancel={handleCancel} />
{/if}
