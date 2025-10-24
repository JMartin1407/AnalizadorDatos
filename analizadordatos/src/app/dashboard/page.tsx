// src/app/dashboard/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { useRouter } from 'next/navigation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import DataTable from "@/components/DataTable";
import MetricCard from "@/components/MetricCard";
import UploadExcel from "@/components/UploadExcel";
import DynamicVectorialGraph from '@/components/DynamicVectorialGraph'; 
import LogoutButton from '@/components/LogoutButton'; // Asumiendo que has importado el LogoutButton
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

    // --- Control de Roles y Redirección de Bloqueo ---
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

        // REGLA CRÍTICA DE REDIRECCIÓN ESTRICTA: Alumno y Padre NO ven esta vista
        if (role !== 'Admin' && role !== 'Docente') {
            router.push(`/dashboard/${role.toLowerCase()}/${token}`);
            return;
        }
        
        // Persistencia de datos
        const storedData = localStorage.getItem('analisisData');
        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch (e) { /* silent fail */ }
        }
    }, [router]);
    
    if (!userRole || (userRole !== 'Admin' && userRole !== 'Docente')) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-blue-600">Verificando permisos...</div></div>;
    }

    // --- Lógica de Renderizado y Segregación ---
    
    // Usamos el dato directo del backend para evitar errores de tipado de frontend
    const promedioGral = backendMetrics.promedio_general; 
    const tendencia = promedioGral > 85 ? "📈 Tendencia positiva" : (promedioGral < 75 ? "📉 Tendencia negativa" : "➡️ Tendencia estable");

    // REGLAS ESTRICTAS DE SEGREGACIÓN:
    const canUpload = userRole === 'Admin'; 
    const isDocente = userRole === 'Docente';
    const isAdministrativo = userRole === 'Admin';

    const handleDataLoaded = (loadedData: Alumno[], metrics: BackendMetrics) => {
        setData(loadedData);
        setBackendMetrics(metrics); 
        localStorage.setItem('analisisData', JSON.stringify(loadedData));
    };

    const chartData = {
        labels: data.map((d) => d.nombre),
        datasets: [{
                label: "Promedio General",
                data: data.map((d) => d.promedio_gral_calificacion),
                borderColor: "rgba(37, 99, 235, 1)", // Azul más profesional
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                borderWidth: 2, fill: true,
        }],
    };

    return (
        // Contenedor principal con fondo ligero
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Encabezado y Logout */}
                <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-600">
                    <h1 className="text-3xl font-extrabold text-blue-700">
                        Dashboard de Gestión Académica 
                        <span className="text-gray-500 text-base ml-3 font-medium">({userName} - {userRole})</span>
                    </h1>
                    {/* Logout Button */}
                    <LogoutButton /> 
                </header>

                {/* Componente de Carga (SOLO VISIBLE PARA ADMIN) */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    {canUpload && <UploadExcel onAnalysisComplete={handleDataLoaded} />}
                    {!canUpload && <p className="text-center text-sm text-orange-500 font-medium">Acceso de ingesta de datos limitado a Administradores.</p>}
                </div>


                {data.length > 0 && (
                    <>
                        {/* Indicadores rápidos y Estadística Avanzada */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6"> 
                            {/* MÉTRICAS CLAVE (VISIBLES PARA AMBOS) */}
                            <MetricCard titulo="Promedio Gral" valor={promedioGral.toFixed(2)} /> 
                            <MetricCard titulo="Correlación Asistencia" valor={backendMetrics.correlaciones.asistencia_vs_calificacion.toFixed(2)} />
                            
                            {/* MÉTRICAS DE INTERVENCIÓN (Docente) */}
                            {isDocente && <MetricCard titulo="Correlación Conducta" valor={backendMetrics.correlaciones.conducta_vs_calificacion.toFixed(2)} />}

                            {/* MÉTRICAS DE SISTEMA (SOLO ADMIN) */}
                            {isAdministrativo && <MetricCard titulo="Área de Progreso Grupal" valor={backendMetrics.area_de_progreso_grupo.toFixed(2)} />}
                            
                            {/* ESTADÍSTICA GRUPAL (Visibles para ambos) */}
                            <MetricCard titulo="Desv. Est. Promedio" valor={backendMetrics.estadistica_grupal.std_promedio.toFixed(2)} />
                            <MetricCard titulo="Total Alumnos" valor={data.length.toString()} />
                        </div>

                        {/* Tendencia */}
                        <div className="bg-white text-blue-700 p-4 rounded-xl shadow border-l-4 border-blue-400 font-semibold text-center">
                            {tendencia}
                        </div>

                        {/* Contenedor de Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Gráfico 3D Vectorial */}
                            <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-1">
                                <h2 className="text-xl font-semibold mb-3 text-gray-700">Análisis Vectorial 3D</h2>
                                <DynamicVectorialGraph data={data} std_promedio={backendMetrics.estadistica_grupal.std_promedio} />
                            </div>
                            
                            {/* Gráfico 2D */}
                            <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-1 flex flex-col justify-between">
                                <h2 className="text-xl font-semibold mb-3 text-gray-700">Progreso de Grupo</h2>
                                <div className="flex-grow flex items-center justify-center">
                                    <Line data={chartData} />
                                </div>
                            </div>
                        </div>

                        {/* Tabla Principal para Navegación */}
                        <h2 className="text-2xl font-bold text-gray-700 mt-4">Alumnos para Intervención ({isDocente ? 'Filtro Pedagógico' : 'Filtro Admin'})</h2>
                        <DataTable data={data} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;