// src/app/dashboard/alumno/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, Title
} from 'chart.js';
import { Alumno, MATERIAS } from '@/lib/analytics';
import { colorPalette } from '@/lib/theme';
import LogoutButton from '@/components/LogoutButton';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, Title);

function AlumnoViewContent() {
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

        if (storedRole.toLowerCase() !== 'alumno') {
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
                <div className="text-xl text-red-600">No se encontraron datos del alumno</div>
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

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', padding: '24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header con badge de Alumno */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ backgroundColor: '#4caf50', padding: '6px 16px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>👨‍🎓</span>
                                <span>ESTUDIANTE</span>
                            </div>
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2e7d32' }}>
                            Mi Desempeño - {alumno.nombre}
                        </h1>
                    </div>
                    <LogoutButton />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(76,175,80,0.3)', color: '#fff' }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📊</span>
                            <span>Promedio General</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                            {alumno.promedio_gral_calificacion?.toFixed(1) || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                            {alumno.promedio_gral_calificacion >= 85 ? '¡Excelente!' : alumno.promedio_gral_calificacion >= 70 ? 'Buen trabajo' : 'Puedes mejorar'}
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(33,150,243,0.3)', color: '#fff' }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✓</span>
                            <span>Asistencia</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                            {alumno.promedio_gral_asistencia?.toFixed(1) || 'N/A'}%
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                            {alumno.promedio_gral_asistencia >= 90 ? 'Muy constante' : alumno.promedio_gral_asistencia >= 80 ? 'Buena asistencia' : 'Mejora tu asistencia'}
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(255,152,0,0.3)', color: '#fff' }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>⭐</span>
                            <span>Conducta</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                            {alumno.promedio_gral_conducta?.toFixed(1) || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                            {alumno.promedio_gral_conducta >= 85 ? 'Ejemplar' : alumno.promedio_gral_conducta >= 70 ? 'Adecuada' : 'Necesita mejorar'}
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                        Calificaciones por Materia
                    </h2>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                        Áreas de Oportunidad
                    </h2>
                    <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>
                        {alumno.area_de_progreso !== undefined && (
                            <p style={{ marginBottom: '12px' }}>Área de progreso: <strong>{(alumno.area_de_progreso * 100).toFixed(1)}%</strong></p>
                        )}
                        {alumno.probabilidad_riesgo !== undefined && (
                            <p style={{ color: alumno.probabilidad_riesgo > 0.5 ? '#ff6b6b' : '#51cf66', marginBottom: '16px' }}>
                                Probabilidad de riesgo: <strong>{(alumno.probabilidad_riesgo * 100).toFixed(1)}%</strong>
                            </p>
                        )}
                        
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colorPalette.primary4, marginBottom: '12px' }}>💡 Recomendaciones Personales</h3>
                            <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.8' }}>
                                <li>Mantén un horario de estudio consistente</li>
                                <li>Solicita apoyo en las materias que presenten mayor dificultad</li>
                                <li>Participa activamente en clase y resuelve tus dudas</li>
                                <li>Revisa tus apuntes diariamente</li>
                                {alumno.probabilidad_riesgo > 0.5 && (
                                    <li style={{ color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Busca tutoría adicional lo antes posible</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AlumnoView = () => {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                <div className="text-xl text-blue-600">Cargando...</div>
            </div>
        }>
            <AlumnoViewContent />
        </Suspense>
    );
};

export default AlumnoView;
