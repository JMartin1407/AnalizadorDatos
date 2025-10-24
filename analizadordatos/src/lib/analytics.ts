// src/lib/analytics.ts

// 1. Lista de todas las materias
export const MATERIAS = [
    "Español", "Ingles", "Matematicas", "Artes", "Formacion_Civica_y_Etica", 
    "Historia", "Educacion_Fisica", "Quimica", "Tecnologia"
];

// 2. Definición de la estructura de datos para una materia
export interface MateriaMetricas {
    calificacion: number;
    asistencia: number;
    conducta: number;
}

// 3. Tipos de Permisos de Usuario (Roles)
export type UserRole = "Admin" | "Docente" | "Alumno" | "Padre";

// 4. Interfaz Alumno (Datos individuales y consolidados)
export interface Alumno {
    id: number;
    nombre: string;
    
    // Métricas CONSOLIDADAS (Usadas para el Análisis Vectorial Global)
    promedio_gral_calificacion: number;
    promedio_gral_asistencia: number;
    promedio_gral_conducta: number;

    // Métricas DETALLADAS por materia
    detalle_materias: Record<string, MateriaMetricas>; 

    // Métricas Individuales de Python
    area_de_progreso: number; 
    probabilidad_riesgo: number; 
    recomendacion_pedagogica: string; 
    vector_magnitud: number; // Cálculo Vectorial
    materia_critica_temprana: string; // Falla detectada por la Red Neuronal
}

// 5. Interfaces de Métricas Grupales
export interface Correlaciones {
    asistencia_vs_calificacion: number;
    conducta_vs_calificacion: number;
}

export interface GrupoEstadistica {
    std_promedio: number;
    std_asistencia: number;
    std_conducta: number;
}

export interface BackendMetrics {
    area_de_progreso_grupo: number;
    promedio_general: number;
    correlaciones: Correlaciones;
    estadistica_grupal: GrupoEstadistica;
}

// --- Funciones de Lógica de Frontend ---

export interface Resumen { promedio: number; asistencia: number; conducta: number; }

export const detectarRiesgo = (alumnos: Alumno[]): Alumno[] => {
    return alumnos.filter((a) => a.promedio_gral_calificacion < 70 || a.promedio_gral_asistencia < 80 || a.promedio_gral_conducta < 75);
};

// export const calcularTendencia = (alumnos: Alumno[]): string => {
//     if (alumnos.length < 2) return "No hay suficientes datos para tendencia";
//     const pga = alumnos.reduce((sum, a) => sum + a.promedio_gral_calificacion, 0) / alumnos.length;
//     if (pga > 85) return "📈 Tendencia positiva";
//     if (pga < 75) return "📉 Tendencia negativa";
//     return "➡️ Tendencia estable";
// };

// // Esta función es la que estaba causando la confusión: debe usar Alumno[]
 export const resumenGeneral = (alumnos: Alumno[]): Resumen => {
     const n = alumnos.length;
     if (n === 0) return { promedio: 0, asistencia: 0, conducta: 0 };
    
    const promedio = alumnos.reduce((a, b) => a + b.promedio_gral_calificacion, 0) / n;
    const asistencia = alumnos.reduce((a, b) => a + b.promedio_gral_asistencia, 0) / n;
    const conducta = alumnos.reduce((a, b) => a + b.promedio_gral_conducta, 0) / n;
    
    return { promedio, asistencia, conducta };
};