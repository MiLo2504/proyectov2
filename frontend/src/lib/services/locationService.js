// src/lib/services/locationService.js

const API_URL = "https://mysql-130f1eb7-moisessolis-5a83.c.aivencloud.com:3000";

// Obtener todos los departamentos
export async function fetchDepartments() {
  try {
    const res = await fetch(`${API_URL}/departments`);
    if (!res.ok) throw new Error("Error al cargar departamentos");
    return await res.json();
  } catch (err) {
    console.error("fetchDepartments error:", err);
    return [];
  }
}

// Obtener ciudades de un departamento
export async function fetchCities(departmentId) {
  try {
    const res = await fetch(`${API_URL}/departments/${departmentId}/cities`);
    if (!res.ok) throw new Error("Error al cargar ciudades");
    return await res.json();
  } catch (err) {
    console.error("fetchCities error:", err);
    return [];
  }
}

// Obtener clínicas de una ciudad
export async function fetchClinics(cityId) {
  try {
    const res = await fetch(`${API_URL}/cities/${cityId}/clinics`);
    if (!res.ok) throw new Error("Error al cargar clínicas");
    return await res.json();
  } catch (err) {
    console.error("fetchClinics error:", err);
    return [];
  }
}

// Obtener una clínica por ID
export async function fetchClinicById(clinicId) {
  try {
    const res = await fetch(`${API_URL}/clinics/${clinicId}`);
    if (!res.ok) throw new Error("Error al cargar clínica");
    return await res.json();
  } catch (err) {
    console.error("fetchClinicById error:", err);
    return null;
  }
}

// Obtener doctores de una clínica
export async function fetchDoctorsByClinic(clinicId) {
  try {
    const res = await fetch(`${API_URL}/clinics/${clinicId}/doctors`);
    if (!res.ok) throw new Error("Error al cargar doctores");
    return await res.json();
  } catch (err) {
    console.error("fetchDoctorsByClinic error:", err);
    return [];
  }
}
