// src/app/login.tsx
'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apiazuremsc-anhefqf5gzepdcav.mexicocentral-01.azurewebsites.net';
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, rol, nombre } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', rol);
            localStorage.setItem('userName', nombre); 
            
            const SIMULATED_ALUMNO_ID = 1; 

            if (rol === 'Admin' || rol === 'Docente') {
                router.push('/dashboard');
            } else if (rol === 'Alumno') {

                router.push(`/dashboard/alumno/${SIMULATED_ALUMNO_ID}`); 
            } else if (rol === 'Padre') {

                router.push(`/dashboard/padre/${SIMULATED_ALUMNO_ID}`); 
            }

        } catch (e: any) {
            setError(e.response?.data?.detail || 'Fallo de autenticación. Verifique las credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
                
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-blue-700">
                        Analítica Inteligente
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Ingresa con tus credenciales
                    </p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email institucional"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        />
                    </div>
                    
                    {error && (
                        <div className="text-center text-sm font-medium text-red-600 bg-red-50 p-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition duration-150"
                    >
                        {loading ? 'Verificando...' : 'Ingresar al Sistema'}
                    </button>
                </form>
                
                <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
                    <p>Roles de prueba:</p>
                    <p className="font-semibold">Admin/Docente: email/contraseña | Alumno/Padre: email/contraseña</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;