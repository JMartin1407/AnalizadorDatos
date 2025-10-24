// src/components/DataTable.tsx
"use client";
import React from "react";
import { Alumno } from "@/lib/analytics"; 
import { useRouter } from 'next/navigation';

interface DataTableProps {
    data: Alumno[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const router = useRouter();
    
    // Obtener el rol del usuario logueado para determinar la ruta de destino
    // src/components/DataTable.tsx (Fragmento de handleRowClick)

    const userRole = localStorage.getItem('userRole'); 

    const handleRowClick = (alumno: Alumno) => {
        // La redirección DEBE apuntar a las carpetas existentes:
        if (userRole === 'Admin') {
            router.push(`/dashboard/admin/${alumno.id}`); // Debe existir la carpeta admin/[id]
        } else if (userRole === 'Docente') {
            router.push(`/dashboard/docente/${alumno.id}`); // Debe existir la carpeta docente/[id]
        }
        // Nota: Los otros roles (Padre/Alumno) son redirigidos desde page.tsx
    };

    return (
      <div className="overflow-x-auto bg-white rounded-2xl shadow p-4">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Promedio Gral</th>
              <th className="px-3 py-2">Riesgo Predicho (%)</th> 
              <th className="px-3 py-2">Desviación Vectorial</th> 
            </tr>
          </thead>
          <tbody>
            {data.map((alumno) => (
              <tr 
                key={alumno.id} 
                className="border-t cursor-pointer hover:bg-blue-50 transition duration-150"
                onClick={() => handleRowClick(alumno)}
            >
                <td className="px-3 py-2 text-left font-medium text-blue-600">{alumno.nombre}</td>
                <td className="px-3 py-2">{alumno.promedio_gral_calificacion.toFixed(1)}</td>
                <td className="px-3 py-2 text-red-600 font-semibold">{(alumno.probabilidad_riesgo * 100).toFixed(1)}</td>
                <td className="px-3 py-2 text-orange-600">{alumno.vector_magnitud.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};

export default DataTable;