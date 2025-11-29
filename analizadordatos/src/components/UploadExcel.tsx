// src/components/UploadExcel.tsx
'use client';

import React, { useState, useEffect } from "react";
import axios from 'axios'; 
import { Alumno, BackendMetrics, Correlaciones, GrupoEstadistica, UserRole } from "@/lib/analytics"; 
import { colorPalette } from "@/lib/theme"; 


const UploadExcel: React.FC<any> = ({ onAnalysisComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);


    useEffect(() => {
        const role = localStorage.getItem('userRole') as UserRole | null;
        setUserRole(role);
    }, []);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] || null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Por favor, selecciona un archivo.");
            return;
        }

        const authToken = localStorage.getItem('authToken');
        
        if (userRole !== 'Admin' || !authToken) {
            setError("Acceso denegado (403). Solo los Administradores pueden subir archivos.");
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
 
            const response = await axios.post<any>(
                'http://localhost:8000/admin/upload-and-analyze/',
                formData,
                { headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}` 
                }}
            );


            const metrics: BackendMetrics = {
                area_de_progreso_grupo: response.data.area_de_progreso_grupo,
                promedio_general: response.data.promedio_general,
                correlaciones: response.data.correlaciones,
                estadistica_grupal: response.data.estadistica_grupal,
            };

            onAnalysisComplete(response.data.data_preview, metrics);

        } catch (err: any) {
            let errorMessage: string;
            
            if (axios.isAxiosError(err)) { 
                const status = err.response?.status;
                if (status === 401 || status === 403) {
                     errorMessage = `Error de Permiso (${status}). Por favor, vuelva a iniciar sesión.`;
                } else {
                     errorMessage = err.response?.data?.detail || "Fallo de comunicación con el servidor.";
                }
            } else {
                errorMessage = "Error desconocido al subir el archivo.";
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const canUpload = userRole === 'Admin';
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <p style={{ color: colorPalette.primary4, fontSize: '14px', margin: 0 }}>
                {canUpload ? "Sube el archivo de datos para análisis (Rol: ADMIN)." : "Acceso de carga denegado. Solo ADMIN."}
            </p>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{
                    cursor: 'pointer',
                    padding: '8px',
                    border: `1px solid ${colorPalette.primary1}`,
                    borderRadius: '6px',
                    opacity: canUpload ? 1 : 0.5
                }}
                disabled={!canUpload} 
            />
            <button 
                onClick={handleUpload} 
                disabled={loading || !file || !canUpload}
                style={{
                    width: '100%',
                    padding: '10px 16px',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    transition: 'background-color 0.2s',
                    backgroundColor: canUpload ? colorPalette.primary1 : '#cccccc',
                    cursor: canUpload ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                }}
            >
                {loading ? 'Procesando...' : 'Analizar Datos Multi-Materia'}
            </button>
            {error && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '8px', margin: 0 }}>{error}</p>}
        </div>
    );
};

export default UploadExcel;