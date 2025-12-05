// src/app/dashboard/docente/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radar, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { Alumno, MATERIAS } from '@/lib/analytics';
import { colorPalette } from '@/lib/theme';
import LogoutButton from '@/components/LogoutButton';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function DocenteViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [alumno, setAlumno] = useState<Alumno | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('authToken');
        const id = searchParams.get('id');

        if (!storedRole || !token) {
            router.push('/');
            return;
        }

        if (storedRole.toLowerCase() !== 'docente') {
            router.push('/dashboard');
            return;
        }

        const analisisData = localStorage.getItem('analisisData');
        if (analisisData && id) {
            try {
                const data: Alumno[] = JSON.parse(analisisData);
                const alumnoData = data.find(a => a.id === parseInt(id));
                setAlumno(alumnoData || null);
            } catch (e) {
                console.error('Error parsing data:', e);
            }
        }
        setLoading(false);
    }, [router, searchParams]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                <div className="text-xl text-blue-600">Cargando...</div>
            </div>
        );
    }

    if (!alumno) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                <div className="text-xl text-red-600">No se encontraron datos del estudiante</div>
            </div>
        );
    }

    const radarData = {
        labels: MATERIAS,
        datasets: [{
            label: 'Calificaciones',
            data: MATERIAS.map(m => alumno.detalle_materias?.[m]?.calificacion || 0),
            backgroundColor: colorPalette.primary3 + '40',
            borderColor: colorPalette.primary1,
            borderWidth: 2,
        }]
    };

    const barData = {
        labels: ['Calificación', 'Asistencia', 'Conducta'],
        datasets: [{
            label: 'Promedios',
            data: [
                alumno.promedio_gral_calificacion || 0,
                alumno.promedio_gral_asistencia || 0,
                alumno.promedio_gral_conducta || 0
            ],
            backgroundColor: [colorPalette.primary1, colorPalette.secondary1, colorPalette.accent1],
        }]
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.primary1 }}>
                            Evaluación Detallada - {alumno.nombre}
                        </h1>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            style={{ 
                                marginTop: '8px', 
                                padding: '8px 16px', 
                                backgroundColor: colorPalette.primary1, 
                                color: '#fff', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer' 
                            }}
                        >
                            ← Volver al Dashboard
                        </button>
                    </div>
                    <LogoutButton />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Promedio</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: colorPalette.primary1 }}>
                            {alumno.promedio_gral_calificacion?.toFixed(1) || 'N/A'}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Asistencia</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: colorPalette.secondary1 }}>
                            {alumno.promedio_gral_asistencia?.toFixed(1) || 'N/A'}%
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Conducta</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: colorPalette.accent1 }}>
                            {alumno.promedio_gral_conducta?.toFixed(1) || 'N/A'}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Riesgo</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: alumno.probabilidad_riesgo && alumno.probabilidad_riesgo > 0.5 ? '#ff6b6b' : '#51cf66' }}>
                            {alumno.probabilidad_riesgo !== undefined ? `${(alumno.probabilidad_riesgo * 100).toFixed(0)}%` : 'N/A'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                            Desempeño por Materia
                        </h2>
                        <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                            Indicadores Generales
                        </h2>
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, max: 100 } } }} />
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                        Análisis y Recomendaciones Pedagógicas
                    </h2>
                    <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>
                        {alumno.probabilidad_riesgo !== undefined && alumno.probabilidad_riesgo > 0.5 && (
                            <div style={{ padding: '16px', backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', marginBottom: '16px' }}>
                                <strong>⚠️ Alerta:</strong> Este estudiante presenta alta probabilidad de riesgo académico ({(alumno.probabilidad_riesgo * 100).toFixed(1)}%). 
                                Se recomienda intervención personalizada y seguimiento cercano.
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Área de progreso:</strong> {alumno.area_de_progreso !== undefined ? `${(alumno.area_de_progreso * 100).toFixed(1)}%` : 'N/A'}
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginTop: '16px' }}>
                            <strong>💡 Sugerencias:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                <li>Identificar materias con bajo rendimiento para refuerzo</li>
                                <li>Considerar estrategias de aprendizaje personalizado</li>
                                <li>Mantener comunicación con los padres/tutores</li>
                                <li>Monitorear asistencia y participación en clase</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DocenteView = () => {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                <div className="text-xl text-blue-600">Cargando...</div>
            </div>
        }>
            <DocenteViewContent />
        </Suspense>
    );
};

export default DocenteView;
