import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';

export const StudentDashboard: React.FC = () => {
  const { user, data } = useApp();
  const studentApps = data.applications.filter((a) => a.studentId === user!.id);
  const reports = data.reports.filter((r) => r.studentId === user!.id);
  const open = data.internships.filter((i) => i.status === 'Open').length;
  const accepted = studentApps.filter((a) => a.status === 'Accepted').length;

  return (
    <>
      <PageHead eyebrow="Student" title="Your internship workspace" description="Find opportunities, track applications and document your placement." />
      <div className="metrics">
        <Metric label="Open internships" value={open} detail="Currently available" />
        <Metric label="Your applications" value={studentApps.length} detail="Submitted" />
        <Metric label="Accepted" value={accepted} detail="Current placements" />
        <Metric label="Reports" value={reports.length} detail="Submitted records" />
      </div>
      <div className="dashboardGrid">
        <section className="card">
          <div className="sectionTitle">
            <div>
              <h2>Recent applications</h2>
              <p>Live records from the application workspace.</p>
            </div>
            <a href="/student/applications" className="textLink">View all</a>
          </div>
          {studentApps.length ? (
            studentApps.slice(0, 4).map((a) => {
              const i = data.internships.find((x) => x.id === a.internshipId);
              const c = data.companies.find((x) => x.id === i?.companyId);
              return (
                <div className="row" key={a.id}>
                  <div>
                    <strong>{i?.title}</strong>
                    <span>{c?.name} · {a.date}</span>
                  </div>
                  <Status value={a.status} />
                </div>
              );
            })
          ) : (
            <Empty title="No applications yet" text="Apply to an open internship to get started." />
          )}
        </section>
        <section className="card darkCard">
          <p className="eyebrow lightText">WORKFLOW</p>
          <h2>Keep your placement record current.</h2>
          <p className="lightMuted">Use the dedicated workspace pages to manage internships, applications, reports and evaluations.</p>
          <div className="progressLine">
            <span style={{ width: `${Math.min(100, Math.max(12, studentApps.length * 20))}%` }} />
          </div>
        </section>
      </div>
    </>
  );
};