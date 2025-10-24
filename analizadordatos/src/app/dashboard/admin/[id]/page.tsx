// src/app/dashboard/docente/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Alumno, MATERIAS, UserRole } from '@/lib/analytics';
import MetricCard from '@/components/MetricCard';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- LÓGICA DE TRADUCCIÓN (Docente: LENGUAJE PEDAGÓGICO) ---
const translateRecommendation = (recommendation: string) => {
    // El docente ve el texto original del backend para la intervención
    return recommendation; 
};

// --- HOOK DE DATOS Y LÓGICA DE CARGA (Permite acceso a Docente Y Admin) ---
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
        // Permite la carga del alumno si el rol es Docente o Admin
        if (userRole === 'Docente' || userRole === 'Admin') {
            return allData.find(a => a.id === targetId);
        }
        return undefined; 
    }, [id, allData, userRole]);

    return { alumno, isLoading, userRole };
};

// -----------------------------------------------------------------------------------------

const DocenteDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const router = useRouter();
    const { alumno, isLoading, userRole } = useStudentData(params.id);
    
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-blue-600">Cargando datos para gestión...</div></div>;
    
    // REGLA CORREGIDA: Acceso permitido si es Docente O Admin
    const canAccess = userRole === 'Docente' || userRole === 'Admin';

    if (!canAccess) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-8 text-center bg-white rounded-xl shadow-lg border-t-4 border-red-600">
                    <h2 className="text-2xl font-bold mb-3 text-red-700">⚠️ Acceso Denegado (Ruta de Docente)</h2>
                    <p className="text-gray-600">Esta vista es exclusiva para Docentes y Supervisión Administrativa.</p>
                    <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 underline font-medium">&larr; Volver al Dashboard Grupal</button>
                </div>
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
            { label: 'Calificación', data: MATERIAS.map(m => alumno.detalle_materias[m]?.calificacion || 0), backgroundColor: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 1)', borderWidth: 2 },
            { label: 'Consistencia (A/C Media)', data: MATERIAS.map(m => (alumno.detalle_materias[m].asistencia + alumno.detalle_materias[m].conducta) / 2 || 0), backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 2 }
        ]
    };
    const radarOptions = { 
        responsive: true,
        plugins: { legend: { display: true, position: 'bottom' } },
        scales: { 
            r: { angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' }, suggestedMin: 50, suggestedMax: 100, 
                 pointLabels: { font: { size: 12, weight: 'bold' } }, grid: { color: 'rgba(0, 0, 0, 0.1)' } 
            } 
        } 
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md border-b-4 border-blue-600">
                    <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium transition">&larr; Volver a la Lista Grupal</button>
                    <h1 className="text-3xl font-extrabold text-blue-700">Intervención Pedagógica: {alumno.nombre}</h1>
                    <LogoutButton />
                </header>

                {/* Métrica TÉCNICA (Necesario para la intervención) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard titulo="Riesgo de Caída (NN)" valor={`${(alumno.probabilidad_riesgo * 100).toFixed(1)}%`} />
                    <MetricCard titulo="Desviación Vectorial" valor={alumno.vector_magnitud.toFixed(2)} />
                    <MetricCard titulo="Promedio Gral" valor={alumno.promedio_gral_calificacion.toFixed(2)} />
                    <MetricCard titulo="Área de Progreso" valor={alumno.area_de_progreso.toFixed(2)} />
                </div>

                {/* Gráfico de Radar (Gráfico Vectorial por Materia) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Rendimiento por Materia (Gráfico Vectorial)</h2>
                    <div className="flex justify-center">
                        <div style={{ width: '90%', maxWidth: '800px', height: '600px' }}>
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    </div>
                </div>

                {/* Recomendaciones PEDAGÓGICAS (Consejos para la intervención) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-800 mb-3">
                        💡 Consejos para la Intervención Pedagógica:
                    </h3>
                    <p className="whitespace-pre-line text-gray-700">{translatedRecommendation}</p>
                </div>
            </div>
        </div>
    );
};

export default DocenteDetailPage;