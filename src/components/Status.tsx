import React from 'react';

export const Status: React.FC<{ value: string }> = ({ value }) => {
  const className = `status ${value.toLowerCase().replace(/\s/g, '-')}`;
  return <span className={className}>{value}</span>;
};
