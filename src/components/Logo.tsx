import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <Link to="/login" className={`brand ${light ? 'light' : ''}`}>
    <span className="brandMark">A</span>
    <span>
      <strong>AIES</strong>
      <small>INTERNSHIP & EMPLOYABILITY</small>
    </span>
  </Link>
);
