# database.py

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, DECIMAL
from datetime import datetime
from typing import List
from fastapi import Depends
from sqlalchemy.future import select
import os

# Leer credenciales de variables de entorno
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "analisis_academico")
DB_PORT = os.environ.get("DB_PORT", "3306")

# Construir URL de MySQL
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
SessionLocal = AsyncSessionLocal  # Alias para compatibilidad

class Base(AsyncAttrs, DeclarativeBase):
    pass

# --- MODELOS ORM (CORREGIDOS) ---

class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = Column(Integer, primary_key=True)
    email: Mapped[str] = Column(String(100), unique=True, index=True) 
    password_hash: Mapped[str] = Column(String(255))
    rol: Mapped[str] = Column(String(50))
    nombre: Mapped[str] = Column(String(100))

class AlumnoDB(Base):
    __tablename__ = "alumnos"
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = Column(String(150), index=True)
    grupo_tag = Column(String(50)) 
    
    notas: Mapped[List["NotaDB"]] = relationship("NotaDB", back_populates="alumno", lazy="joined")
    resultados: Mapped[List["AnalisisResultadoDB"]] = relationship("AnalisisResultadoDB", back_populates="alumno", lazy="joined")

class NotaDB(Base):
    __tablename__ = "notas"
    id: Mapped[int] = Column(Integer, primary_key=True)
    alumno_id: Mapped[int] = Column(Integer, ForeignKey("alumnos.id"))
    
    nombre_alumno = Column(String(50)) # <--- ¡CAMPO AÑADIDO PARA COINCIDIR CON MYSQL!
    
    materia = Column(String(50))
    tema = Column(String(100))
    calificacion = Column(DECIMAL(5, 2)) # CRÍTICO: Aumentado a (5, 2)
    asistencia_pct = Column(DECIMAL(5, 2)) # Aumentado a (5, 2)
    conducta_pct = Column(DECIMAL(5, 2)) # Aumentado a (5, 2)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    alumno = relationship("AlumnoDB", back_populates="notas")

class AnalisisResultadoDB(Base):
    __tablename__ = "analisis_resultado"
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    grupo_tag = Column(String(50), nullable=False)
    
    nombre_alumno = Column(String(150)) # Coincide con el nombre del alumno
    
    probabilidad_riesgo = Column(DECIMAL(4, 3), nullable=False)
    vector_magnitud = Column(DECIMAL(6, 3), nullable=False)
    area_de_progreso = Column(DECIMAL(6, 3))
    materia_critica_temprana = Column(String(100))
    recomendacion_pedagogica = Column(String(500))
    fecha_analisis = Column(DateTime, default=datetime.utcnow)
    
    alumno = relationship("AlumnoDB", back_populates="resultados")


# --- FUNCIONES DE BASE DE DATOS ---

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db_user():
    from sqlalchemy.exc import NoResultFound
    
    try:
        async with AsyncSessionLocal() as session:
            try:
                stmt = select(Usuario).where(Usuario.email == "admin@escuela.edu")
                result = await session.execute(stmt)
                user = result.scalar_one_or_none()
                
                if user is None:
                    usuarios_prueba = [
                        Usuario(email="admin@escuela.edu", password_hash="pass123", rol="Admin", nombre="Admin Superior"),
                        Usuario(email="docente@escuela.edu", password_hash="pass123", rol="Docente", nombre="Mtra. Elena"),
                        Usuario(email="alumno@escuela.edu", password_hash="pass123", rol="Alumno", nombre="Alumno Test"),
                    Usuario(email="padre@escuela.edu", password_hash="pass123", rol="Padre", nombre="Padre de Familia"),
                ]
                session.add_all(usuarios_prueba)
                await session.commit()
            
            except Exception as e:
                print(f"Error durante la inicialización de usuario: {e}")
    except Exception as e:
        print(f"Warning: No se pudo conectar a la base de datos al iniciar: {e}")
        print("La aplicación continuará, la BD se conectará cuando sea necesario.")
            raise