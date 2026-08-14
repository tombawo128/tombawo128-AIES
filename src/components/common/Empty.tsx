import React from 'react';
import { Icon } from '../Icon';

export const Empty: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="empty">
    <div className="emptyIcon">
      <Icon name="file" />
    </div>
    <strong>{title}</strong>
    <p>{text}</p>
  </div>
);