import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';
import { Icon } from '../Icon';
import { Role } from '../../types';

const navs: Record<Role, { label: string; path: string; icon: string }[]> = {
  student: [
    ['Dashboard', '/student/dashboard', 'grid'],
    ['Internships', '/student/internships', 'briefcase'],
    ['Applications', '/student/applications', 'file'],
    ['Reports', '/student/reports', 'file'],
    ['Evaluations', '/student/evaluations', 'chart'],
    ['Settings', '/student/settings', 'settings'],
  ].map(([label, path, icon]) => ({ label, path, icon })),
  company: [
    ['Dashboard', '/company/dashboard', 'grid'],
    ['Internships', '/company/internships', 'briefcase'],
    ['Applications', '/company/applications', 'users'],
    ['Interns', '/company/interns', 'users'],
    ['Evaluations', '/company/evaluations', 'chart'],
    ['Settings', '/company/settings', 'settings'],
  ].map(([label, path, icon]) => ({ label, path, icon })),
  university: [
    ['Dashboard', '/university/dashboard', 'grid'],
    ['Students', '/university/students', 'users'],
    ['Departments', '/university/departments', 'file'],
    ['Supervisors', '/university/supervisors', 'users'],
    ['Reports', '/university/reports', 'file'],
    ['Settings', '/university/settings', 'settings'],
  ].map(([label, path, icon]) => ({ label, path, icon })),
  academicSupervisor: [
    ['Dashboard', '/supervisor-academic/dashboard', 'grid'],
    ['Students', '/supervisor-academic/students', 'users'],
    ['Reports', '/supervisor-academic/reports', 'file'],
    ['Settings', '/supervisor-academic/settings', 'settings'],
  ].map(([label, path, icon]) => ({ label, path, icon })),
  companySupervisor: [
    ['Dashboard', '/supervisor-company/dashboard', 'grid'],
    ['Interns', '/supervisor-company/interns', 'users'],
    ['Evaluations', '/supervisor-company/evaluations', 'chart'],
    ['Settings', '/supervisor-company/settings', 'settings'],
  ].map(([label, path, icon]) => ({ label, path, icon })),
  admin: [
    ['Dashboard', '/admin/dashboard', 'grid'],
    ['Users', '/admin/users', 'users'],
    ['Companies', '/admin/companies', 'briefcase'],
    ['Universities', '/admin/universities', 'file'],
    ['Audit Log', '/admin/logs', 'file'],
    ['Settings', '/admin/settings', 'settings'],
  ].map(([label, path, icon]) => ({ label, path, icon })),
};

export const Sidebar: React.FC<{ open: boolean; setOpen: (v: boolean) => void }> = ({
  open,
  setOpen,
}) => {
  const { user, logout } = useApp();
  if (!user) return null;
  const roleLabel = (r: Role) =>
    ({
      student: 'Student',
      company: 'Company',
      university: 'University',
      academicSupervisor: 'Academic Supervisor',
      companySupervisor: 'Company Supervisor',
      admin: 'Administrator',
    }[r]);

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Logo light />
      <div className="role">{roleLabel(user.role)}</div>
      <nav>
        {navs[user.role].map((n) => (
          <NavLink
            key={n.path}
            to={n.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setOpen(false)}
          >
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        className="sideLogout"
        onClick={logout}
      >
        <Icon name="logout" />
        Sign out
      </button>
    </aside>
  );
};