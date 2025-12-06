// src/app/dashboard/view/page.tsx
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alumno, MATERIAS, UserRole } from '@/lib/analytics';
import MetricCard from '@/components/MetricCard';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import LogoutButton from '@/components/LogoutButton';
import { Button, Box } from '@mui/material';
import { School, People, PersonOutline, SecurityOutlined } from '@mui/icons-material';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- LÓGICA DE TRADUCCIÓN SEGÚN ROL ---
const getTranslatedRecommendation = (recommendation: string, role: UserRole | null) => {
    if (role === 'Alumno') {
        return recommendation
            .replace(/RIESGO INMINENTE/g, '¡ALERTA! Necesitas un impulso urgente para evitar problemas en tus notas.')
            .replace(/DESVIACIÓN CRÍTICA/g, 'Estás a tiempo de corregir el rumbo. Concéntrate en estas Áreas Clave:')
            .replace(/INCONSTANTE/g, 'Tú puedes ser más constante. ¡Sé disciplinado!')
            .replace(/Acciones:/g, 'Mi Plan de Foco:')
            .replace(/Tutoría focalizada/g, 'ayuda extra')
            + " ¡Tú puedes lograr un gran avance!";
    } else if (role === 'Padre') {
        return recommendation
            .replace(/RIESGO INMINENTE/g, '🛑 ATENCIÓN URGENTE. Su hijo/a necesita apoyo inmediato.')
            .replace(/DESVIACIÓN CRÍTICA/g, 'El desempeño actual requiere supervisión. Enfoque en:')
            .replace(/INCONSTANTE/g, 'El progreso es irregular. Requiere motivación para ser constante.')
            .replace(/Acciones:/g, 'Sugerencias de Apoyo Familiar:')
            .replace(/Tutoría focalizada/g, 'sesiones de refuerzo escolar');
    }
    // Docente y Admin ven el texto original
    return recommendation;
};

// --- HOOK DE DATOS ---
const useStudentData = (id: string | null, role: UserRole | null): { alumno: Alumno | undefined, isLoading: boolean } => {
    const [allData, setAllData] = useState<Alumno[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            const storedData = localStorage.getItem('analisisData');
            if (storedData) {
                try { 
                    setAllData(JSON.parse(storedData)); 
                } catch (e) { 
                    console.error("Error al parsear datos:", e); 
                }
            }
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const alumno = useMemo(() => {
        if (!allData || allData.length === 0 || !id) return undefined;
        const targetId = parseInt(id);
        
        if (role === 'Alumno') {
            return allData.find(a => a.id === targetId);
        } else if (role === 'Padre') {
            return allData.find(a => a.id === targetId);
        } else if (role === 'Docente' || role === 'Admin') {
            return allData.find(a => a.id === targetId);
        }
        return undefined;
    }, [id, allData, role]);

    return { alumno, isLoading };
};

// --- COMPONENTE PRINCIPAL ---
function DashboardViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const roleParam = searchParams.get('role') as UserRole | null;
    
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole') as UserRole | null;
        setUserRole(storedRole);
        
        // Validar que el rol coincida (comparar en minúsculas)
        if (roleParam && storedRole && roleParam.toLowerCase() !== storedRole.toLowerCase()) {
            router.push('/');
        }
    }, [roleParam, router]);

    const { alumno, isLoading } = useStudentData(id, userRole);

    const goBack = () => {
        if (userRole) {
            router.push(`/dashboard/${userRole.toLowerCase()}`);
        } else {
            router.push('/');
        }
    };

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                fontFamily: 'Inter, sans-serif'
            }}>
                <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Cargando datos...</p>
            </div>
        );
    }

    if (!alumno) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                fontFamily: 'Inter, sans-serif',
                gap: '1rem'
            }}>
                <p style={{ fontSize: '1.2rem', color: '#ef4444' }}>Alumno no encontrado</p>
                <Button variant="contained" onClick={goBack}>Volver al Dashboard</Button>
            </div>
        );
    }

    // Configuración del gráfico Radar
    const radarData = {
        labels: MATERIAS,
        datasets: [{
            label: 'Calificaciones',
            data: MATERIAS.map(m => alumno.detalle_materias?.[m]?.calificacion || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        }]
    };

    const radarOptions = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 20 }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <Button 
                    variant="outlined" 
                    onClick={goBack}
                    sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    ← Volver
                </Button>
                <LogoutButton />
            </Box>

            {/* Título con icono de rol */}
            <div style={{ 
                textAlign: 'center', 
                color: 'white', 
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    {userRole === 'Alumno' && <PersonOutline sx={{ fontSize: 40 }} />}
                    {userRole === 'Padre' && <People sx={{ fontSize: 40 }} />}
                    {userRole === 'Docente' && <School sx={{ fontSize: 40 }} />}
                    {userRole === 'Admin' && <SecurityOutlined sx={{ fontSize: 40 }} />}
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                        {alumno.nombre}
                    </h1>
                </div>
                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.9 }}>
                    Vista de {userRole}
                </p>
            </div>

            {/* Métricas */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <MetricCard
                    title="Promedio General"
                    value={alumno.promedio_general.toFixed(2)}
                    color="#10b981"
                />
                <MetricCard
                    title="Nivel de Riesgo"
                    value={alumno.nivel_riesgo}
                    color={alumno.nivel_riesgo === 'CRÍTICO' ? '#ef4444' : alumno.nivel_riesgo === 'MODERADO' ? '#f59e0b' : '#10b981'}
                />
                <MetricCard
                    title="Tendencia"
                    value={alumno.tendencia}
                    color={alumno.tendencia === 'Descendente' ? '#ef4444' : alumno.tendencia === 'Estable' ? '#f59e0b' : '#10b981'}
                />
            </div>

            {/* Gráfico y Recomendaciones */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem'
            }}>
                {/* Gráfico Radar */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Rendimiento por Materia</h2>
                    <Radar data={radarData} options={radarOptions} />
                </div>

                {/* Recomendaciones */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recomendaciones</h2>
                    <div style={{ 
                        padding: '1rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.5rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        color: '#374151'
                    }}>
                        {getTranslatedRecommendation(alumno.recomendaciones, userRole)}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- WRAPPER CON SUSPENSE ---
export default function DashboardView() {
    return (
        <Suspense fallback={
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                fontFamily: 'Inter, sans-serif'
            }}>
                <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Cargando...</p>
            </div>
        }>
            <DashboardViewContent />
        </Suspense>
    );
}
