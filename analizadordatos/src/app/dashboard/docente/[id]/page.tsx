// src/app/dashboard/docente/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Alumno, MATERIAS, UserRole } from '@/lib/analytics';
import MetricCard from '@/components/MetricCard';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- LÓGICA DE TRADUCCIÓN (Docente: LENGUAJE PEDAGÓGICO) ---
const translateRecommendation = (recommendation: string) => {
    // El docente ve el texto original del backend para la intervención
    return recommendation; 
};

// --- HOOK DE DATOS Y LÓGICA DE CARGA (Permiso: Docente) ---
const useStudentData = (id: string | number): { alumno: Alumno | undefined, isLoading: boolean, userRole: UserRole | null } => {
    const [allData, setAllData] = useState<Alumno[]>([]);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem('userRole') as UserRole | null;
        setUserRole(role);
        
        const timer = setTimeout(() => {
            const storedData = localStorage.getItem('analisisData');
            if (storedData) {
                try { setAllData(JSON.parse(storedData)); } catch (e) { console.error("Error al parsear datos:", e); }
            }
            setIsLoading(false);
        }, 100); 
        return () => clearTimeout(timer);
    }, []);

    const alumno = useMemo(() => {
        if (!allData || allData.length === 0) return undefined;
        const targetId = parseInt(String(id)); 
        // Docente solo puede ver por ID
        if (userRole === 'Docente') {
            return allData.find(a => a.id === targetId);
        }
        // Admin, Alumno, Padre no deben pasar este filtro
        return undefined; 
    }, [id, allData, userRole]);

    return { alumno, isLoading, userRole };
};

// -----------------------------------------------------------------------------------------

const DocenteDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const router = useRouter();
    const { alumno, isLoading, userRole } = useStudentData(params.id);
    
    if (isLoading) return <div className="p-8 text-center text-blue-500 text-xl">Cargando datos para gestión...</div>;
    
    // Bloqueo estricto: Solo Docente puede ver esta ruta.
    if (!userRole || userRole !== 'Docente') {
         return (
            <div className="p-8 text-center text-red-700">
                <h2 className="text-2xl font-bold mb-3">⚠️ Acceso Denegado (Ruta de Docente)</h2>
                <p>Esta vista es exclusiva para Docentes. El Admin usa la ruta de Supervisión.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 underline font-medium">&larr; Volver al Dashboard Grupal</button>
            </div>
        );
    }
    
    if (!alumno) { 
        return <div className="p-8 text-center text-red-700">Alumno no encontrado en la carga actual.</div>;
    }
    
    const translatedRecommendation = translateRecommendation(alumno.recomendacion_pedagogica);

    const radarData = {
        labels: MATERIAS,
        datasets: [
            { label: 'Calificación', data: MATERIAS.map(m => alumno.detalle_materias[m]?.calificacion || 0), backgroundColor: 'rgba(75, 192, 192, 0.4)', borderColor: 'rgba(75, 192, 192, 1)' },
            { label: 'Consistencia (A/C Media)', data: MATERIAS.map(m => (alumno.detalle_materias[m].asistencia + alumno.detalle_materias[m].conducta) / 2 || 0), backgroundColor: 'rgba(255, 99, 132, 0.4)', borderColor: 'rgba(255, 99, 132, 1)' }
        ]
    };
    const radarOptions = { scales: { r: { angleLines: { display: true }, suggestedMin: 50, suggestedMax: 100, pointLabels: { font: { size: 12 } } } }, plugins: { legend: { display: true } } };

    return (
        <div className="p-8 space-y-6">
            <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline mb-4">&larr; Volver al Dashboard Grupal</button>
            
            <h1 className="3xl font-bold text-blue-700">Intervención Pedagógica: {alumno.nombre}</h1>

            {/* Métrica TÉCNICA (Necesario para la intervención) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard titulo="Riesgo de Caída (NN)" valor={`${(alumno.probabilidad_riesgo * 100).toFixed(1)}%`} />
                <MetricCard titulo="Desviación Vectorial" valor={alumno.vector_magnitud.toFixed(2)} />
                <MetricCard titulo="Promedio Gral" valor={alumno.promedio_gral_calificacion.toFixed(2)} />
                <MetricCard titulo="Área de Progreso" valor={alumno.area_de_progreso.toFixed(2)} />
            </div>

            {/* Gráfico de Radar (Gráfico Vectorial por Materia) */}
            <h2 className="text-2xl font-semibold mt-6">Rendimiento por Materia (Gráfico Vectorial)</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-center">
                <div style={{ width: '800px', height: '600px' }}>
                    <Radar data={radarData} options={radarOptions} />
                </div>
            </div>

            {/* Recomendaciones PEDAGÓGICAS (Consejos para la intervención) */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-3">
                    💡 Consejos para la Intervención Pedagógica:
                </h3>
                <p className="whitespace-pre-line">{translatedRecommendation}</p>
            </div>
            
        </div>
    );
};

export default DocenteDetailPage;