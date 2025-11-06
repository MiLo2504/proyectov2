const API_URL = "http://127.0.0.1:8000/analysis";

// Listar todos los análisis
export async function listAnalysis() {
  try {
    const res = await fetch(`${API_URL}/`);
    if (!res.ok) throw new Error("Error al obtener análisis");
    return await res.json();
  } catch (err) {
    console.error("listAnalysis error:", err);
    return [];
  }
}

// Obtener un análisis por ID (opcional)
export async function fetchAnalysisById(id) {
  try {
    const nid = Number(id);
    if (!Number.isFinite(nid)) {
      throw new Error("ID de análisis inválido");
    }
    const res = await fetch(`${API_URL}/${nid}`);
    if (!res.ok) throw new Error("Análisis no encontrado");
    return await res.json();
  } catch (err) {
    console.error("fetchAnalysisById error:", err);
    return null;
  }
}

// Actualizar solo la observación del doctor (opcional)
export async function updateAnalysisObservation(id, observation_doctor) {
  try {
    const res = await fetch(`${API_URL}/${id}/observation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observation_doctor })
    });
    if (!res.ok) throw new Error("Error al actualizar observación");
    return await res.json();
  } catch (err) {
    console.error("updateAnalysisObservation error:", err);
    return null;
  }
}
