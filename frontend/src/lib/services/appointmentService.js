// src/lib/services/appointmentService.js

const API_URL = "http://127.0.0.1:8000/appointments";

// Función auxiliar para obtener los headers de autenticación
function getAuthHeaders() {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Listar citas según el rol
export async function listAppointments(role = "doctor") {
  try {
    // Si es doctor, usar el endpoint /mine que filtra por el doctor autenticado
    // Si es secretario o admin, usar el endpoint general que devuelve todas
    const endpoint = role === "doctor" ? `${API_URL}/mine` : `${API_URL}`;
    
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    if (!res.ok) throw new Error("Error al cargar citas");
    return await res.json();
  } catch (err) {
    console.error("listAppointments error:", err);
    return [];
  }
}

// Crear cita
export async function createAppointment(payload) {
  try {
    const body = {
      id_user: Number(payload.id_user),
      appointment_date: payload.appointment_date,
      id_state: Number(payload.id_state ?? 1),
    };
    const res = await fetch(`${API_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
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

// Actualizar una cita
export async function updateAppointment(id, partial) {
  try {
    const body = {};
    if (partial.id_user !== undefined) body.id_user = Number(partial.id_user);
    if (partial.appointment_date !== undefined) body.appointment_date = partial.appointment_date;
    if (partial.id_state !== undefined) body.id_state = Number(partial.id_state);

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Error al actualizar cita");
    return await res.json();
  } catch (err) {
    console.error("updateAppointment error:", err);
    throw err;
  }
}


