// src/components/UploadExcel.tsx
'use client';

import React, { useState } from "react";
import axios from 'axios'; 
import { Alumno, BackendMetrics, Correlaciones, GrupoEstadistica } from "@/lib/analytics"; 

// Definición de la respuesta de FastAPI para la tipificación local
interface AnalysisResult {
    message: string;
    promedio_general: number;
    area_de_progreso_grupo: number; 
    correlaciones: Correlaciones;
    estadistica_grupal: GrupoEstadistica;
    data_preview: Alumno[];
}

interface UploadExcelProps {
    onAnalysisComplete: (data: Alumno[], metrics: BackendMetrics) => void;
}

const UploadExcel: React.FC<UploadExcelProps> = ({ onAnalysisComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] || null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Por favor, selecciona un archivo.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post<AnalysisResult>(
                'http://localhost:8000/upload-and-analyze/',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // Extraemos los datos del Backend para pasarlos al Dashboard
            const metrics: BackendMetrics = {
                area_de_progreso_grupo: response.data.area_de_progreso_grupo,
                promedio_general: response.data.promedio_general,
                correlaciones: response.data.correlaciones,
                estadistica_grupal: response.data.estadistica_grupal,
            };

            onAnalysisComplete(response.data.data_preview, metrics);

        } catch (err) {
            let errorMessage: string;
            
            if (axios.isAxiosError(err)) { 
                errorMessage = err.response?.data?.detail 
                    ? err.response.data.detail
                    : "Error de red o en el servidor. Asegúrate de que FastAPI esté corriendo en http://localhost:8000.";
            } else if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = "Error desconocido al subir el archivo.";
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-2xl shadow">
            <p className="text-gray-600 text-sm">
                Sube un archivo Excel (.xlsx/.xls) para análisis con 27 métricas.
            </p>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="cursor-pointer p-2 border rounded-md"
            />
            <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
                {loading ? 'Procesando...' : 'Analizar Datos Multi-Materia'}
            </button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    );
};

export default UploadExcel;