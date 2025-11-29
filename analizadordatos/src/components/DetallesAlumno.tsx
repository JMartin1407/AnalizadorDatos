// src/components/detallesAlumno.tsx
'use client';
import React from 'react';
import { Alumno } from '@/lib/analytics';
import { colorPalette } from '@/lib/theme';
import MetricCard from './MetricCard';

interface StudentDetailProps {
    alumno: Alumno | null;
    onClose: () => void;
}

const DetallesAlumno: React.FC<StudentDetailProps> = ({ alumno, onClose }) => {
    if (!alumno) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
            padding: '16px'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
                width: '100%',
                maxWidth: '900px',
                padding: '24px',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: colorPalette.primary4,
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>
                
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: colorPalette.primary1,
                    marginBottom: '16px',
                    paddingBottom: '8px',
                    borderBottom: `2px solid ${colorPalette.primary1}`
                }}>
                    Análisis Individual: {alumno.nombre}
                </h2>

                {/* Sección de Métricas Individuales */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <MetricCard titulo="Promedio Actual" valor={alumno.promedio.toFixed(1)} />
                    <MetricCard titulo="Riesgo de Caída" valor={`${(alumno.probabilidad_riesgo * 100).toFixed(1)}%`} />
                    <MetricCard titulo="Consistencia (Área)" valor={alumno.area_de_progreso.toFixed(2)} />
                    <MetricCard titulo="Asistencia" valor={`${alumno.asistencia.toFixed(0)}%`} />
                </div>

                {/* Recomendaciones Pedagógicas */}
                <div style={{
                    backgroundColor: `${colorPalette.primary1}15`,
                    borderLeft: `4px solid ${colorPalette.primary1}`,
                    padding: '24px',
                    borderRadius: '8px'
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: colorPalette.primary1,
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 0 12px 0'
                    }}>
                        💡 Recomendación Pedagógica
                    </h3>
                    <p style={{
                        color: colorPalette.primary4,
                        whiteSpace: 'pre-line',
                        margin: 0
                    }}>
                        {alumno.recomendacion_pedagogica}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default DetallesAlumno;