// src/app/page.tsx

import Dashboard from '@/app/dashboard/page';

// Este componente sirve como la página principal de tu aplicación (ruta '/')
// Simplemente renderiza tu componente Dashboard.
export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}