import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';

export const CompanySupervisorInterns: React.FC = () => {
  const { data, user } = useApp();
  const companyInternships = data.internships.filter((i) => i.companyId === user!.companyId);
  const acceptedApps = data.applications.filter(
    (a) =>
      a.status === 'Accepted' &&
      companyInternships.some((i) => i.id === a.internshipId),
  );
  const interns = acceptedApps.map((a) => data.users.find((u) => u.id === a.studentId)).filter(Boolean);

  return (
    <>
      <PageHead eyebrow="Company Supervisor" title="Current interns" description="Interns you are supervising." />
      <div className="cards3">
        {interns.length ? (
          interns.map((s) => (
            <div className="card" key={s!.id}>
              <div className="companyMark large">{s!.name.slice(0, 1)}</div>
              <h2>{s!.name}</h2>
              <p>{s!.email}</p>
              <Status value="Active" />
            </div>
          ))
        ) : (
          <Empty title="No interns" text="No active interns at your company." />
        )}
      </div>
    </>
  );
};