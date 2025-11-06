// src/lib/services/stateAppointmentService.js

const API_URL = "http://127.0.0.1:8000/state_appointments";

export async function listStateAppointments() {
  try {
    const res = await fetch(`${API_URL}/`);
    if (!res.ok) throw new Error("Error al cargar estados de citas");
    return await res.json(); // [{ id_state, state_name, state }]
  } catch (err) {
    console.error("listStateAppointments error:", err);
    return [];
  }
}
