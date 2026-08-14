import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';

export const CompanyDashboard: React.FC = () => {
  const { user, data } = useApp();
  const companyInternships = data.internships.filter((i) => i.company_id === user!.company_id);
  const companyApps = data.applications.filter((a) =>
    companyInternships.some((i) => i.id === a.internship_id),
  );
  const open = companyInternships.filter((i) => i.status === 'Open').length;
  const accepted = companyApps.filter((a) => a.status === 'accepted').length;

  return (
    <>
      <PageHead
        eyebrow="Company workspace"
        title="Company dashboard"
        description="Manage your internship listings and review candidates."
      />
      <div className="metrics">
        <Metric label="Your internships" value={companyInternships.length} detail="Total listings" />
        <Metric label="Open positions" value={open} detail="Currently active" />
        <Metric label="Applications" value={companyApps.length} detail="Received" />
        <Metric label="Accepted" value={accepted} detail="Interns placed" />
      </div>
      <div className="dashboardGrid">
        <section className="card">
          <div className="sectionTitle">
            <div>
              <h2>Recent applications</h2>
              <p>Review candidate submissions.</p>
            </div>
            <a href="/company/applications" className="textLink">View all</a>
          </div>
          {companyApps.length ? (
            companyApps.slice(0, 4).map((a) => {
              const student = data.users.find((u) => u.id === a.student_id);
              const internship = companyInternships.find((i) => i.id === a.internship_id);
              return (
                <div className="row" key={a.id}>
                  <div>
                    <strong>{student?.name}</strong>
                    <span>{internship?.title}</span>
                  </div>
                  <Status value={a.status} />
                </div>
              );
            })
          ) : (
            <Empty title="No applications yet" text="Applications will appear here." />
          )}
        </section>
        <section className="card darkCard">
          <p className="eyebrow lightText">WORKFLOW</p>
          <h2>Keep your hiring pipeline moving.</h2>
          <p className="lightMuted">Review applications, schedule interviews, and onboard interns.</p>
          <div className="progressLine">
            <span style={{ width: `${Math.min(100, Math.max(10, companyApps.length * 15))}%` }} />
          </div>
        </section>
      </div>
    </>
  );
};