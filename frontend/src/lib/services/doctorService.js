export async function fetchPatients() {
  // Reemplaza con API real
  return [
    { id: 1, nombre: "Sofía Rodríguez", edad: 32, genero: "Femenino", estado: "Activo" },
    { id: 2, nombre: "Carlos Pérez", edad: 45, genero: "Masculino", estado: "Activo" },
    { id: 3, nombre: "Ana García", edad: 28, genero: "Femenino", estado: "Inactivo" },
    { id: 4, nombre: "Luis Martínez", edad: 50, genero: "Masculino", estado: "Activo" },
    { id: 5, nombre: "Elena Sánchez", edad: 35, genero: "Femenino", estado: "Activo" },
  ];
}

export async function fetchPatientById(id) {
  // Simulación; reemplaza con API real
  return {
    nombre: "Luis Rodríguez",
    id: "P-73648",
    edad: 32,
    genero: "Masculino",
    email: "Luisr.@gmail.com",
    ultimaVisita: "2024-04-15",
  };
}

export async function fetchAnalysesByPatientId(id) {
  // Simulación; reemplaza con API real
  return [
    { metrica: "Glucosa", resultado: "110 mg/dL", rango: "70-100 mg/dL", interpretacion: "Ligeramente alto", color: "text-warning" },
    { metrica: "Colesterol", resultado: "220 mg/dL", rango: "< 200 mg/dL", interpretacion: "Alto", color: "text-danger" },
    { metrica: "Presión Arterial", resultado: "130/85 mmHg", rango: "< 120/80 mmHg", interpretacion: "Presión alta Etapa 1", color: "text-warning" },
    { metrica: "Ritmo Cardíaco", resultado: "75 bpm", rango: "60-100 bpm", interpretacion: "Normal", color: "text-success" },
  ];
}