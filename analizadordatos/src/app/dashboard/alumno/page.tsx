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
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: colorPalette.primary1 }}>
                        Mi Desempeño - {alumno.nombre}
                    </h1>
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
                    <div style={{ fontSize: '16px', color: '#666' }}>
                        {alumno.area_de_progreso !== undefined && (
                            <p>Área de progreso: {(alumno.area_de_progreso * 100).toFixed(1)}%</p>
                        )}
                        {alumno.probabilidad_riesgo !== undefined && (
                            <p style={{ color: alumno.probabilidad_riesgo > 0.5 ? '#ff6b6b' : '#51cf66' }}>
                                Probabilidad de riesgo: {(alumno.probabilidad_riesgo * 100).toFixed(1)}%
                            </p>
                        )}
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
