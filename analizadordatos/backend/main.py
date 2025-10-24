# main.py

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from pydantic import BaseModel
import pandas as pd
import io
from typing import List, Dict, Union
from datetime import datetime

# --- Importaciones de Módulos Locales (Arquitectura Modular) ---
from database import get_db, Usuario, AlumnoDB, NotaDB, AnalisisResultadoDB, init_db_user
from analisis import run_analysis_logic, MATERIAS, TEMAS_PARCIALES, EXPECTED_COLUMNS
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette.middleware.cors import CORSMiddleware

# --- CONFIGURACIÓN DE FASTAPI ---
app = FastAPI(title="Smart Analytics API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_init():
    """Ejecuta la inicialización de usuarios de prueba en MySQL al inicio."""
    await init_db_user()

# --- INTERFACES (Pydantic models) ---

class LoginData(BaseModel): email: str; password: str
class UserResponse(BaseModel): token: str; rol: str; nombre: str

# Modelos de datos para la respuesta del análisis (deben coincidir con analytics.ts)
class MateriaMetricas(BaseModel): calificacion: float; asistencia: float; conducta: float
class CorrelacionData(BaseModel): asistencia_vs_calificacion: float; conducta_vs_calificacion: float
class GrupoEstadistica(BaseModel): std_promedio: float; std_asistencia: float; std_conducta: float

class AlumnoData(BaseModel):
    id: int; nombre: str; promedio_gral_calificacion: float; promedio_gral_asistencia: float; promedio_gral_conducta: float
    detalle_materias: Dict[str, MateriaMetricas]; area_de_progreso: float; probabilidad_riesgo: float 
    vector_magnitud: float; recomendacion_pedagogica: str; materia_critica_temprana: str

class AnalysisResponse(BaseModel):
    message: str; promedio_general: float; area_de_progreso_grupo: float; correlaciones: CorrelacionData
    estadistica_grupal: GrupoEstadistica; data_preview: List[AlumnoData]

# --- SEGURIDAD Y AUTENTICACIÓN ---

async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    """Valida el token (email) contra MySQL y devuelve el objeto Usuario."""
    if authorization and authorization.startswith("Bearer "):
        email = authorization.split(" ")[1]
        
        stmt = select(Usuario).where(Usuario.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user: 
            return {"email": user.email, "rol": user.rol, "nombre": user.nombre}
    
    raise HTTPException(status_code=401, detail="Token inválido o no autenticado.")

def check_permission(required_role: str):
    """Función para inyectar la dependencia de permiso en las rutas."""
    def permission_checker(current_user: dict = Depends(get_current_user)):
        if current_user['rol'] != required_role:
            raise HTTPException(status_code=403, detail=f"Acceso denegado. Rol '{current_user['rol']}' no autorizado.")
        return current_user
    return permission_checker

# --- RUTAS DE AUTENTICACIÓN ---

@app.post("/auth/login", response_model=UserResponse)
async def login(data: LoginData, db: AsyncSession = Depends(get_db)):
    """Ruta para autenticar al usuario y devolver el token/rol."""
    stmt = select(Usuario).where(Usuario.email == data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user and user.password_hash == data.password:
        return UserResponse(token=user.email, rol=user.rol, nombre=user.nombre)
    
    raise HTTPException(status_code=400, detail="Credenciales incorrectas.")

# --- RUTA PRINCIPAL DE INGESTA Y ANÁLISIS (PROTEGIDA POR ADMIN) ---

@app.post("/admin/upload-and-analyze/", response_model=AnalysisResponse)
async def upload_and_analyze(
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(check_permission("Admin"))
):
    
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))
    
    # 1. EJECUTAR ANÁLISIS
    resultados = run_analysis_logic(df)
    df_procesado = resultados['df_procesado']
    
    # 2. VALIDACIÓN (Comprobación de columnas en minúsculas)
    df_procesado.columns = df_procesado.columns.str.lower()
    missing_cols = [col for col in EXPECTED_COLUMNS if col not in df_procesado.columns]
    if missing_cols:
         raise HTTPException(status_code=400, detail=f"Faltan columnas esenciales: {missing_cols[:3]}.")

    # 3. PERSISTENCIA (ETL - Cargar los resultados en MySQL)
    tag = f"Carga_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    for index, row in df_procesado.iterrows():
        
        # a. Guardar en ALUMNO
        nuevo_alumno = AlumnoDB(nombre=row['nombre'], grupo_tag=tag)
        db.add(nuevo_alumno)
        await db.flush() # Obtiene el ID
        
        # b. Guardar en ANALISIS_RESULTADO
        resultado_final = AnalisisResultadoDB(
            alumno_id=nuevo_alumno.id,
            grupo_tag=tag,
            nombre_alumno=row['nombre'], 
            probabilidad_riesgo=row['probabilidad_riesgo'],
            vector_magnitud=row['vector_magnitud'],
            area_de_progreso=row['area_de_progreso'],
            materia_critica_temprana=row['materia_critica_temprana'],
            recomendacion_pedagogica=row['recomendacion_pedagogica']
        )
        db.add(resultado_final)
        
        # c. Guardar en NOTAS (Iterar sobre las 54 columnas de tema/trabajo)
        for materia in MATERIAS:
            for tema_index, tema in enumerate(TEMAS_PARCIALES):
                 db.add(NotaDB(
                    alumno_id=nuevo_alumno.id,
                    # --- CORRECCIÓN CRÍTICA: AGREGAR nombre_alumno ---
                    nombre_alumno=row['nombre'],
                    # ------------------------------------------------
                    materia=materia,
                    tema=f"Tema_{tema_index+1}",
                    calificacion=row.get(f'{materia.lower()}_cal_t{tema_index+1}', 0.0),
                    asistencia_pct=row['promedio_gral_asistencia'], 
                    conducta_pct=row['promedio_gral_conducta']
                ))

    await db.commit()
    
    # 4. Respuesta Final 
    data_list = []
    for index, row in df_procesado.iterrows():
        detalle_materias = {}
        for materia in MATERIAS:
            detalle_materias[materia] = MateriaMetricas(
                calificacion=row.get(f'{materia.lower()}_cal_t1', 0.0),
                asistencia=row['promedio_gral_asistencia'],
                conducta=row['promedio_gral_conducta']
            )

        data_list.append(AlumnoData(
            id=row['id'], nombre=row['nombre'], promedio_gral_calificacion=row['promedio_gral_calificacion'],
            promedio_gral_asistencia=row['promedio_gral_asistencia'], promedio_gral_conducta=row['promedio_gral_conducta'],
            detalle_materias=detalle_materias, area_de_progreso=row['area_de_progreso'], probabilidad_riesgo=row['probabilidad_riesgo'],
            vector_magnitud=row['vector_magnitud'], recomendacion_pedagogica=row['recomendacion_pedagogica'], materia_critica_temprana=row['materia_critica_temprana']
        ))
    
    return AnalysisResponse(
        message=f"Análisis completado y guardado por {current_user['nombre']} ({current_user['email']}).",
        promedio_general=round(resultados['promedio_general'], 2),
        area_de_progreso_grupo=round(resultados['area_de_progreso_grupo'], 2),
        correlaciones=resultados['correlaciones'],
        estadistica_grupal=resultados['estadistica_grupal'],
        data_preview=data_list
    )