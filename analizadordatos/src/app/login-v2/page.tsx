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

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || '';
};

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
            const response: AxiosResponse<LoginResponse> = await axios.post(
                `/auth/login`,
                { email, password }
            );

            const { token, rol, nombre, id } = response.data; 

            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', rol);
            localStorage.setItem('userName', nombre);

            const targetId = id || 1; 

            if (rol === 'Admin' || rol === 'Docente') {
                router.push('/dashboard');
            } else if (rol === 'Alumno') {
                router.push(`/dashboard/alumno/${targetId}`);
            } else if (rol === 'Padre') {
                router.push(`/dashboard/padre/${targetId}`);
            }
        } catch (err: unknown) {
            let mensaje = 'Fallo de autenticación. Verifique las credenciales.';
            
            if (axios.isAxiosError(err)) {
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
            <div style={{ width: '100%', maxWidth: '700px' }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '40px',
                    boxShadow: '0 40px 100px rgba(76, 127, 174, 0.35)',
                    padding: '120px 100px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '56px',
                    border: '6px solid #4C7FAE'
                }}>
                    {/* HEADER */}
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            backgroundColor: '#4C7FAE',
                            margin: '0 auto',
                            fontSize: '90px',
                            boxShadow: '0 20px 60px rgba(76, 127, 174, 0.6)'
                        }}>
                            📊
                        </div>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#4C7FAE', margin: 0, letterSpacing: '-1.5px' }}>
                            Analítica Inteligente
                        </h1>
                        <p style={{ color: '#3B8CD9', fontSize: '20px', margin: 0, fontWeight: '700' }}>
                            Sistema Predictivo de Rendimiento Académico
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <label htmlFor="email" style={{ 
                                fontSize: '17px', 
                                fontWeight: '900', 
                                color: '#4C7FAE', 
                                textTransform: 'uppercase', 
                                letterSpacing: '2px' 
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
                                    padding: '24px 28px',
                                    borderRadius: '16px',
                                    border: '5px solid #4C7FAE',
                                    fontSize: '20px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    backgroundColor: '#fafafa',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3B8CD9';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.boxShadow = '0 0 0 8px rgba(59, 140, 217, 0.3)';
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <label htmlFor="password" style={{ 
                                fontSize: '17px', 
                                fontWeight: '900', 
                                color: '#4C7FAE', 
                                textTransform: 'uppercase', 
                                letterSpacing: '2px' 
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
                                    padding: '24px 28px',
                                    borderRadius: '16px',
                                    border: '5px solid #4C7FAE',
                                    fontSize: '20px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    backgroundColor: '#fafafa',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3B8CD9';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.boxShadow = '0 0 0 8px rgba(59, 140, 217, 0.3)';
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
                                padding: '18px 24px',
                                borderRadius: '12px',
                                backgroundColor: '#fee2e2',
                                border: '3px solid #fca5a5'
                            }}>
                                <p style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '28px 40px',
                                borderRadius: '16px',
                                border: 'none',
                                fontWeight: '900',
                                color: '#ffffff',
                                fontSize: '22px',
                                backgroundColor: '#4C7FAE',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.8 : 1,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 12px 40px rgba(76, 127, 174, 0.45)',
                                letterSpacing: '1.2px'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#3B8CD9';
                                    e.currentTarget.style.boxShadow = '0 18px 55px rgba(59, 140, 217, 0.6)';
                                    e.currentTarget.style.transform = 'scale(1.06)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#4C7FAE';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(76, 127, 174, 0.45)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        width: '24px', 
                                        height: '24px', 
                                        borderRadius: '50%',
                                        border: '4px solid #ffffff',
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

                    {/* CREDENTIALS */}
                    <div style={{ paddingTop: '64px', borderTop: '6px solid #4C7FAE' }}>
                        <p style={{ 
                            fontSize: '16px', 
                            color: '#4C7FAE', 
                            textAlign: 'center', 
                            fontWeight: '900', 
                            margin: 0, 
                            letterSpacing: '2.5px', 
                            textTransform: 'uppercase',
                            marginBottom: '40px'
                        }}>
                            📋 Credenciales de Prueba
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ 
                                padding: '24px 32px', 
                                backgroundColor: '#4C7FAE15',
                                border: '4px solid #4C7FAE',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#4C7FAE25';
                                e.currentTarget.style.transform = 'translateX(10px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#4C7FAE15';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#4C7FAE', fontSize: '19px' }}>👨‍💼 Admin</div>
                                    <div style={{ fontSize: '15px', color: '#454F59', fontWeight: '700' }}>admin@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '16px', 
                                    color: '#fff', 
                                    backgroundColor: '#4C7FAE', 
                                    padding: '10px 20px', 
                                    borderRadius: '10px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '900'
                                }}>pass123</span>
                            </div>

                            <div style={{ 
                                padding: '24px 32px', 
                                backgroundColor: '#4F6AB415',
                                border: '4px solid #4F6AB4',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#4F6AB425';
                                e.currentTarget.style.transform = 'translateX(10px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#4F6AB415';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#4F6AB4', fontSize: '19px' }}>👨‍🏫 Docente</div>
                                    <div style={{ fontSize: '15px', color: '#454F59', fontWeight: '700' }}>docente@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '16px', 
                                    color: '#fff', 
                                    backgroundColor: '#4F6AB4', 
                                    padding: '10px 20px', 
                                    borderRadius: '10px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '900'
                                }}>pass123</span>
                            </div>

                            <div style={{ 
                                padding: '24px 32px', 
                                backgroundColor: '#3B8CD915',
                                border: '4px solid #3B8CD9',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3B8CD925';
                                e.currentTarget.style.transform = 'translateX(10px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#3B8CD915';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#3B8CD9', fontSize: '19px' }}>👨‍🎓 Alumno</div>
                                    <div style={{ fontSize: '15px', color: '#454F59', fontWeight: '700' }}>alumno@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '16px', 
                                    color: '#fff', 
                                    backgroundColor: '#3B8CD9', 
                                    padding: '10px 20px', 
                                    borderRadius: '10px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '900'
                                }}>pass123</span>
                            </div>

                            <div style={{ 
                                padding: '24px 32px', 
                                backgroundColor: '#9c27b015',
                                border: '4px solid #9c27b0',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#9c27b025';
                                e.currentTarget.style.transform = 'translateX(10px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#9c27b015';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#9c27b0', fontSize: '19px' }}>👨‍👩‍👧 Padre</div>
                                    <div style={{ fontSize: '15px', color: '#454F59', fontWeight: '700' }}>padre@escuela.edu</div>
                                </div>
                                <span style={{ 
                                    fontSize: '16px', 
                                    color: '#fff', 
                                    backgroundColor: '#9c27b0', 
                                    padding: '10px 20px', 
                                    borderRadius: '10px', 
                                    fontFamily: 'monospace', 
                                    fontWeight: '900'
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
