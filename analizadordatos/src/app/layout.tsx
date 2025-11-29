// src/app/layout.tsx
import './globals.css'; // Importa tus estilos de Tailwind/CSS
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analizador Inteligente Académico',
  description: 'Análisis predictivo de calificaciones, conducta y asistencia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ backgroundColor: '#f5f5f5', margin: 0, padding: 0 }}>
        {}
        {children}
      </body>
    </html>
  );
}