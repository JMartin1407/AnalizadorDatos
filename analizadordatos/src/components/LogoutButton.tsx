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
            style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#d32f2f',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d32f2f')}
        >
            Cerrar Sesión
        </button>
    );
};

export default LogoutButton;