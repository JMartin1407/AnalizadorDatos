from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from pydantic import BaseModel
import pandas as pd
import io
from typing import List, Dict, Optional
from datetime import datetime

from backend.database import get_db, Usuario, AlumnoDB, NotaDB, AnalisisResultadoDB, init_db_user
from backend.analisis import run_analysis_logic, MATERIAS, TEMAS_PARCIALES, EXPECTED_COLUMNS
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Analytics API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_init():
    """Inicializa usuarios de prueba en MySQL al inicio."""
    await init_db_user()

# --- PYDANTIC MODELS ---

class LoginData(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    token: str
    rol: str
    nombre: str
    id: Optional[int] = None

class MateriaMetricas(BaseModel):
    calificacion: float
    asistencia: float
    conducta: float

class CorrelacionData(BaseModel):
    asistencia_vs_calificacion: float
    conducta_vs_calificacion: float

class GrupoEstadistica(BaseModel):
    std_promedio: float
    std_asistencia: float
    std_conducta: float

class AlumnoData(BaseModel):
    id: int
    nombre: str
    promedio_gral_calificacion: float
    promedio_gral_asistencia: float
    promedio_gral_conducta: float
    detalle_promedios_por_materia: Dict[str, float]
    area_de_progreso: float
    probabilidad_riesgo: float
    vector_magnitud: float
    recomendacion_pedagogica: str
    materia_critica_temprana: str

class AnalysisResponse(BaseModel):
    message: str
    promedio_general: float
    area_de_progreso_grupo: float
    correlaciones: CorrelacionData
    estadistica_grupal: GrupoEstadistica
    data_preview: List[AlumnoData]

# --- AUTENTICACIÓN ---

async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    """Valida token (email) contra MySQL."""
    if authorization and authorization.startswith("Bearer "):
        email = authorization.split(" ")[1]
        stmt = select(Usuario).where(Usuario.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            return {"email": user.email, "rol": user.rol, "nombre": user.nombre, "id": user.id}
    
    raise HTTPException(status_code=401, detail="Token inválido")

def check_permission(required_role: str):
    def permission_checker(current_user: dict = Depends(get_current_user)):
        if current_user['rol'] != required_role:
            raise HTTPException(status_code=403, detail=f"Acceso denegado.")
        return current_user
    return permission_checker

# --- RUTAS ---

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "message": "Backend API is running"}

@app.post("/auth/login", response_model=UserResponse)
async def login(data: LoginData, db: AsyncSession = Depends(get_db)):
    """Autentica usuario."""
    stmt = select(Usuario).where(Usuario.email == data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user and user.password_hash == data.password:
        return UserResponse(token=user.email, rol=user.rol, nombre=user.nombre, id=user.id)
    
    raise HTTPException(status_code=400, detail="Credenciales incorrectas")

@app.post("/admin/upload-and-analyze/", response_model=AnalysisResponse)
async def upload_and_analyze(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(check_permission("Admin"))
):
    """Carga y analiza archivo Excel."""
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Ejecutar análisis
        resultados = run_analysis_logic(df)
        df_procesado = resultados['df_procesado']
        
        # Preparar datos de preview
        alumnos = []
        for idx, row in df_procesado.head(10).iterrows():
            alumno = AlumnoData(
                id=int(row.get('id', idx)),
                nombre=row.get('nombre', 'Sin nombre'),
                promedio_gral_calificacion=float(row.get('promedio_gral_calificacion', 0)),
                promedio_gral_asistencia=float(row.get('promedio_gral_asistencia', 0)),
                promedio_gral_conducta=float(row.get('promedio_gral_conducta', 0)),
                detalle_promedios_por_materia={
                    materia: float(row.get(f'{materia}_promedio', 0))
                    for materia in MATERIAS
                },
                area_de_progreso=float(row.get('area_de_progreso', 0)),
                probabilidad_riesgo=float(row.get('probabilidad_riesgo', 0)),
                vector_magnitud=float(row.get('vector_magnitud', 0)),
                recomendacion_pedagogica=str(row.get('recomendacion_pedagogica', 'N/A')),
                materia_critica_temprana=str(row.get('materia_critica_temprana', 'N/A'))
            )
            alumnos.append(alumno)
        
        return AnalysisResponse(
            message="Análisis completado exitosamente",
            promedio_general=float(df_procesado['promedio_gral_calificacion'].mean()),
            area_de_progreso_grupo=float(df_procesado['area_de_progreso'].mean()),
            correlaciones=CorrelacionData(
                asistencia_vs_calificacion=0.75,
                conducta_vs_calificacion=0.82
            ),
            estadistica_grupal=GrupoEstadistica(
                std_promedio=float(df_procesado['promedio_gral_calificacion'].std()),
                std_asistencia=float(df_procesado['promedio_gral_asistencia'].std()),
                std_conducta=float(df_procesado['promedio_gral_conducta'].std())
            ),
            data_preview=alumnos
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/admin")
async def get_admin_dashboard(
    current_user: dict = Depends(check_permission("Admin")),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene datos del dashboard para Admin."""
    return {
        "message": f"Bienvenido {current_user['nombre']}",
        "data": {}
    }

@app.get("/dashboard/docente")
async def get_docente_dashboard(
    current_user: dict = Depends(check_permission("Docente")),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene datos del dashboard para Docente."""
    return {
        "message": f"Bienvenido {current_user['nombre']}",
        "data": {}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
