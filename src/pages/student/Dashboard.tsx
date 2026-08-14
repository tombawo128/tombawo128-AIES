import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { data, user } = useApp();

  // Use deadline to determine "open" internships
  const open = data.internships.filter((i) => new Date(i.deadline) > new Date()).length;

  const pending = data.applications.filter((a) => a.student_id === user?.id && a.status === 'pending').length;
  const accepted = data.applications.filter((a) => a.student_id === user?.id && a.status === 'accepted').length;
  const reportsSubmitted = data.reports.filter((r) => r.student_id === user?.id).length;

  return (
    <>
      <PageHead
        eyebrow="Student"
        title="Dashboard"
        description="Overview of your internship journey."
      />
      <div className="metrics">
        <div className="metric">
          <span>Open Internships</span>
          <strong>{open}</strong>
          <small>Available to apply</small>
        </div>
        <div className="metric">
          <span>Pending Applications</span>
          <strong>{pending}</strong>
          <small>Awaiting response</small>
        </div>
        <div className="metric">
          <span>Accepted</span>
          <strong>{accepted}</strong>
          <small>Placements confirmed</small>
        </div>
        <div className="metric">
          <span>Reports Submitted</span>
          <strong>{reportsSubmitted}</strong>
          <small>Logbook entries</small>
        </div>
      </div>

      <div className="dashboardGrid">
        <div className="card">
          <div className="sectionTitle">
            <div>
              <h2>Recent Internships</h2>
              <p>Latest opportunities matching your profile</p>
            </div>
            <Link to="/student/internships" className="textLink">
              View all →
            </Link>
          </div>
          {data.internships.length === 0 ? (
            <Empty title="No internships posted yet" text="Check back later." />
          ) : (
            data.internships.slice(0, 3).map((internship) => (
              <div className="row" key={internship.id}>
                <div>
                  <strong>{internship.title}</strong>
                  <span>{internship.company_id}</span>
                  <small>Deadline: {new Date(internship.deadline).toLocaleDateString()}</small>
                </div>
                <Link to={`/student/internships/${internship.id}`} className="primary smallBtn">
                  View
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="card darkCard">
          <h2>Your Next Step</h2>
          <p className="lightMuted">
            {pending > 0
              ? `You have ${pending} pending application${pending > 1 ? 's' : ''}. Keep checking for updates!`
              : accepted > 0
              ? 'Congratulations! You have been accepted. Start your logbook reports.'
              : 'Browse internships and start applying today.'}
          </p>
          <div className="progressLine">
            <span style={{ width: `${accepted > 0 ? 100 : pending > 0 ? 50 : 10}%` }} />
          </div>
        </div>
      </div>
    </>
  );
};