from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import numpy as np
from numpy import trapz 
from sklearn.linear_model import LogisticRegression
from typing import List, Dict
import warnings

# Suprimir advertencias de Scikit-learn
warnings.filterwarnings("ignore", category=UserWarning)

# --- MATERIAS BASE ---
MATERIAS = [
    "Español", "Ingles", "Matematicas", "Artes", "Formacion_Civica_y_Etica", 
    "Historia", "Educacion_Fisica", "Quimica", "Tecnologia"
]
COLUMNAS_BASE = ['Calificacion', 'Asistencia', 'Conducta']
EXPECTED_COLUMNS = [f"{m}_{c}".lower() for m in MATERIAS for c in COLUMNAS_BASE]
EXPECTED_COLUMNS.append('nombre')

# --- CONFIGURACIÓN DE FASTAPI ---
app = FastAPI(
    title="Smart Analytics Backend Multi-Materia",
    description="Motor de análisis avanzado con 27 métricas por alumno."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INTERFACES (MODELOS Pydantic) ---

class MateriaMetricas(BaseModel):
    calificacion: float
    asistencia: float
    conducta: float

class AlumnoData(BaseModel):
    id: int
    nombre: str
    
    # Promedios Consolidados (Base para el análisis vectorial)
    promedio_gral_calificacion: float
    promedio_gral_asistencia: float
    promedio_gral_conducta: float
    
    # Detalle de Materias
    detalle_materias: Dict[str, MateriaMetricas]

    # Métricas Individuales Avanzadas
    area_de_progreso: float 
    probabilidad_riesgo: float 
    vector_magnitud: float
    recomendacion_pedagogica: str 

class CorrelacionData(BaseModel):
    asistencia_vs_calificacion: float
    conducta_vs_calificacion: float

class GrupoEstadistica(BaseModel):
    std_promedio: float
    std_asistencia: float
    std_conducta: float

class AnalysisResponse(BaseModel):
    message: str
    promedio_general: float
    area_de_progreso_grupo: float 
    correlaciones: CorrelacionData
    estadistica_grupal: GrupoEstadistica
    data_preview: List[AlumnoData]

# --- LÓGICA DE CÁLCULO VECTORIAL Y RECOMENDACIÓN ---

def calcular_vector_progreso(df: pd.DataFrame) -> pd.DataFrame:
    """ 
    Calcula la magnitud de desviación (distancia vectorial) de cada alumno.
    Vector basado en los Promedios Generales: V = [PGC, PGA, PGCd].
    """
    ideal_vector = np.array([100.0, 100.0, 100.0])
    features = df[['promedio_gral_calificacion', 'promedio_gral_asistencia', 'promedio_gral_conducta']].values
    
    df['vector_magnitud'] = np.linalg.norm(ideal_vector - features, axis=1)
    return df

def generar_recomendacion(row: pd.Series) -> str:
    """ Genera la recomendación basada en análisis consolidado (Óptimo y Coherente). """
    
    if row['probabilidad_riesgo'] > 0.70:
        return f"🚨 RIESGO INMINENTE ({row['probabilidad_riesgo']:.1%}). Acciones: Plan de Intervención Urgente, Contacto familiar, Tutoría focalizada en materias de bajo rendimiento."
    
    if row['vector_magnitud'] > 30 and row['promedio_gral_calificacion'] < 75:
        return "⚠️ DESVIACIÓN CRÍTICA. El alumno está lejos del estándar ideal. Acciones: Identificar la debilidad principal (Asistencia/Conducta) y reforzar de manera prioritaria."
    
    if row['promedio_gral_calificacion'] >= 80 and row['area_de_progreso'] < 75: 
        return "✨ RENDIMIENTO INCONSTANTE. Buen resultado, pero posible inestabilidad. Acciones: Implementar seguimiento diario de tareas y enfocar en la consistencia."

    if row['promedio_gral_calificacion'] > 90 and row['vector_magnitud'] < 10:
        return "💎 EXCELENCIA. Rendimiento y consistencia ejemplares. Acciones: Asignar proyectos de enriquecimiento, considerar tutoría para compañeros con bajo rendimiento."

    return "✅ SEGUIMIENTO RUTINARIO. Desempeño aceptable. Acciones: Refuerzo en áreas específicas con calificación más baja y monitoreo semanal."


def procesar_df(df: pd.DataFrame) -> tuple[float, float, CorrelacionData, GrupoEstadistica, List[AlumnoData]]:
    """ Procesa el DataFrame, calcula métricas grupales e individuales. """
    
    # 1. Limpieza y Normalización
    df.columns = df.columns.str.lower()
    
    missing_cols = [col for col in EXPECTED_COLUMNS if col not in df.columns]
    if missing_cols:
         raise ValueError(f"Faltan columnas esenciales (ej: {missing_cols[:5]}). Asegure 27 columnas de tipo 'Materia_Metrica'.")

    # Convierte todas las columnas de métricas a numérico
    metric_cols = [col for col in df.columns if col != 'nombre']
    df[metric_cols] = df[metric_cols].apply(pd.to_numeric, errors='coerce')
    df.dropna(subset=metric_cols, inplace=True)
    
    if df.empty:
        raise ValueError("El archivo no contiene datos válidos para procesar.")

    # 2. Cálculo de Promedios Generales Consolidados
    cal_cols = [col for col in df.columns if col.endswith('_calificacion')]
    asis_cols = [col for col in df.columns if col.endswith('_asistencia')]
    cond_cols = [col for col in df.columns if col.endswith('_conducta')]
    
    df['promedio_gral_calificacion'] = df[cal_cols].mean(axis=1)
    df['promedio_gral_asistencia'] = df[asis_cols].mean(axis=1)
    df['promedio_gral_conducta'] = df[cond_cols].mean(axis=1)
    
    # 3. Métricas Grupales y Estadística
    promedio_general = df['promedio_gral_calificacion'].mean()
    y_scores_group = df['promedio_gral_calificacion'].values
    x_indices_group = range(len(y_scores_group)) 
    area_de_progreso_grupo = trapz(y_scores_group, x_indices_group) if len(df) > 1 else 0.0

    corr_asis = df['promedio_gral_asistencia'].corr(df['promedio_gral_calificacion'])
    corr_cond = df['promedio_gral_conducta'].corr(df['promedio_gral_calificacion'])
    correlaciones = CorrelacionData(
        asistencia_vs_calificacion=corr_asis if not np.isnan(corr_asis) else 0.0,
        conducta_vs_calificacion=corr_cond if not np.isnan(corr_cond) else 0.0
    )

    estadistica_grupal = GrupoEstadistica(
        std_promedio=df['promedio_gral_calificacion'].std() if len(df) > 1 else 0.0,
        std_asistencia=df['promedio_gral_asistencia'].std() if len(df) > 1 else 0.0,
        std_conducta=df['promedio_gral_conducta'].std() if len(df) > 1 else 0.0
    )

    # 4. Análisis Predictivo
    df['riesgo'] = (df['promedio_gral_calificacion'] < 75).astype(int)
    X = df[['promedio_gral_asistencia', 'promedio_gral_conducta', 'promedio_gral_calificacion']]
    y = df['riesgo']
    
    if len(df) >= 10 and len(y.unique()) > 1:
        modelo = LogisticRegression()
        modelo.fit(X, y)
        probabilidades = modelo.predict_proba(X)[:, 1]
    else:
        probabilidades = [df['riesgo'].mean()] * len(df)
    
    df['probabilidad_riesgo'] = probabilidades

    # 5. Métrica Individual
    df = calcular_vector_progreso(df) # Cálculo Vectorial
    df['area_de_progreso'] = df['promedio_gral_calificacion'] * (df['promedio_gral_asistencia'] / 100) 
    
    # Generar Recomendaciones (Punto 7)
    df['recomendacion_pedagogica'] = df.apply(generar_recomendacion, axis=1)

    # 6. Preparar la salida
    df['id'] = range(1, len(df) + 1)
    
    data_list = []
    for index, row in df.iterrows():
        detalle = {}
        for materia in MATERIAS:
            materia_lower = materia.lower()
            detalle[materia] = MateriaMetricas(
                calificacion=row.get(f'{materia_lower}_calificacion', 0.0),
                asistencia=row.get(f'{materia_lower}_asistencia', 0.0),
                conducta=row.get(f'{materia_lower}_conducta', 0.0)
            )
            
        data_list.append(AlumnoData(
            id=row['id'],
            nombre=row['nombre'],
            promedio_gral_calificacion=row['promedio_gral_calificacion'],
            promedio_gral_asistencia=row['promedio_gral_asistencia'],
            promedio_gral_conducta=row['promedio_gral_conducta'],
            detalle_materias=detalle,
            area_de_progreso=row['area_de_progreso'],
            probabilidad_riesgo=row['probabilidad_riesgo'],
            vector_magnitud=row['vector_magnitud'],
            recomendacion_pedagogica=row['recomendacion_pedagogica']
        ))

    return promedio_general, area_de_progreso_grupo, correlaciones, estadistica_grupal, data_list


# --- ENDPOINT PRINCIPAL ---

@app.post("/upload-and-analyze/", response_model=AnalysisResponse)
async def upload_and_analyze(file: UploadFile = File(...)):
    """ Recibe un archivo Excel, lo procesa y ejecuta la analítica avanzada. """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel (.xlsx o .xls)")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        promedio, area_grupo, correlaciones, estadistica_grupal, data_list = procesar_df(df)
        
        return AnalysisResponse(
            message=f"Archivo '{file.filename}' procesado con éxito.",
            promedio_general=round(promedio, 2),
            area_de_progreso_grupo=round(area_grupo, 2),
            correlaciones=correlaciones,
            estadistica_grupal=estadistica_grupal,
            data_preview=data_list
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Error en el formato del archivo: {e}")
    except Exception as e:
        print(f"Error durante el procesamiento: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")