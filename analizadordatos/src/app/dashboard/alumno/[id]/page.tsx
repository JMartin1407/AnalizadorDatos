// src/app/dashboard/alumno/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Alumno, MATERIAS } from '@/lib/analytics';
import MetricCard from '@/components/MetricCard'; // Componente asumido
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';

// Registro de los componentes de Chart.js necesarios para el gráfico de radar
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- Hook para Obtener Datos de Almacenamiento Local (CORREGIDO Y ROBUSTO) ---
const useStudentData = (id: string | number): { alumno: Alumno | undefined, isLoading: boolean } => {
    const [allData, setAllData] = useState<Alumno[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Obtiene los datos del almacenamiento local de forma asíncrona y con retardo de seguridad
    useEffect(() => {
        // Usamos setTimeout para esperar a que el DOM y localStorage estén listos (100ms)
        const timer = setTimeout(() => {
            const storedData = localStorage.getItem('analisisData');
            
            if (storedData) {
                try {
                    setAllData(JSON.parse(storedData));
                } catch (e) {
                    console.error("Error al parsear datos de localStorage:", e);
                }
            }
            setIsLoading(false);
        }, 100); 

        return () => clearTimeout(timer); // Función de limpieza
    }, []);

    // 2. Encuentra el alumno basado en el ID (Asegurando la comparación de tipo number)
    const alumno = useMemo(() => {
        if (!allData || allData.length === 0) return undefined;
        // CORRECCIÓN: Convierte el ID de la URL (string) a número entero para la búsqueda
        const targetId = parseInt(String(id)); 
        return allData.find(a => a.id === targetId);
    }, [id, allData]);

    return { alumno, isLoading };
};
// -----------------------------------------------------------------------------------------

const StudentDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const router = useRouter();
    const { alumno, isLoading } = useStudentData(params.id);
    
    // Estado de Carga
    if (isLoading) {
        return <div className="p-8 text-center text-blue-500 text-xl">Cargando datos de análisis...</div>;
    }

    // Error de Alumno No Encontrado
    if (!alumno) {
        return (
            <div className="p-8 text-center text-red-700">
                <h2 className="text-2xl font-bold mb-3">⚠️ Error: Alumno no encontrado (ID: {params.id})</h2>
                <p>Verifique que el archivo de datos haya sido cargado correctamente en el Dashboard.</p>
                <button 
                    onClick={() => router.push('/dashboard')} 
                    className="mt-4 text-blue-600 underline font-medium"
                >
                    &larr; Volver al Dashboard Grupal y cargar datos
                </button>
            </div>
        );
    }

    // --- CÓDIGO DE VISUALIZACIÓN ---
    const radarData = {
        labels: MATERIAS,
        datasets: [
            {
                label: 'Calificación',
                data: MATERIAS.map(m => alumno.detalle_materias[m]?.calificacion || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.4)',
                borderColor: 'rgba(75, 192, 192, 1)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            },
            {
                label: 'Consistencia (Asistencia/Conducta Media)',
                data: MATERIAS.map(m => (alumno.detalle_materias[m].asistencia + alumno.detalle_materias[m].conducta) / 2 || 0),
                backgroundColor: 'rgba(255, 99, 132, 0.4)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            }
        ]
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 50,
                suggestedMax: 100,
                pointLabels: { font: { size: 12 } }
            }
        },
        plugins: { legend: { display: true } }
    };

    return (
        <div className="p-8 space-y-6">
            <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">&larr; Volver al Dashboard Grupal</button>
            
            <h1 className="text-3xl font-bold text-blue-700">Análisis Detallado: {alumno.nombre}</h1>

            {/* Métrica de Riesgo y Vectorial (Global) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard titulo="Riesgo de Caída" valor={`${(alumno.probabilidad_riesgo * 100).toFixed(1)}%`} />
                <MetricCard titulo="Desviación Vectorial" valor={alumno.vector_magnitud.toFixed(2)} />
                <MetricCard titulo="Promedio Gral" valor={alumno.promedio_gral_calificacion.toFixed(2)} />
                <MetricCard titulo="Área de Progreso" valor={alumno.area_de_progreso.toFixed(2)} />
            </div>

            {/* Gráfico de Radar (Vectorial por Materia) */}
            <h2 className="text-2xl font-semibold mt-6">Rendimiento Vectorial por Materia (Polar Chart)</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-center">
                <div style={{ width: '800px', height: '600px' }}>
                    <Radar data={radarData} options={radarOptions} />
                </div>
            </div>

            {/* Recomendaciones Pedagógicas */}
            <div className="bg-yellow-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-3">
                    💡 Recomendación Específica:
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                    {alumno.recomendacion_pedagogica}
                </p>
            </div>
        </div>
    );
};

export default StudentDetailPage;