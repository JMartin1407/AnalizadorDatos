// src/app/dashboard/padre/[id]/page.tsx
'use client';

export function generateStaticParams() {
  return [];
}

import React, { useState, useEffect, useMemo } from 'react';
import { Alumno, MATERIAS, UserRole } from '@/lib/analytics';
import MetricCard from '@/components/MetricCard';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { Button, Box } from '@mui/material';
import { School, People, PersonOutline, SecurityOutlined } from '@mui/icons-material';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- LÓGICA DE TRADUCCIÓN (LENGUAJE ÉTICO Y DE APOYO - PADRE/TUTOR) ---

const translateRecommendation = (recommendation: string) => {
    // Traducción estricta para PADRE/TUTOR (Lenguaje sensible)
    return recommendation
        .replace(/RIESGO INMINENTE/g, '🛑 ATENCIÓN URGENTE. Su hijo/a necesita apoyo inmediato.')
        .replace(/DESVIACIÓN CRÍTICA/g, 'El desempeño actual requiere supervisión. Enfoque en:')
        .replace(/INCONSTANTE/g, 'El progreso es irregular. Requiere motivación para ser constante.')
        .replace(/Acciones:/g, 'Sugerencias de Apoyo Familiar:')
        .replace(/Tutoría focalizada/g, 'sesiones de refuerzo escolar');
};

// --- HOOK DE DATOS Y LÓGICA DE CARGA (Se mantiene el hook robusto) ---
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
        
        // Admin puede ver cualquier alumno por ID
        if (userRole === 'Admin') {
            return allData.find(a => a.id === targetId);
        }
        
        // El Padre/Tutor solo ve su propia información (filtrado por token/ID)
        if (userRole === 'Padre') {
            const token = localStorage.getItem('authToken');
            if (token) {
                const alumnoBuscado = allData.find(a => a.nombre.toLowerCase().includes(token.split('@')[0].toLowerCase() || 'XX'));
                if (alumnoBuscado && alumnoBuscado.id === targetId) return alumnoBuscado;
            }
        }
        
        return undefined;
    }, [id, allData, userRole]);

    return { alumno, isLoading, userRole };
};

// -----------------------------------------------------------------------------------------

const ParentDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const router = useRouter();
    const { alumno, isLoading, userRole } = useStudentData(params.id);
    
    if (isLoading) return <div className="p-8 text-center text-blue-500 text-xl">Cargando Plan de Apoyo Familiar...</div>;
    
    // Acceso permitido para Padre y Admin
    const canAccess = userRole === 'Padre' || userRole === 'Admin';
    if (!canAccess) {
         return (
            <div className="p-8 text-center text-red-700">
                <h2 className="text-2xl font-bold mb-3">⚠️ Acceso Denegado</h2>
                <p>Esta vista es exclusiva para Padres y Administradores.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 underline font-medium">&larr; Volver al Dashboard</button>
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

    const radarOptions = { scales: { r: { angleLines: { display: true }, suggestedMin: 50, suggestedMax: 100, pointLabels: { font: { size: 12 } } }, }, plugins: { legend: { display: true } } };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '32px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="space-y-6">
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 1, borderBottom: '4px solid #9c27b0', mb: 3, gap: 3 }}>
                    <Button onClick={() => router.push('/dashboard')} variant="text" sx={{ color: '#9c27b0' }}>&larr; Volver</Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => router.push(`/dashboard/admin/${alumno.id}`)} variant="contained" startIcon={<SecurityOutlined />} sx={{ backgroundColor: '#d32f2f' }}>Vista Admin</Button>
                        <Button onClick={() => router.push(`/dashboard/docente/${alumno.id}`)} variant="contained" startIcon={<School />} sx={{ backgroundColor: '#1976d2' }}>Vista Docente</Button>
                        <Button onClick={() => router.push(`/dashboard/padre/${alumno.id}`)} variant="contained" startIcon={<People />} sx={{ backgroundColor: '#9c27b0' }}>Vista Padre</Button>
                        <Button onClick={() => router.push(`/dashboard/alumno/${alumno.id}`)} variant="contained" startIcon={<PersonOutline />} sx={{ backgroundColor: '#4caf50' }}>Vista Alumno</Button>
                    </Box>
                    <LogoutButton />
                </Box>

                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0', textAlign: 'center', mb: 3 }}>Plan de Apoyo Familiar: {alumno.nombre}</h1>

                {/* Métricas Globales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard titulo={"Nivel de Enfoque Necesario"} valor={`${(alumno.probabilidad_riesgo * 100).toFixed(1)}%`} />
                    <MetricCard titulo="Promedio Gral" valor={alumno.promedio_gral_calificacion.toFixed(2)} />
                    <MetricCard titulo="Área de Progreso" valor={alumno.area_de_progreso.toFixed(2)} />
                </div>

                {/* Gráfico de Radar (Visible para todos) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Rendimiento por Materia</h2>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '600px', height: '400px' }}>
                            <Radar data={radarData} options={{ ...radarOptions, responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>

                {/* Recomendaciones Pedagógicas / Consejos para Padres (LENGUAJE SENSIBLE) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-purple-800 mb-3">
                        💡 Intervención Sugerida:
                    </h3>
                    <p className="whitespace-pre-line text-gray-700">{translatedRecommendation}</p>
                </div>
            </div>
        </div>
    );
};

export default ParentDetailPage;