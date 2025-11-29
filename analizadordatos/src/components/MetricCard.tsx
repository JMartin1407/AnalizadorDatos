// src/components/MetricCard.tsx
import React from "react";
import { colorPalette } from "@/lib/theme";

const MetricCard = ({ titulo, valor }: { titulo: string; valor: string }) => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '16px',
    textAlign: 'center',
    borderTop: `4px solid ${colorPalette.primary1}`
  }}>
    <h2 style={{ color: colorPalette.primary4, fontSize: '14px', margin: '0 0 8px 0' }}>{titulo}</h2>
    <p style={{ fontSize: '24px', fontWeight: '600', color: colorPalette.primary3, margin: 0 }}>{valor}</p>
  </div>
);

export default MetricCard;