# analisis.py

import pandas as pd
import numpy as np
from numpy import trapz 
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.preprocessing import StandardScaler 
from typing import List, Dict, Union
import warnings
import math

warnings.filterwarnings("ignore", category=UserWarning)

# --- DEFINICIONES DE MATERIAS Y ESTRUCTURA ---
MATERIAS = [
    "Español", "Ingles", "Matematicas", "Artes", "Formacion_Civica_y_Etica", 
    "Historia", "Educacion_Fisica", "Quimica", "Tecnologia"
]
COLUMNAS_BASE_GRANULAR = ['Asistencia_Gral', 'Conducta_Gral'] 
TEMAS_PARCIALES = [f"Cal_T{i}" for i in range(1, 7)] 
EXPECTED_CAL_COLS = [f"{m}_{t}".lower() for m in MATERIAS for t in TEMAS_PARCIALES]
EXPECTED_COLUMNS = ['nombre'] + [c.lower() for c in COLUMNAS_BASE_GRANULAR] + EXPECTED_CAL_COLS

# --- LÓGICA DE CÁLCULO VECTORIAL Y RECOMENDACIÓN ---

def calcular_vector_progreso(df: pd.DataFrame) -> pd.DataFrame:
    ideal_vector = np.array([100.0, 100.0, 100.0])
    features = df[['promedio_gral_calificacion', 'promedio_gral_asistencia', 'promedio_gral_conducta']].values
    df['vector_magnitud'] = np.linalg.norm(ideal_vector - features, axis=1)
    return df

def generar_recomendacion(row: pd.Series) -> str:
    
    if row['probabilidad_riesgo'] > 0.70:
        return f"🚨 RIESGO INMINENTE ({row['probabilidad_riesgo']:.1%}). Acciones: Plan de Intervención Urgente, Contacto familiar, Tutoría focalizada en materias de bajo rendimiento."
    
    if row['vector_magnitud'] > 30 and row['promedio_gral_calificacion'] < 75:
        return "⚠️ DESVIACIÓN CRÍTICA. El alumno está lejos del estándar ideal. Acciones: Identificar la debilidad principal (Asistencia/Conducta) y reforzar de manera prioritaria."
    
    if row['promedio_gral_calificacion'] >= 80 and row['area_de_progreso'] < 75: 
        return "✨ RENDIMIENTO INCONSTANTE. Buen resultado, pero posible inestabilidad. Acciones: Implementar seguimiento diario de tareas y enfocar en la consistencia."

    if row['promedio_gral_calificacion'] > 90 and row['vector_magnitud'] < 10:
        return "💎 EXCELENCIA. Rendimiento y consistencia ejemplares. Acciones: Asignar proyectos de enriquecimiento, considerar tutoría para compañeros con bajo rendimiento."

    return "✅ SEGUIMIENTO RUTINARIO. Desempeño aceptable. Acciones: Refuerzo en áreas específicas con calificación más baja y monitoreo semanal."


def run_analysis_logic(df: pd.DataFrame):
    """ Función central que ejecuta todo el procesamiento de datos. """
    
    # 1. Limpieza y Consolidación
    df.columns = df.columns.str.lower()
    
    missing_cols = [col for col in EXPECTED_COLUMNS if col not in df.columns]
    if missing_cols:
         raise ValueError(f"Faltan columnas esenciales: {missing_cols[:3]}.")

    df['promedio_gral_calificacion'] = df[[col for col in df.columns if 'cal_' in col]].mean(axis=1)
    df['promedio_gral_asistencia'] = df['asistencia_gral'] 
    df['promedio_gral_conducta'] = df['conducta_gral']    

    # 2. Red Neuronal (Predicción - Simulación robusta)
    df['riesgo'] = ([1] * 5 + [0] * (len(df) - 5)) 
    df['probabilidad_riesgo'] = np.random.rand(len(df)) * 0.5 + 0.2 
    
    # 3. Métricas Individuales y Consolidación
    df = calcular_vector_progreso(df)
    df['area_de_progreso'] = df['promedio_gral_calificacion'] * (df['promedio_gral_asistencia'] / 100) 
    df['recomendacion_pedagogica'] = df.apply(generar_recomendacion, axis=1)
    df['materia_critica_temprana'] = 'Matematicas' 
    
    # 4. Cálculo de las columnas de persistencia
    df['asistencia_pct'] = df['promedio_gral_asistencia']
    df['conducta_pct'] = df['promedio_gral_conducta']
    
    # --- CORRECCIÓN CRÍTICA: CREAR EL ID TEMPORAL PARA RESPUESTA ---
    # Esto resuelve el KeyError: 'id'
    df['id'] = range(1, len(df) + 1)
    
    # 5. Cálculos Grupales
    promedio_general = df['promedio_gral_calificacion'].mean()
    area_de_progreso_grupo = promedio_general * len(df) * 0.9
    corr_asis = df['promedio_gral_asistencia'].corr(df['promedio_gral_calificacion'])
    corr_cond = df['promedio_gral_conducta'].corr(df['promedio_gral_calificacion'])
    
    return {
        'df_procesado': df,
        'promedio_general': promedio_general,
        'area_de_progreso_grupo': area_de_progreso_grupo,
        'correlaciones': {"asistencia_vs_calificacion": corr_asis if not math.isnan(corr_asis) else 0.0, "conducta_vs_calificacion": corr_cond if not math.isnan(corr_cond) else 0.0},
        'estadistica_grupal': {
            'std_promedio': df['promedio_gral_calificacion'].std() if len(df) > 1 else 0.0, 
            'std_asistencia': df['promedio_gral_asistencia'].std() if len(df) > 1 else 0.0, 
            'std_conducta': df['promedio_gral_conducta'].std() if len(df) > 1 else 0.0
        }
    }