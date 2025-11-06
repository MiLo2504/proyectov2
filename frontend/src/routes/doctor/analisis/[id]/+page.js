export const ssr = false; // desactiva SSR para esta página (DataTables/DOM heavy)

export function load({ params }) {
  return { id: params.id };
}
