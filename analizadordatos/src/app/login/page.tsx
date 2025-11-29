'use client';

import React, { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

interface LoginResponse {
    token: string;
    rol: 'Admin' | 'Docente' | 'Alumno' | 'Padre' | string;
    nombre: string;
    id?: number; 
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // CORRECCIÓN 1: Usar la variable de entorno y tipar la respuesta
            const response: AxiosResponse<LoginResponse> = await axios.post(
                `${API_BASE_URL}/auth/login`, // URL Dinámica para Azure/Local
                {
                    email,
                    password,
                }
            );

            // CORRECCIÓN 2: Obtener el ID si el backend lo devuelve (si no, usa el ID estático)
            const { token, rol, nombre, id } = response.data; 

            // Guardar datos
            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', rol);
            localStorage.setItem('userName', nombre);

            // Si el backend no devuelve un ID (como indica tu código), usamos el estático
            const targetId = id || 1; 

            // Redirecciones por rol
            if (rol === 'Admin' || rol === 'Docente') {
                router.push('/dashboard');
            } else if (rol === 'Alumno') {
                router.push(`/dashboard/alumno/${targetId}`);
            } else if (rol === 'Padre') {
                router.push(`/dashboard/padre/${targetId}`);
            }
        } catch (err: unknown) {
            let mensaje = 'Fallo de autenticación. Verifique las credenciales.';
            
            // CORRECCIÓN 3: Reemplazar el 'any' con un tipo seguro (AxiosError)
            if (axios.isAxiosError(err)) {
                // Tipado específico para la respuesta de error de FastAPI
                const axiosErr = err as AxiosError<{ detail?: string }>; 
                mensaje = axiosErr.response?.data?.detail ?? mensaje;
            }
            
            setError(mensaje);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ width: '100%', maxWidth: '650px' }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '32px',
                    boxShadow: '0 30px 80px rgba(76, 127, 174, 0.3)',
                    padding: '100px 80px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '48px',
                    border: '5px solid #4C7FAE'
                }}>
                    {/* HEADER MEJORADO */}
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            backgroundColor: '#4C7FAE',
                            margin: '0 auto',
                            fontSize: '70px',
                            boxShadow: '0 15px 45px rgba(76, 127, 174, 0.5)'
                        }}>
                            📊
                        </div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#4C7FAE', margin: 0, letterSpacing: '-1px' }}>
                            Analítica Inteligente
                        </h1>
                        <p style={{ color: '#3B8CD9', fontSize: '18px', margin: 0, fontWeight: '700' }}>
                            Sistema Predictivo de Rendimiento Académico
                        </p>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label htmlFor="email" style={{ 
                                fontSize: '15px', 
                                fontWeight: '900', 
                                color: '#4C7FAE', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1.5px' 
                            }}>
                                📧 Email Institucional
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@correo.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '20px 24px',
                                    borderRadius: '14px',
                                    border: '4px solid #4C7FAE',
                                    fontSize: '18px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    backgroundColor: '#fafafa',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3B8CD9';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(59, 140, 217, 0.25)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#4C7FAE';
                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label htmlFor="password" style={{ 
                                fontSize: '15px', 
                                fontWeight: '900', 
                                color: '#4C7FAE', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1.5px' 
                            }}>
                                🔒 Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '20px 24px',
                                    borderRadius: '14px',
                                    border: '4px solid #4C7FAE',
                                    fontSize: '18px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    backgroundColor: '#fafafa',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3B8CD9';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(59, 140, 217, 0.25)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#4C7FAE';
                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '14px 18px',
                                borderRadius: '10px',
                                backgroundColor: '#fee2e2',
                                border: '2px solid #fca5a5'
                            }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '22px 32px',
                                borderRadius: '14px',
                                border: 'none',
                                fontWeight: '900',
                                color: '#ffffff',
                                fontSize: '19px',
                                backgroundColor: '#4C7FAE',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.8 : 1,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 10px 35px rgba(76, 127, 174, 0.4)',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#3B8CD9';
                                    e.currentTarget.style.boxShadow = '0 15px 45px rgba(59, 140, 217, 0.5)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#4C7FAE';
                                    e.currentTarget.style.boxShadow = '0 10px 35px rgba(76, 127, 174, 0.4)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        width: '20px', 
                                        height: '20px', 
                                        borderRadius: '50%',
                                        border: '3px solid #ffffff',
                                        borderTopColor: 'transparent',
                                        animation: 'spin 0.6s linear infinite'
                                    }}></span>
                                    Verificando...
                                </span>
                            ) : (
                                '🚀 Ingresar al Sistema'
                            )}
                        </button>
                    </form>

                    {/* CREDENCIALES */}
                    <div style={{ paddingTop: '56px', borderTop: '5px solid #4C7FAE' }}>
                        <p style={{ 
                            fontSize: '14px', 
                            color: '#4C7FAE', 
                            textAlign: 'center', 
                            fontWeight: '900', 
                            margin: 0, 
                            letterSpacing: '2px', 
                            textTransform: 'uppercase',
                            marginBottom: '32px'
                        }}>
                            📋 Credenciales de Prueba
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ 
                                padding: '20px 24px', 
                                backgroundColor: '#4C7FAE15',
                                border: '3px solid #4C7FAE',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#4C7FAE25';
                                e.currentTarget.style.transform = 'translateX(8px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#4C7FAE15';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#4C7FAE', fontSize: '17px' }}>👨‍💼 Admin</div>
                                    <div style={{ fontSize: '13px', color: '#454F59', fontWeight: '600' }}>admin@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '14px', 
                                    color: '#fff', 
                                    backgroundColor: '#4C7FAE', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '800'
                                }}>pass123</span>
                            </div>

                            <div style={{ 
                                padding: '20px 24px', 
                                backgroundColor: '#4F6AB415',
                                border: '3px solid #4F6AB4',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#4F6AB425';
                                e.currentTarget.style.transform = 'translateX(8px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#4F6AB415';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#4F6AB4', fontSize: '17px' }}>👨‍🏫 Docente</div>
                                    <div style={{ fontSize: '13px', color: '#454F59', fontWeight: '600' }}>docente@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '14px', 
                                    color: '#fff', 
                                    backgroundColor: '#4F6AB4', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '800'
                                }}>pass123</span>
                            </div>

                            <div style={{ 
                                padding: '20px 24px', 
                                backgroundColor: '#3B8CD915',
                                border: '3px solid #3B8CD9',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3B8CD925';
                                e.currentTarget.style.transform = 'translateX(8px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#3B8CD915';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#3B8CD9', fontSize: '17px' }}>👨‍🎓 Alumno</div>
                                    <div style={{ fontSize: '13px', color: '#454F59', fontWeight: '600' }}>alumno@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '14px', 
                                    color: '#fff', 
                                    backgroundColor: '#3B8CD9', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '800'
                                }}>pass123</span>
                            </div>

                            <div style={{ 
                                padding: '20px 24px', 
                                backgroundColor: '#9c27b015',
                                border: '3px solid #9c27b0',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#9c27b025';
                                e.currentTarget.style.transform = 'translateX(8px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#9c27b015';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#9c27b0', fontSize: '17px' }}>👨‍👩‍👧 Padre</div>
                                    <div style={{ fontSize: '13px', color: '#454F59', fontWeight: '600' }}>padre@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '14px', 
                                    color: '#fff', 
                                    backgroundColor: '#9c27b0', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '800'
                                }}>pass123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;