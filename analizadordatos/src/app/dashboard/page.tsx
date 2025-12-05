// src/app/dashboard/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { useRouter } from 'next/navigation';
import { colorPalette } from "@/lib/theme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import DataTable from "@/components/DataTable";
import MetricCard from "@/components/MetricCard";
import UploadExcel from "@/components/UploadExcel";
import DynamicVectorialGraph from '@/components/DynamicVectorialGraph'; 
import LogoutButton from '@/components/LogoutButton';
import {
    Alumno, BackendMetrics, UserRole
} from "@/lib/analytics"; 

const Dashboard = () => {
    const router = useRouter();
    const [data, setData] = useState<Alumno[]>([]);
    const [backendMetrics, setBackendMetrics] = useState<BackendMetrics>({
        area_de_progreso_grupo: 0.0,
        promedio_general: 0.0,
        correlaciones: { asistencia_vs_calificacion: 0.0, conducta_vs_calificacion: 0.0 },
        estadistica_grupal: { std_promedio: 0.0, std_asistencia: 0.0, std_conducta: 0.0 }
    });
    
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('userRole') as UserRole | null;
        const name = localStorage.getItem('userName') || 'Usuario';
        const token = localStorage.getItem('authToken');

        if (!role || !token) {
            router.push('/'); 
            return;
        }

        setUserRole(role);
        setUserName(name);

        if (role !== 'Admin' && role !== 'Docente') {
            router.push(`/dashboard/view?role=${role.toLowerCase()}&id=${token}`);
            return;
        }
        
        const storedData = localStorage.getItem('analisisData');
        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch (e) { /* silent fail */ }
        }
    }, [router]);
    
    if (!userRole || (userRole !== 'Admin' && userRole !== 'Docente')) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}><div className="text-xl text-blue-600">Verificando permisos...</div></div>;
    }

    const promedioGral = backendMetrics.promedio_general; 
    const tendencia = promedioGral > 85 ? "📈 Tendencia positiva" : (promedioGral < 75 ? "📉 Tendencia negativa" : "➡️ Tendencia estable");

    const canUpload = userRole === 'Admin'; 
    const isDocente = userRole === 'Docente';
    const isAdministrativo = userRole === 'Admin';

    const handleDataLoaded = (loadedData: any[], metrics: BackendMetrics) => {
        // Transformar los datos del backend al formato esperado por el frontend
        const transformedData: Alumno[] = loadedData.map(alumno => {
            // Convertir detalle_promedios_por_materia a detalle_materias
            const detalle_materias: Record<string, { calificacion: number; asistencia: number; conducta: number }> = {};
            
            if (alumno.detalle_promedios_por_materia) {
                Object.keys(alumno.detalle_promedios_por_materia).forEach(materia => {
                    detalle_materias[materia] = {
                        calificacion: alumno.detalle_promedios_por_materia[materia] || 0,
                        asistencia: alumno.promedio_gral_asistencia || 0,
                        conducta: alumno.promedio_gral_conducta || 0
                    };
                });
            }
            
            return {
                ...alumno,
                detalle_materias
            };
        });
        
        setData(transformedData);
        setBackendMetrics(metrics); 
        localStorage.setItem('analisisData', JSON.stringify(transformedData));
    };

    const chartData = {
        labels: data.map((d) => d.nombre),
        datasets: [{
                label: "Promedio General",
                data: data.map((d) => d.promedio_gral_calificacion),
                borderColor: colorPalette.primary1,
                backgroundColor: colorPalette.primary3 + "20",
                borderWidth: 2, 
                fill: true,
                tension: 0.3
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    font: { size: 12 },
                    color: colorPalette.primary4
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: colorPalette.primary4 },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                ticks: { color: colorPalette.primary4, font: { size: 10 } },
                grid: { display: false }
            }
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '32px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="space-y-8">
                
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderBottom: `4px solid ${colorPalette.primary1}`
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: colorPalette.primary1,
                        margin: 0
                    }}>
                        Dashboard de Gestión Académica 
                        <span style={{color: colorPalette.primary4, fontSize: '14px', marginLeft: '12px', fontWeight: '500'}}>({userName} - {userRole})</span>
                    </h1>
                    <LogoutButton /> 
                </header>

                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {canUpload && <UploadExcel onAnalysisComplete={handleDataLoaded} />}
                    {!canUpload && <p style={{ textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: '500' }}>Acceso de ingesta de datos limitado a Administradores.</p>}
                </div>

                {data.length > 0 && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}> 
                            <MetricCard titulo="Promedio Gral" valor={promedioGral.toFixed(2)} /> 
                            <MetricCard titulo="Correlación Asistencia" valor={backendMetrics.correlaciones.asistencia_vs_calificacion.toFixed(2)} />
                            
                            {isDocente && <MetricCard titulo="Correlación Conducta" valor={backendMetrics.correlaciones.conducta_vs_calificacion.toFixed(2)} />}

                            {isAdministrativo && <MetricCard titulo="Área de Progreso Grupal" valor={backendMetrics.area_de_progreso_grupo.toFixed(2)} />}
                            
                            <MetricCard titulo="Desv. Est. Promedio" valor={backendMetrics.estadistica_grupal.std_promedio.toFixed(2)} />
                            <MetricCard titulo="Total Alumnos" valor={data.length.toString()} />
                        </div>

                        <div style={{
                            backgroundColor: '#ffffff',
                            color: colorPalette.primary1,
                            padding: '16px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${colorPalette.primary1}`,
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            {tendencia}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '100%' }}>
                            
                            <div style={{
                                backgroundColor: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '550px',
                                overflow: 'auto'
                            }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: colorPalette.primary4 }}>Análisis Vectorial 3D</h2>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                                    <DynamicVectorialGraph data={data} std_promedio={backendMetrics.estadistica_grupal.std_promedio} />
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                maxHeight: '550px'
                            }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: colorPalette.primary4 }}>Progreso de Grupo</h2>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '350px' }}>
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: colorPalette.primary4, marginTop: '16px' }}>Alumnos para Intervención ({isDocente ? 'Filtro Pedagógico' : 'Filtro Admin'})</h2>
                        <DataTable data={data} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;