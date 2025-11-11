// src/lib/services/patientService.js
const API_BASE = "http://127.0.0.1:8000";

function getAuthHeaders() {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Obtiene la lista de todos los tipos de documento.
 */
export async function fetchDocumentTypes() {
  const res = await fetch(`${API_BASE}/type_documents`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error('No se pudo cargar los tipos de documento');
  }
  return await res.json();
}

/**
 * Obtiene los datos del paciente actualmente logueado.
 * Usa el endpoint /users/me que obtiene el usuario a partir del token.
 */
export async function fetchPatient() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error('No se pudo cargar la información del paciente');
  }
  return await res.json();
}

/**
 * Actualiza los datos de un paciente.
 * @param {number} id - El ID del usuario a actualizar.
 * @param {object} data - Un objeto con los campos a modificar.
 */
export async function updatePatient(id, data) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Error desconocido al actualizar.' }));
    throw new Error(errorData.detail || 'No se pudo actualizar el perfil');
  }
  
  return await res.json();
}

// --- Funciones de análisis (placeholders) ---

/**
 * Sube un archivo de análisis.
 * Esta es una simulación. Deberá conectarse al endpoint real de la IA.
 * @param {File} file - El archivo a subir.
 */
export async function uploadAnalysis(file) {
  console.log("Simulando subida de archivo:", file.name);
  // Aquí iría la lógica para subir el archivo a un endpoint como /analysis/predict
  // const formData = new FormData();
  // formData.append('file', file);
  // const res = await fetch(`${API_BASE}/analysis/predict`, { method: 'POST', body: formData, ... });
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red
  return { success: true, message: "Archivo subido para análisis." };
}

/**
 * Obtiene la lista de análisis de un paciente.
 * Esto es una simulación. Deberá conectarse a un endpoint real.
 * @param {number} patientId - El ID del paciente.
 */
export async function fetchAnalyses(patientId) {
  console.log("Simulando obtención de análisis para el paciente:", patientId);
  // Aquí iría una llamada a algo como GET /analysis?patient_id={patientId}
  return [
    { id: 1, url_image: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Scan1", date: "2025-10-09", result_ia: "Normal" },
    { id: 2, url_image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Scan2", date: "2025-10-08", result_ia: "Anomalía detectada" },
  ];
}