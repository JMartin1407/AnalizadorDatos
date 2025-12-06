// src/app/dashboard/padre/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radar, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { Alumno, MATERIAS } from '@/lib/analytics';
import { colorPalette } from '@/lib/theme';
import LogoutButton from '@/components/LogoutButton';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function PadreViewContent() {
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

        if (storedRole.toLowerCase() !== 'padre') {
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
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', padding: '24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header con badge de Padre/Tutor */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ backgroundColor: '#ff9800', padding: '6px 16px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>👨‍👩‍👧</span>
                                <span>PADRE/TUTOR</span>
                            </div>
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#e65100' }}>
                            Seguimiento - {alumno.nombre}
                        </h1>
                    </div>
                    <LogoutButton />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Promedio General</div>
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
                            Resumen General
                        </h2>
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, max: 100 } } }} />
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colorPalette.primary1, marginBottom: '16px' }}>
                        Recomendaciones para Padres/Tutores
                    </h2>
                    <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>
                        {alumno.probabilidad_riesgo !== undefined && alumno.probabilidad_riesgo > 0.5 && (
                            <div style={{ padding: '16px', backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', marginBottom: '16px', borderRadius: '8px' }}>
                                <strong>⚠️ Atención requerida:</strong> El estudiante presenta probabilidad alta de riesgo académico. 
                                Se recomienda programar una reunión con el docente lo antes posible.
                            </div>
                        )}
                        {alumno.area_de_progreso !== undefined && (
                            <p style={{ marginBottom: '16px' }}>Área de progreso actual: <strong>{(alumno.area_de_progreso * 100).toFixed(1)}%</strong></p>
                        )}
                        
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colorPalette.primary4, marginBottom: '12px' }}>💡 Recomendaciones para Apoyar en Casa</h3>
                            <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.8' }}>
                                <li>Establecer una rutina diaria de estudio (horario fijo)</li>
                                <li>Crear un espacio tranquilo y adecuado para hacer tareas</li>
                                <li>Revisar diariamente los apuntes y tareas del estudiante</li>
                                <li>Mantener comunicación constante con el docente</li>
                                <li>Fomentar hábitos de lectura y organización</li>
                                <li>Limitar distracciones (teléfono, TV) durante horarios de estudio</li>
                                <li>Reconocer y celebrar logros académicos, por pequeños que sean</li>
                                {alumno.probabilidad_riesgo > 0.5 && (
                                    <li style={{ color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Solicitar tutoría adicional o apoyo pedagógico</li>
                                )}
                            </ul>
                        </div>
                        
                        <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#666' }}>
                            Recuerde: Su apoyo y seguimiento son fundamentales para el éxito académico de su hijo/a.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PadreView = () => {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                <div className="text-xl text-blue-600">Cargando...</div>
            </div>
        }>
            <PadreViewContent />
        </Suspense>
    );
};

export default PadreView;
