import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';

export const UniversityDashboard: React.FC = () => {
  const { data, user } = useApp();
  const students = data.users.filter((u) => u.role === 'student' && u.university_id === user!.university_id);
  const reports = data.reports.filter((r) => students.some((s) => s.id === r.student_id));
  const apps = data.applications.filter((a) => students.some((s) => s.id === a.student_id));

  return (
    <>
      <PageHead eyebrow="University workspace" title="University oversight" description="Monitor student activity and reports." />
      <div className="metrics">
        <Metric label="Students" value={students.length} detail="Enrolled" />
        <Metric label="Applications" value={apps.length} detail="Submitted" />
        <Metric label="Reports" value={reports.length} detail="Submitted" />
        <Metric label="Pending reports" value={reports.filter((r) => r.status !=='reviewed' && r.status !== 'approved' && r.status !== 'rejected').length} detail="Awaiting review" />
      </div>
      <div className="dashboardGrid">
        <section className="card">
          <h2>Recent reports</h2>
          <p className="muted">Latest student submissions.</p>
        </section>
        <section className="card darkCard">
          <p className="eyebrow lightText">WORKFLOW</p>
          <h2>Keep track of student progress.</h2>
          <p className="lightMuted">Review reports and supervise academic work.</p>
        </section>
      </div>
    </>
  );
};