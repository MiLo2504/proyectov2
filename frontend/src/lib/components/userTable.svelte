<script context="module" lang="ts">
  // Tipo mínimo para usuario
  export type User = {
    id: number;
    full_name?: string;
    name?: string;
    role?: string;
    rol?: string;
    id_rol?: number;
    email?: string;
    state?: number;
    status?: string;
  };
</script>

<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";

  export let users: User[] = [];
  // ahora onEdit recibe el objeto usuario completo para permitir editar en-lugar
  export let onEdit: (user: User) => void = () => {};
  export let onDelete: (id: number) => void = () => {};
  export let searchQuery: string = "";
  export let selectedRoleFilter: string = "Todos";
  export let selectedStatusFilter: string = "Todos";
  export let enhanceWithDataTable: boolean = false;

  let tableEl: HTMLTableElement | null = null;
  let dt: any = null;
  let initialized = false;
  let lastInitCount = 0;

  $: filteredUsers = (users || []).filter((u) => {
    const name = (u.full_name || u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const role = (u.role || u.rol || String(u.id_rol || "")).toLowerCase();
    const status = (
      u.status ||
      (u.state === 1 ? "activo" : "inactivo") ||
      ""
    ).toLowerCase();

    const q = (searchQuery || "").toLowerCase();
    const matchSearch = name.includes(q) || email.includes(q);
    const matchRole =
      selectedRoleFilter === "Todos" ||
      role === (selectedRoleFilter || "").toLowerCase();
    const matchStatus =
      selectedStatusFilter === "Todos" ||
      status === (selectedStatusFilter || "").toLowerCase();

    return matchSearch && matchRole && matchStatus;
  });

  function loadCssOnce(href: string) {
    if (typeof document === "undefined") return;
    if (
      [...document.styleSheets].some(
        (s: any) => s?.href && s.href.includes(href)
      )
    )
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-injected-by", "userTable");
    document.head.appendChild(link);
  }

  function loadScriptOnce(src: string): Promise<void> {
    if (typeof document === "undefined") return Promise.resolve();
    if ([...document.scripts].some((s: any) => s?.src && s.src.includes(src)))
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-injected-by", "userTable");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(script);
    });
  }

  async function ensureDataTablesLoaded() {
    // DataTables v2 (vanilla) + Bootstrap integration
    loadCssOnce(
      "https://cdn.datatables.net/2.3.4/css/dataTables.bootstrap5.css"
    );
    // Bootstrap bundle (required by some styles)
    await loadScriptOnce(
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js"
    );
    // DataTables v2 (vanilla)
    await loadScriptOnce("https://cdn.datatables.net/2.3.4/js/dataTables.js");
    await loadScriptOnce(
      "https://cdn.datatables.net/2.3.4/js/dataTables.bootstrap5.js"
    );
  }

  async function initDataTable() {
    try {
      await ensureDataTablesLoaded();
      // @ts-ignore
      const DataTableCtor =
        (window as any).DataTable || (globalThis as any).DataTable;
      if (DataTableCtor && tableEl) {
        try {
          if (dt && typeof dt.destroy === "function") dt.destroy();
        } catch (e) {}

        dt = new DataTableCtor(tableEl, {
          paging: true,
          searching: true,
          ordering: true,
          lengthMenu: [10, 25, 50, 100],
          pageLength: 10,
          layout: {
            topStart: "pageLength",
            topEnd: "search",
            bottomStart: "info",
            bottomEnd: "paging",
          },
          language: {
            url: "https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json",
          },
        });
        initialized = true;
        lastInitCount = filteredUsers.length;
      }
    } catch (e) {
      console.error("No se pudo inicializar DataTable:", e);
    }
  }

  onMount(async () => {
    if (!enhanceWithDataTable) return;
    await tick();
    await initDataTable();
  });

  onDestroy(() => {
    try {
      if (dt && typeof dt.destroy === "function") dt.destroy();
    } catch (e) {}
    dt = null;
    initialized = false;
  });

  $: (async () => {
    if (!enhanceWithDataTable) return;
    if (!tableEl) return;
    if (!initialized) return;
    if (filteredUsers.length === lastInitCount) return;

    try {
      if (dt && typeof dt.destroy === "function") dt.destroy();
    } catch (e) {}
    dt = null;
    initialized = false;
    await tick();
    await initDataTable();
  })();
</script>

<div class="table-responsive">
  <table class="table table-striped align-middle" bind:this={tableEl}>
    <thead class="table-light">
      <tr>
        <th>Nombre</th>
        <th>Rol</th>
        <th>Email</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredUsers as user}
        <tr>
          <td>{user.full_name ?? user.name ?? "-"}</td>
          <td>{user.role ?? user.rol ?? user.id_rol ?? "-"}</td>
          <td>{user.email ?? "-"}</td>
          <td>
            <span
              class="badge {user.state === 1 ||
              (user.status || '').toLowerCase() === 'activo'
                ? 'bg-success'
                : 'bg-danger'}"
            >
              {user.state === 1 ||
              (user.status || "").toLowerCase() === "activo"
                ? "Activo"
                : "Inactivo"}
            </span>
          </td>
          <td>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              on:click={() => onEdit?.(user)}
              disabled={!onEdit}>Editar</button
            >
            <button
              class="btn btn-sm btn-outline-danger"
              on:click={() => onDelete?.(user.id)}
              disabled={!onDelete}>Eliminar</button
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  :global(.dataTables_wrapper .dataTables_length select),
  :global(.dataTables_wrapper .dataTables_filter input) {
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    padding: 0.375rem 0.75rem;
  }
</style>
