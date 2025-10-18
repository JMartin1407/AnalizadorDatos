// src/components/VectorialGraph.tsx
'use client';

import React from 'react';
import Plot from 'react-plotly.js';
import { Alumno } from '@/lib/analytics';
import * as Plotly from 'plotly.js-dist-min'; 

interface VectorialGraphProps {
    data: Alumno[];
    std_promedio: number; 
}

const VectorialGraph: React.FC<VectorialGraphProps> = ({ data, std_promedio }) => {
    
    if (data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No hay datos disponibles para el gráfico vectorial.</div>;
    }

    // --- 1. Definición de Datos (Puntos de Alumnos) ---
    const student_traces = {
        x: data.map(a => a.promedio_gral_calificacion),
        y: data.map(a => a.promedio_gral_asistencia),
        z: data.map(a => a.promedio_gral_conducta),
        type: 'scatter3d',
        mode: 'markers',
        marker: {
            size: 8,
            color: data.map(a => a.probabilidad_riesgo), 
            colorscale: 'RdYlGn', 
            cmin: 0,
            cmax: 1,
            colorbar: {
                title: 'Riesgo de Caída',
                titleside: 'right',
                thickness: 15
            }
        },
        name: 'Alumnos (P, A, C)',
        text: data.map(a => 
            `Nombre: ${a.nombre}<br>Riesgo: ${(a.probabilidad_riesgo * 100).toFixed(1)}%<br>Desviación: ${a.vector_magnitud.toFixed(2)}`
        ),
        hoverinfo: 'text',
    };

    const ideal_trace = {
        x: [100],
        y: [100],
        z: [100],
        type: 'scatter3d',
        mode: 'markers',
        marker: {
            size: 10,
            color: 'white',
            line: { width: 3, color: 'rgb(255, 165, 0)' } 
        },
        name: 'Ideal [100, 100, 100]',
        text: 'Estado Ideal',
        hoverinfo: 'text',
    };

    // --- 3. Definición del Layout (CORREGIDO: Títulos de Ejes como objetos {text: string}) ---
    const layout = {
        width: 800,
        height: 700,
        scene: {
            xaxis: {
                title: { text: 'Promedio Calificación (P)' }, // <--- CORRECCIÓN CLAVE
                range: [50, 100],
                backgroundcolor: "rgba(0, 0, 0, 0)",
            },
            yaxis: {
                title: { text: 'Promedio Asistencia (A)' }, // <--- CORRECCIÓN CLAVE
                range: [50, 100],
                backgroundcolor: "rgba(0, 0, 0, 0)",
            },
            zaxis: {
                title: { text: 'Promedio Conducta (C)' }, // <--- CORRECCIÓN CLAVE
                range: [50, 100],
                backgroundcolor: "rgba(0, 0, 0, 0)",
            },
            aspectratio: { x: 1, y: 1, z: 1 }
        },
        title: {
            text: `Análisis Vectorial de Desempeño Grupal (STD Promedio: ${std_promedio.toFixed(2)})`,
            font: { size: 16 }
        },
        margin: {
            l: 0, r: 0, b: 0, t: 50
        }
    };

    return (
        <div className="flex justify-center w-full">
            <Plot
                // Usamos la afirmación de tipo para evitar conflictos de sobrecarga
                data={[student_traces, ideal_trace] as Plotly.Data[]}
                layout={layout as Partial<Plotly.Layout>} // <--- Afirmación adicional para Layout
                config={{ responsive: true }}
            />
        </div>
    );
};

export default VectorialGraph;