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
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error("Error al crear usuario");

    const createdUser = await res.json();
    return createdUser;
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
    const res = await fetch(`${API_URL}/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("Error al actualizar usuario");
    return await res.json();
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
