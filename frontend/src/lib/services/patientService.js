// src/lib/services/patientService.js
const API_BASE = "http://127.0.0.1:8000";

function getAuthHeaders() {
  try {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
} 

/**
 * Obtiene los datos de un paciente por su ID.
 * Llama a GET /users/{id} en tu backend.
 */
export async function fetchPatient(patientId) {
  const res = await fetch(url(`patients/${patientId}`), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error("No se pudo cargar la información del paciente");
  }

  return await res.json();
}

export async function fetchDocumentTypes() {
  const res = await fetch(url(`type_documents`), {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() }
  });

  if (!res.ok) {
    throw new Error("No se pudieron cargar los tipos de documento");
  }

  return await res.json();
}


/**
 * Actualiza los datos del paciente (usuario).
 * Usa PUT /users/{id} que ya tienes en el backend.
 */
export async function updatePatient(id, data) {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Error desconocido al actualizar." }));
    throw new Error(errorData.detail || "No se pudo actualizar el perfil");
  }

  return await res.json();
}

/**
 * Sube una imagen para análisis con IA.
 * Usa el endpoint real: POST /analysis/upload-ia
 */
export async function uploadAnalysis(patientId, file) {
  const formData = new FormData();
  formData.append("id_user", String(patientId)); // nombre EXACTO que espera FastAPI
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/analysis/upload-ia`, {
    method: "POST",
    headers: {
      // No pongas Content-Type, fetch lo agrega solo para FormData
      ...getAuthHeaders(),
    },
    body: formData,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Respuesta no JSON de uploadAnalysis:", text);
    throw new Error("Respuesta inválida del servidor");
  }

  if (!res.ok) {
    console.error("uploadAnalysis error:", data);
    throw new Error(data.detail || "Error al analizar la imagen");
  }

  // Puedes adaptar la respuesta si quieres, por ahora devolvemos tal cual
  return data;
}

function url(path) {
    return `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}


/**
 * Obtiene la lista de análisis de un paciente.
 * Si aún no tienes endpoint GET /analysis, por ahora devolvemos un array vacío.
 */
 export async function fetchAnalyses(patientId) {
  const API_BASE = "http://127.0.0.1:8000/"; // asegúrate que lleva / al final
  const url = `${API_BASE}analysis/user/${patientId}`;
  console.log("fetchAnalyses ->", url);

  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const text = await res.text();
  console.log("fetchAnalyses status:", res.status, "body:", text);

  if (!res.ok) {
    throw new Error("No se pudieron cargar los análisis");
  }

  const data = JSON.parse(text);
  return data.map(mapAnalysisFromApi);
}



/**
 * Convierte el objeto que devuelve backend (AnalysisOut)
 * a uno que pueda mostrar AnalysisList de forma sencilla.
 */

function mapAnalysisFromApi(apiAnalysis) {
  const stateId = apiAnalysis.id_state_analysis || apiAnalysis.id_state || 1;

  let statusLabel = "Pendiente de revisión";
  if (stateId === 2) {
    statusLabel = "Revisado por el médico";
  }

  return {
    id: apiAnalysis.id_analysis || apiAnalysis.id,
    id_analysis: apiAnalysis.id_analysis,
    id_user: apiAnalysis.id_user,
    date: apiAnalysis.date || apiAnalysis.created_at,
    // Estado
    stateId,
    statusLabel,
    // Datos médicos
    result_ia: apiAnalysis.result_ia,
    observation_doctor: apiAnalysis.observation_doctor,
    confidence: apiAnalysis.confidence,
    // Ruta de la imagen en el servidor
    url_image: apiAnalysis.url_image,
    raw: apiAnalysis
  };
}


