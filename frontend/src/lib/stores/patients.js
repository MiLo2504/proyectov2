import { writable } from 'svelte/store';
export const patients = writable([]);

export const patient = writable(null);
export const analyses = writable([]);
export const loading = writable(false);