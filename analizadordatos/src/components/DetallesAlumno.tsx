// src/components/detallesAlumno.tsx
'use client';
import React from 'react';
import { Alumno } from '@/lib/analytics';
import MetricCard from './MetricCard';

interface StudentDetailProps {
    alumno: Alumno | null;
    onClose: () => void;
}

const DetallesAlumno: React.FC<StudentDetailProps> = ({ alumno, onClose }) => {
    if (!alumno) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                >
                    &times;
                </button>
                
                <h2 className="text-3xl font-extrabold text-blue-700 mb-4 border-b pb-2">
                    Análisis Individual: {alumno.nombre}
                </h2>

                {/* Sección de Métricas Individuales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard titulo="Promedio Actual" valor={alumno.promedio.toFixed(1)} />
                    <MetricCard titulo="Riesgo de Caída" valor={`${(alumno.probabilidad_riesgo * 100).toFixed(1)}%`} />
                    <MetricCard titulo="Consistencia (Área)" valor={alumno.area_de_progreso.toFixed(2)} />
                    <MetricCard titulo="Asistencia" valor={`${alumno.asistencia.toFixed(0)}%`} />
                </div>

                {/* Recomendaciones Pedagógicas (Punto 7) */}
                <div className="bg-yellow-50 border-l-4 border-blue-500 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                        💡 Recomendación Pedagógica
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">
                        {alumno.recomendacion_pedagogica}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default DetallesAlumno;