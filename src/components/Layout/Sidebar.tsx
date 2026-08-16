import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabaseClient';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const closeSidebar = () => setOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    closeSidebar();
  };

  const links = [
    { to: '/student/dashboard', label: 'Dashboard', roles: ['student'] },
    { to: '/student/internships', label: 'Internships', roles: ['student'] },
    { to: '/student/applications', label: 'Applications', roles: ['student'] },
    { to: '/student/reports', label: 'Reports', roles: ['student'] },
    { to: '/student/evaluations', label: 'Evaluations', roles: ['student'] },
    { to: '/student/settings', label: 'Settings', roles: ['student'] },

    { to: '/company/dashboard', label: 'Dashboard', roles: ['company'] },
    { to: '/company/internships', label: 'Internships', roles: ['company'] },
    { to: '/company/applications', label: 'Applications', roles: ['company'] },
    { to: '/company/interns', label: 'Interns', roles: ['company'] },
    { to: '/company/evaluations', label: 'Evaluations', roles: ['company'] },
    { to: '/company/settings', label: 'Settings', roles: ['company'] },

    { to: '/university/dashboard', label: 'Dashboard', roles: ['university'] },
    { to: '/university/students', label: 'Students', roles: ['university'] },
    { to: '/university/departments', label: 'Departments', roles: ['university'] },
    { to: '/university/reports', label: 'Reports', roles: ['university'] },
    { to: '/university/evaluations', label: 'Evaluations', roles: ['university'] },
    { to: '/university/settings', label: 'Settings', roles: ['university'] },

    { to: '/admin/dashboard', label: 'Dashboard', roles: ['admin'] },
    { to: '/admin/users', label: 'Users', roles: ['admin'] },
    { to: '/admin/companies', label: 'Companies', roles: ['admin'] },
    { to: '/admin/universities', label: 'Universities', roles: ['admin'] },
    { to: '/admin/reports', label: 'Reports', roles: ['admin'] },
    { to: '/admin/logs', label: 'Logs', roles: ['admin'] },
    { to: '/admin/settings', label: 'Settings', roles: ['admin'] },

  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user?.role || 'student'));

  return (
    <>
      {open && <div className="scrim" onClick={closeSidebar} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <NavLink to="/dashboard" className="brand light" onClick={closeSidebar}>
          <div className="brandMark">AI</div>
          <div>
            <strong>AIES</strong>
            <small>ACADEMIC INTERNSHIPS</small>
          </div>
        </NavLink>

        <div className="role">{user?.role || 'Student'}</div>

        <nav>
          {filteredLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeSidebar}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,.15)',
            color: 'rgba(255,255,255,.7)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 650,
            marginTop: '10px',
            cursor: 'pointer',
          }}
        >
          {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
        </button>

        <button className="sideLogout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </aside>
    </>
  );
};