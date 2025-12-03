// src/app/dashboard/alumno/[id]/page.tsx
'use client';

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

// --- LÓGICA DE TRADUCCIÓN (LENGUAJE MOTIVACIONAL - ALUMNO) ---
const translateRecommendation = (recommendation: string) => {
    return recommendation
        .replace(/RIESGO INMINENTE/g, '¡ALERTA! Necesitas un impulso urgente para evitar problemas en tus notas.')
        .replace(/DESVIACIÓN CRÍTICA/g, 'Estás a tiempo de corregir el rumbo. Concéntrate en estas Áreas Clave:')
        .replace(/INCONSTANTE/g, 'Tú puedes ser más constante. ¡Sé disciplinado!')
        .replace(/Acciones:/g, 'Mi Plan de Foco:')
        .replace(/Tutoría focalizada/g, 'ayuda extra')
        + " ¡Tú puedes lograr un gran avance!";
};

// --- HOOK DE DATOS Y LÓGICA DE CARGA (CORRECCIÓN CRÍTICA DE IDENTIFICACIÓN) ---
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
        
        if (userRole === 'Alumno') {
            const token = localStorage.getItem('authToken');
            if (token) {
                // 1. Derivar el nombre de usuario del token (Ej: "Andrea@email.com" -> "andrea")
                const usernameFromToken = token.split('@')[0].toLowerCase().replace('.', ' '); // Reemplaza puntos por espacio para mejor coincidencia

                // 2. Buscar el alumno en la lista cuyo nombre contiene el fragmento del token.
                // Esta es la validación de identidad.
                const alumnoDeSesion = allData.find(a => 
                    a.nombre.toLowerCase().includes(usernameFromToken)
                );
                
                // 3. Verificación de seguridad y coincidencia de URL:
                // Solo devuelve el alumno si fue encontrado Y su ID coincide con el ID de la URL
                if (alumnoDeSesion && alumnoDeSesion.id === targetId) {
                    return alumnoDeSesion;
                }
            }
        }
        
        // Para Admin/Maestro, simplemente buscamos el alumno por ID sin validación de token
        if (userRole !== 'Alumno') {
             return allData.find(a => a.id === targetId);
        }

        return undefined; // Bloqueo si no se encuentra o no coincide la identidad/rol
    }, [id, allData, userRole]);

    return { alumno, isLoading, userRole };
};

// -----------------------------------------------------------------------------------------

const StudentDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const router = useRouter();
    const { alumno, isLoading, userRole } = useStudentData(params.id);
    
    // Bloqueo y Redirección
    if (isLoading) return <div className="p-8 text-center text-blue-500 text-xl">Cargando Plan de Mejora...</div>;
    
    // Bloqueo estricto: Si no es Alumno (o no tiene rol), se le deniega.
    if (!userRole) {
         return (
            <div className="p-8 text-center text-red-700">
                <h2 className="text-2xl font-bold mb-3">⚠️ Sesión Inválida</h2>
                <p>Por favor, inicie sesión.</p>
                <button onClick={() => router.push('/')} className="mt-4 text-blue-600 underline font-medium">&larr; Volver al Login</button>
            </div>
        );
    }

    // Si es Alumno, y no se encuentra, es porque la identidad no coincide.
    if (userRole === 'Alumno' && !alumno) { 
        return <div className="p-8 text-center text-red-700">Alumno no encontrado o datos de sesión incorrectos.</div>;
    }

    // Permitir a Admin/Maestro ver al alumno si existe.
    if (userRole !== 'Alumno' && !alumno) { 
         return <div className="p-8 text-center text-red-700">El Alumno con ID {params.id} no existe en la base de datos.</div>;
    }
    
    // Preparación de datos y traducción
    const translatedRecommendation = translateRecommendation(alumno!.recomendacion_pedagogica);

    const radarData = {
        labels: MATERIAS,
        datasets: [
            { label: 'Calificación', data: MATERIAS.map(m => alumno!.detalle_materias[m]?.calificacion || 0), backgroundColor: 'rgba(59, 130, 246, 0.4)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 2 },
            { label: 'Consistencia (A/C Media)', data: MATERIAS.map(m => (alumno!.detalle_materias[m].asistencia + alumno!.detalle_materias[m].conducta) / 2 || 0), backgroundColor: 'rgba(239, 68, 68, 0.4)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 2 }
        ]
    };

    const radarOptions = { scales: { r: { angleLines: { display: true }, suggestedMin: 50, suggestedMax: 100, pointLabels: { font: { size: 12, weight: 'bold' } }, grid: { color: 'rgba(0, 0, 0, 0.1)' } } }, plugins: { legend: { display: true, position: 'bottom' } } };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '32px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="space-y-6">
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 1, borderBottom: '4px solid #4caf50', mb: 3, gap: 3 }}>
                    <Button onClick={() => router.push('/dashboard')} variant="text" sx={{ color: '#4caf50' }}>&larr; Volver</Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => router.push(`/dashboard/admin/${alumno!.id}`)} variant="contained" startIcon={<SecurityOutlined />} sx={{ backgroundColor: '#d32f2f' }}>Vista Admin</Button>
                        <Button onClick={() => router.push(`/dashboard/docente/${alumno!.id}`)} variant="contained" startIcon={<School />} sx={{ backgroundColor: '#1976d2' }}>Vista Docente</Button>
                        <Button onClick={() => router.push(`/dashboard/padre/${alumno!.id}`)} variant="contained" startIcon={<People />} sx={{ backgroundColor: '#9c27b0' }}>Vista Padre</Button>
                        <Button onClick={() => router.push(`/dashboard/alumno/${alumno!.id}`)} variant="contained" startIcon={<PersonOutline />} sx={{ backgroundColor: '#4caf50' }}>Vista Alumno</Button>
                    </Box>
                    <LogoutButton />
                </Box>
                
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50', textAlign: 'center', mb: 3 }}>Mi Plan de Foco: {alumno!.nombre}</h1>
            
                {/* Métricas Globales (Lenguaje de Alumno) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard titulo={"Nivel de Enfoque Necesario"} valor={`${(alumno!.probabilidad_riesgo * 100).toFixed(1)}%`} />
                    <MetricCard titulo="Mi Promedio General" valor={alumno!.promedio_gral_calificacion.toFixed(2)} />
                    <MetricCard titulo="Mi Esfuerzo Constante" valor={alumno!.area_de_progreso.toFixed(2)} />
                </div>

                {/* Gráfico de Radar */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tu Desempeño por Materia</h2>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '600px', height: '400px' }}>
                            <Radar data={radarData} options={{ ...radarOptions, responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>

                {/* Consejos para Alumnos (LENGUAJE MOTIVACIONAL) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-green-700 mb-3">
                        🚀 ¡Vamos a mejorar!
                    </h3>
                    <p className="whitespace-pre-line text-gray-700">{translatedRecommendation}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailPage;