// src/app/dashboard/admin/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radar, Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ArcElement
} from 'chart.js';
import { Alumno, MATERIAS } from '@/lib/analytics';
import { colorPalette } from '@/lib/theme';
import LogoutButton from '@/components/LogoutButton';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ArcElement);

function AdminViewContent() {
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

        if (storedRole.toLowerCase() !== 'admin') {
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

    const doughnutData = {
        labels: ['Área de Progreso', 'Área Pendiente'],
        datasets: [{
            data: [
                alumno.area_de_progreso !== undefined ? alumno.area_de_progreso * 100 : 0,
                alumno.area_de_progreso !== undefined ? (1 - alumno.area_de_progreso) * 100 : 100
            ],
            backgroundColor: [colorPalette.secondary1, '#e0e0e0'],
        }]
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.primary1 }}>
                            Vista Administrativa - {alumno.nombre}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>ID Estudiante</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.primary4 }}>
                            {alumno.id}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Promedio</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.primary1 }}>
                            {alumno.promedio_gral_calificacion?.toFixed(1) || 'N/A'}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Asistencia</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.secondary1 }}>
                            {alumno.promedio_gral_asistencia?.toFixed(1) || 'N/A'}%
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Conducta</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.accent1 }}>
                            {alumno.promedio_gral_conducta?.toFixed(1) || 'N/A'}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Riesgo</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: alumno.probabilidad_riesgo && alumno.probabilidad_riesgo > 0.5 ? '#ff6b6b' : '#51cf66' }}>
                            {alumno.probabilidad_riesgo !== undefined ? `${(alumno.probabilidad_riesgo * 100).toFixed(0)}%` : 'N/A'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                            Calificaciones por Materia
                        </h2>
                        <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                            Indicadores Clave
                        </h2>
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, max: 100 } } }} />
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                            Progreso Académico
                        </h2>
                        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                        Análisis Completo del Estudiante
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '15px', color: '#666' }}>
                        <div>
                            <h3 style={{ fontWeight: 'bold', color: colorPalette.primary4, marginBottom: '12px' }}>Métricas Académicas</h3>
                            <p>Promedio General: <strong>{alumno.promedio_gral_calificacion?.toFixed(2) || 'N/A'}</strong></p>
                            <p>Promedio Asistencia: <strong>{alumno.promedio_gral_asistencia?.toFixed(2) || 'N/A'}%</strong></p>
                            <p>Promedio Conducta: <strong>{alumno.promedio_gral_conducta?.toFixed(2) || 'N/A'}</strong></p>
                            <p>Área de Progreso: <strong>{alumno.area_de_progreso !== undefined ? `${(alumno.area_de_progreso * 100).toFixed(2)}%` : 'N/A'}</strong></p>
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 'bold', color: colorPalette.primary4, marginBottom: '12px' }}>Indicadores de Riesgo</h3>
                            <p>Probabilidad de Riesgo: <strong style={{ color: alumno.probabilidad_riesgo && alumno.probabilidad_riesgo > 0.5 ? '#ff6b6b' : '#51cf66' }}>
                                {alumno.probabilidad_riesgo !== undefined ? `${(alumno.probabilidad_riesgo * 100).toFixed(2)}%` : 'N/A'}
                            </strong></p>
                            {alumno.probabilidad_riesgo !== undefined && alumno.probabilidad_riesgo > 0.5 && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                                    <strong>⚠️ Acción Requerida:</strong> Este estudiante requiere intervención administrativa y seguimiento personalizado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AdminView = () => {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                <div className="text-xl text-blue-600">Cargando...</div>
            </div>
        }>
            <AdminViewContent />
        </Suspense>
    );
};

export default AdminView;
