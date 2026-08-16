import React, { useState, useEffect } from 'react';
import { Role } from './types';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Protected } from './components/protected';
import { Sidebar } from './components/Layout/Sidebar';

// Shared pages
import { Login } from './pages/shared/Login';
import { Register } from './pages/shared/Register';
import { Forgot } from './pages/shared/Forgot';
import { Legal } from './pages/shared/Legal';

// Student
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentInternships } from './pages/student/Internships';
import { StudentApplications } from './pages/student/Applications';
import { StudentReports } from './pages/student/Reports';
import { StudentEvaluations } from './pages/student/Evaluations';
import { StudentSettings } from './pages/student/Settings';

// Company
import { CompanyDashboard } from './pages/company/Dashboard';
import { CompanyInternships } from './pages/company/Internships';
import { CompanyApplications } from './pages/company/Applications';
import { CompanyInterns } from './pages/company/Interns';
import { CompanyEvaluations } from './pages/company/Evaluations';
import { CompanySettings } from './pages/company/Settings';

// University
import { UniversityDashboard } from './pages/university/Dashboard';
import { UniversityStudents } from './pages/university/Students';
import { UniversityDepartments } from './pages/university/Departments';
import { UniversityReports } from './pages/university/Reports';
import { UniversitySettings } from './pages/university/Settings';
import { UniversityEvaluations } from './pages/university/Evaluations';


// Admin
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminUserDetail } from './pages/admin/UserDetail';
import { AdminCompanies } from './pages/admin/Companies';
import { AdminUniversities } from './pages/admin/Universities';
import { AdminSettings } from './pages/admin/Settings';
import { AdminLogs } from './pages/admin/Logs';
import { AdminReports } from './pages/admin/Reports';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app">
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {isSidebarOpen && (
        <button className="scrim" onClick={closeSidebar} aria-label="Close menu" />
      )}

      <div className="main">
        <header>
          <button className="mobileMenu" onClick={toggleSidebar}>
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H19M1 8H19M1 15H19" stroke="#23212c" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="headerRight"></div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

interface ProtectedShellProps {
  roles: Role[];
  children: React.ReactNode;
}

const ProtectedShell = ({ roles, children }: ProtectedShellProps) => (
  <Protected roles={roles}>
    <MainLayout>{children}</MainLayout>
  </Protected>
);

const App = () => {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal terms />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/student/*"
          element={
            <ProtectedShell roles={['student']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="internships" element={<StudentInternships />} />
                <Route path="applications" element={<StudentApplications />} />
                <Route path="reports" element={<StudentReports />} />
                <Route path="evaluations" element={<StudentEvaluations />} />
                <Route path="settings" element={<StudentSettings />} />
              </Routes>
            </ProtectedShell>
          }
        />

        <Route
          path="/company/*"
          element={
            <ProtectedShell roles={['company']}>
              <Routes>
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="internships" element={<CompanyInternships />} />
                <Route path="applications" element={<CompanyApplications />} />
                <Route path="interns" element={<CompanyInterns />} />
                <Route path="evaluations" element={<CompanyEvaluations />} />
                <Route path="settings" element={<CompanySettings />} />
              </Routes>
            </ProtectedShell>
          }
        />

        <Route
          path="/university/*"
          element={
            <ProtectedShell roles={['university']}>
              <Routes>
                <Route path="dashboard" element={<UniversityDashboard />} />
                <Route path="students" element={<UniversityStudents />} />
                <Route path="departments" element={<UniversityDepartments />} />
                <Route path="reports" element={<UniversityReports />} />
                <Route path="settings" element={<UniversitySettings />} />
                <Route path="evaluations" element={<UniversityEvaluations />} />
              </Routes>
            </ProtectedShell>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedShell roles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="user/:id" element={<AdminUserDetail />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="universities" element={<AdminUniversities />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reports" element={<AdminReports />} />
              </Routes>
            </ProtectedShell>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppProvider>
  );
};

export default App;