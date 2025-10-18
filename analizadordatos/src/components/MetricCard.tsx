// src/components/MetricCard.tsx
import React from "react";

const MetricCard = ({ titulo, valor }: { titulo: string; valor: string }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 text-center">
    <h2 className="text-gray-500 text-sm">{titulo}</h2>
    <p className="text-2xl font-semibold text-blue-600">{valor}</p>
  </div>
);

export default MetricCard;