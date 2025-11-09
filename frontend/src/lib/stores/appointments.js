// src/lib/stores/appointments.js
import { writable } from 'svelte/store';

export const appointments = writable([]);
export const loading = writable(false);