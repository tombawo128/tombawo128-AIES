import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Auto-close sidebar if user resizes window to desktop (width > 800px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app">
      {/* Sidebar passing props */}
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {/* Backdrop/Scrim overlay (only shows on mobile when sidebar is open) */}
      {isSidebarOpen && (
        <button className="scrim" onClick={closeSidebar} aria-label="Close menu" />
      )}

      {/* Main Content Area */}
      <div className="main">
        <header>
          {/* The Burger Menu Button */}
          <button className="mobileMenu" onClick={toggleSidebar}>
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H19M1 8H19M1 15H19" stroke="#23212c" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Header Right Content (Avatar, Notifications, etc.) */}
          <div className="headerRight">
            {/* Paste your existing header right elements here (Avatar / IconButton) */}
          </div>
        </header>

        {/* Where your Dashboard page content renders */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};