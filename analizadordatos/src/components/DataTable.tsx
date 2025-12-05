// src/components/DataTable.tsx
"use client";
import React from "react";
import { Alumno } from "@/lib/analytics"; 
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Chip } from "@mui/material";
import { colorPalette } from "@/lib/theme";

interface DataTableProps {
    data: Alumno[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const router = useRouter();

    const userRole = localStorage.getItem('userRole'); 

    const handleRowClick = (alumno: Alumno) => {
        const role = userRole?.toLowerCase() || 'admin';
        router.push(`/dashboard/${role}?id=${alumno.id}`);
    };

    // Función para determinar color de riesgo
    const getRiskColor = (risk: number) => {
        if (risk > 0.7) return 'error';
        if (risk > 0.4) return 'warning';
        return 'success';
    };

    // Función para determinar etiqueta de riesgo
    const getRiskLabel = (risk: number) => {
        if (risk > 0.7) return 'Alto';
        if (risk > 0.4) return 'Medio';
        return 'Bajo';
    };

    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead sx={{ backgroundColor: colorPalette.primary1 }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', backgroundColor: colorPalette.primary1 }}>Nombre</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', backgroundColor: colorPalette.primary1 }}>Promedio Gral</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', backgroundColor: colorPalette.primary1 }}>Riesgo Predicho (%)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', backgroundColor: colorPalette.primary1 }}>Desviación Vectorial</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', backgroundColor: colorPalette.primary1 }}>Nivel de Riesgo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', backgroundColor: colorPalette.primary1 }}>Área de Progreso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((alumno, index) => (
              <TableRow 
                key={alumno.id} 
                onClick={() => handleRowClick(alumno)}
                sx={{ 
                  cursor: 'pointer',
                  backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#fff',
                  '&:hover': { backgroundColor: '#E8F0F7', transition: 'background-color 0.2s' },
                  borderBottom: '1px solid #e0e0e0'
                }}
              >
                <TableCell sx={{ fontWeight: '500', color: colorPalette.primary3, fontSize: '0.95rem' }}>
                  {alumno.nombre}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.95rem', fontWeight: '500', color: colorPalette.primary2 }}>
                  {alumno.promedio_gral_calificacion.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ fontWeight: 'bold', color: '#D32F2F', fontSize: '0.95rem' }}>
                    {(alumno.probabilidad_riesgo * 100).toFixed(1)}%
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ color: '#FF9800', fontWeight: '500', fontSize: '0.95rem' }}>
                  {alumno.vector_magnitud.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={getRiskLabel(alumno.probabilidad_riesgo)}
                    color={getRiskColor(alumno.probabilidad_riesgo)}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.95rem', fontWeight: '500', color: colorPalette.primary2 }}>
                  {alumno.area_de_progreso.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
};

export default DataTable;