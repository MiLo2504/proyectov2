const API_URL = "http://127.0.0.1:8000/users"; // ⚠️ Ajusta si tu backend usa otro endpoint

// Obtener todos los usuarios
export async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    const data = await res.json();
    return data; // Debería ser un array de usuarios
  } catch (err) {
    console.error("fetchUsers error:", err);
    return [];
  }
}

// Crear un nuevo usuario
export async function createUser(userData) {
  try {
    // Normalizar valores que vienen desde el formulario: evitar enviar "" para campos opcionales
    const payload = {
      user_name: userData.user_name,
      password: userData.password,
      full_name: userData.full_name,
      last_name: userData.last_name || null,
      email: userData.email,
      // date_birth debe ser null si está vacío
      date_birth: userData.date_birth && userData.date_birth !== "" ? userData.date_birth : null,
      address: userData.address || null,
      phone: userData.phone || null,
      id_type_document:
        userData.id_type_document && userData.id_type_document !== "" ? Number(userData.id_type_document) : null,
      // num_document puede venir como string; convertir a número si es posible
      // num_document en el modelo backend es string opcional; enviar como string cuando exista
      num_document:
        userData.num_document && userData.num_document !== "" ? String(userData.num_document) : null,
      id_rol: userData.id_rol && userData.id_rol !== "" ? Number(userData.id_rol) : null,
      genero: userData.genero && userData.genero !== "" ? userData.genero : null,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => "");
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch (e) {
      // keep raw text
    }

    if (!res.ok) {
      console.error("createUser response error:", res.status, body);
      const err = new Error(body?.detail || body?.message || "Error al crear usuario");
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  } catch (err) {
    console.error("createUser error:", err);
    throw err;
  }
}

// Obtener un usuario por ID
export async function fetchUserById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Usuario no encontrado");
    return await res.json();
  } catch (err) {
    console.error("fetchUserById error:", err);
    return null;
  }
}

// Actualizar un usuario
export async function updateUser(user) {
  try {
    // Build payload: include password only if provided (avoid sending null which would clear it)
    const payload = {
      user_name: user.user_name,
      full_name: user.full_name,
      last_name: user.last_name || null,
      email: user.email,
      date_birth: user.date_birth && user.date_birth !== "" ? user.date_birth : null,
      address: user.address || null,
      phone: user.phone || null,
      id_type_document: user.id_type_document && user.id_type_document !== "" ? Number(user.id_type_document) : null,
  num_document: user.num_document && user.num_document !== "" ? String(user.num_document) : null,
      id_rol: user.id_rol && user.id_rol !== "" ? Number(user.id_rol) : null,
      genero: user.genero && user.genero !== "" ? user.genero : null,
    };

    if (user.password && user.password !== "") {
      payload.password = user.password;
    }

    console.log("updateUser payload:", payload);

    const res = await fetch(`${API_URL}/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => "");
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch (e) {
      // keep text
    }

    if (!res.ok) {
      console.error("updateUser response error:", res.status, body);
      const err = new Error(body?.detail || body?.message || "Error al actualizar usuario");
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  } catch (err) {
    console.error("updateUser error:", err);
    return null;
  }
}

// Eliminar usuario (opcional)
export async function deleteUser(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar usuario");
    return true;
  } catch (err) {
    console.error("deleteUser error:", err);
    return false;
  }
}
