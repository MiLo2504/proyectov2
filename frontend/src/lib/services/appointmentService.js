// src/lib/services/appointmentService.js

const API_URL = "http://127.0.0.1:8000/appointments";

// Listar todas las citas
export async function listAppointments() {
  try {
    const res = await fetch(`${API_URL}/`);
    if (!res.ok) throw new Error("Error al cargar citas");
    return await res.json();
  } catch (err) {
    console.error("listAppointments error:", err);
    return [];
  }
}

// Crear cita
// payload: { id_user: number, appointment_date: string|Date ISO, id_state: number }
export async function createAppointment(payload) {
  try {
    const body = {
      id_user: Number(payload.id_user),
      appointment_date: payload.appointment_date,
      id_state: Number(payload.id_state ?? 1),
    };
    const res = await fetch(`${API_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Error al crear cita");
    return await res.json();
  } catch (err) {
    console.error("createAppointment error:", err);
    throw err;
  }
}

// Placeholder de proceso (si se requiere en el futuro)
export async function processRequest(request) {
  console.log("Solicitud procesada:", request);
  return { success: true };
}

// Actualizar una cita (parcial) - por ejemplo para cambiar id_state
// partial: { id_user?, appointment_date?, id_state? }
export async function updateAppointment(id, partial) {
  try {
    const body = {};
    if (partial.id_user !== undefined) body.id_user = Number(partial.id_user);
    if (partial.appointment_date !== undefined) body.appointment_date = partial.appointment_date;
    if (partial.id_state !== undefined) body.id_state = Number(partial.id_state);

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Error al actualizar cita");
    return await res.json();
  } catch (err) {
    console.error("updateAppointment error:", err);
    throw err;
  }
}


