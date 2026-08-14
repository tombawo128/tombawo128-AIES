import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';

export const AcademicDashboard: React.FC = () => {
  const { data, user } = useApp();
  const students = data.users.filter((u) => u.role === 'student' && u.universityId === user!.universityId);
  const reports = data.reports.filter((r) => students.some((s) => s.id === r.studentId));
  const pending = reports.filter((r) => r.status === 'Pending').length;

  return (
    <>
      <PageHead eyebrow="Academic Supervisor" title="Supervisor dashboard" description="Oversee student reports and academic progress." />
      <div className="metrics">
        <Metric label="Assigned students" value={students.length} detail="Under your supervision" />
        <Metric label="Total reports" value={reports.length} detail="Submitted" />
        <Metric label="Pending review" value={pending} detail="Awaiting approval" />
      </div>
      <div className="dashboardGrid">
        <section className="card">
          <h2>Recent reports</h2>
          <p className="muted">Review student submissions.</p>
        </section>
        <section className="card darkCard">
          <p className="eyebrow lightText">WORKFLOW</p>
          <h2>Keep student records up to date.</h2>
          <p className="lightMuted">Approve weekly reports and provide feedback.</p>
        </section>
      </div>
    </>
  );
};