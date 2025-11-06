const API_URL = "http://127.0.0.1:8000/state_analysis";

// Listar estados de análisis
export async function listStateAnalysis() {
  try {
    const res = await fetch(`${API_URL}/`);
    if (!res.ok) throw new Error("Error al cargar estados de análisis");
    return await res.json(); // [{ id_state_analysis, state_name, state }]
  } catch (err) {
    console.error("listStateAnalysis error:", err);
    return [];
  }
}
