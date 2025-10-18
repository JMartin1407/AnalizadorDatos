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
      <body>
        {/* Aquí puedes agregar headers, footers, o providers */}
        {children}
      </body>
    </html>
  );
}