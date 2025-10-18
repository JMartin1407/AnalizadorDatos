// src/app/dashboard/page.tsx
'use client';

import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import DataTable from "@/components/DataTable";
import MetricCard from "@/components/MetricCard";
import UploadExcel from "@/components/UploadExcel";
import DynamicVectorialGraph from '@/components/DynamicVectorialGraph'; 
import {
    calcularTendencia, resumenGeneral,
    Alumno, BackendMetrics,
} from "@/lib/analytics"; 

const Dashboard = () => {
    const [data, setData] = useState<Alumno[]>([]);
    const [backendMetrics, setBackendMetrics] = useState<BackendMetrics>({
        area_de_progreso_grupo: 0.0,
        promedio_general: 0.0,
        correlaciones: { asistencia_vs_calificacion: 0.0, conducta_vs_calificacion: 0.0 },
        estadistica_grupal: { std_promedio: 0.0, std_asistencia: 0.0, std_conducta: 0.0 }
    });
    
    const resumen = useMemo(() => resumenGeneral(data), [data]);
    const tendencia = useMemo(() => calcularTendencia(data), [data]);
    
    const handleDataLoaded = (loadedData: Alumno[], metrics: BackendMetrics) => {
        setData(loadedData);
        setBackendMetrics(metrics); 
        // LÓGICA CLAVE: Guardar la data completa en localStorage para que la página de detalle la pueda leer
        // Esto soluciona el problema de "Alumno no encontrado".
        localStorage.setItem('analisisData', JSON.stringify(loadedData));
    };

    const chartData = {
        labels: data.map((d) => d.nombre),
        datasets: [
            {
                label: "Promedio General",
                data: data.map((d) => d.promedio_gral_calificacion),
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                borderWidth: 2,
                fill: true,
            },
        ],
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-center">Analítica Inteligente Académica (Vista Grupal)</h1>

            <UploadExcel onAnalysisComplete={handleDataLoaded} />

            {/* Indicadores rápidos y Estadística Avanzada */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> 
                <MetricCard titulo="Promedio Gral" valor={resumen.promedio.toFixed(2)} /> 
                <MetricCard titulo="Correlación Asistencia" valor={backendMetrics.correlaciones.asistencia_vs_calificacion.toFixed(2)} />
                <MetricCard titulo="Área de Progreso Grupal" valor={backendMetrics.area_de_progreso_grupo.toFixed(2)} />
                <MetricCard titulo="Desv. Est. Promedio" valor={backendMetrics.estadistica_grupal.std_promedio.toFixed(2)} />
                <MetricCard titulo="Total Alumnos" valor={data.length.toString()} />
            </div>

            {/* Tendencia */}
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl shadow text-center font-medium">
                {tendencia}
            </div>

            {/* Gráfico 3D Vectorial (CORREGIDO con carga dinámica) */}
            {data.length > 0 && (
                <div className="bg-white p-4 rounded-2xl shadow-md mx-auto">
                    <DynamicVectorialGraph 
                        data={data} 
                        std_promedio={backendMetrics.estadistica_grupal.std_promedio}
                    />
                </div>
            )}
            
            {/* Gráfico 2D */}
            {data.length > 0 && (
                <div className="bg-white p-4 rounded-2xl shadow-md max-w-3xl mx-auto">
                    <Line data={chartData} />
                </div>
            )}

            {/* Tabla Principal para Navegación */}
            {data.length > 0 && <DataTable data={data} />}
        </div>
    );
};

export default Dashboard;