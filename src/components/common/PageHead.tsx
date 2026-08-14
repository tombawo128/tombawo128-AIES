import React from 'react';

export const PageHead: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, description, action }) => (
  <div className="pageHead">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="muted">{description}</p>}
    </div>
    {action}
  </div>
);