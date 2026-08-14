import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';

export const CompanySupervisorDashboard: React.FC = () => {
  const { data, user } = useApp();
  const companyInternships = data.internships.filter((i) => i.company_id === user!.company_id);
  const acceptedApps = data.applications.filter(
    (a) =>
      a.status === 'accepted' &&
      companyInternships.some((i) => i.id === a.internship_id),
  );
  const evaluations = data.evaluations.filter((e) =>
    acceptedApps.some((a) => a.id === e.application_id),
  );

  return (
    <>
      <PageHead eyebrow="Company Supervisor" title="Supervisor dashboard" description="Oversee interns and evaluations." />
      <div className="metrics">
        <Metric label="Active interns" value={acceptedApps.length} detail="Under your supervision" />
        <Metric label="Evaluations" value={evaluations.length} detail="Completed" />
      </div>
      <div className="dashboardGrid">
        <section className="card">
          <h2>Recent evaluations</h2>
          <p className="muted">Track intern performance.</p>
        </section>
        <section className="card darkCard">
          <p className="eyebrow lightText">WORKFLOW</p>
          <h2>Evaluate and guide interns.</h2>
          <p className="lightMuted">Submit evaluations to help interns grow.</p>
        </section>
      </div>
    </>
  );
};