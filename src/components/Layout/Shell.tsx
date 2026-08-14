import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Link } from 'react-router-dom';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar open={open} setOpen={setOpen} />
      {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <main className="main">
        <Header setOpen={setOpen} />
        <div className="content">
          {children}
          <footer>
            <span>AIES, African Internship & Employability System</span>
            <span>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
};