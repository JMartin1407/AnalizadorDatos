// src/components/LogoutButton.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const LogoutButton: React.FC = () => {
    const router = useRouter();

    const handleLogout = () => {
    
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        
        router.push('/');
    };

    return (
        <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
        >
            Cerrar Sesión
        </button>
    );
};

export default LogoutButton;