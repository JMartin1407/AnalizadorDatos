// src/components/UploadExcel.tsx
'use client';

import React, { useState, useEffect } from "react";
import axios from 'axios'; 
import { Alumno, BackendMetrics, Correlaciones, GrupoEstadistica, UserRole } from "@/lib/analytics"; 
// NOTA: Se asumen las interfaces AnalysisResult y UploadExcelProps

const UploadExcel: React.FC<any> = ({ onAnalysisComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    // 1. Hook para obtener el rol del usuario (para la visibilidad)
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

        // 2. OBTENCIÓN Y VERIFICACIÓN CRÍTICA DEL TOKEN (CORRECCIÓN)
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
            // 3. Enviar la petición al endpoint PROTEGIDO de ADMIN
            const response = await axios.post<any>(
                'http://localhost:8000/admin/upload-and-analyze/',
                formData,
                { headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}` // ENVIANDO EL TOKEN
                }}
            );

            // [Lógica de procesamiento de respuesta, asumida correcta]
            const metrics: BackendMetrics = {
                area_de_progreso_grupo: response.data.area_de_progreso_grupo,
                promedio_general: response.data.promedio_general,
                correlaciones: response.data.correlaciones,
                estadistica_grupal: response.data.estadistica_grupal,
            };

            onAnalysisComplete(response.data.data_preview, metrics);

        } catch (err: any) {
            // El backend devuelve 403 (Permiso) o 401 (Token)
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
        <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-2xl shadow">
            <p className="text-gray-600 text-sm">
                {canUpload ? "Sube el archivo de datos para análisis (Rol: ADMIN)." : "Acceso de carga denegado. Solo ADMIN."}
            </p>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="cursor-pointer p-2 border rounded-md"
                disabled={!canUpload} 
            />
            <button 
                onClick={handleUpload} 
                disabled={loading || !file || !canUpload}
                className={`w-full px-4 py-2 text-white rounded-lg transition 
                            ${canUpload ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
                {loading ? 'Procesando...' : 'Analizar Datos Multi-Materia'}
            </button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    );
};

export default UploadExcel;