// src/components/DynamicVectorialGraph.tsx
import dynamic from 'next/dynamic';
import { Alumno } from '@/lib/analytics';


const DynamicPlot = dynamic(() => import('./VectorialGraph'), {
    ssr: false, // ¡LA CLAVE! Desactiva el renderizado del lado del servidor
    loading: () => <p className="text-center text-gray-500 p-8">Cargando gráfico vectorial...</p>,
});

interface DynamicVectorialGraphProps {
    data: Alumno[];
    std_promedio: number;
}

const DynamicVectorialGraph: React.FC<DynamicVectorialGraphProps> = (props) => {
    return <DynamicPlot {...props} />;
};

export default DynamicVectorialGraph;