import React from 'react';

export const Metric: React.FC<{ label: string; value: string | number; detail: string }> = ({
  label,
  value,
  detail,
}) => (
  <div className="metric">
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{detail}</small>
  </div>
);
