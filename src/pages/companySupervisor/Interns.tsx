import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';

export const CompanySupervisorInterns: React.FC = () => {
  const { data, user } = useApp();

  // Get internships for this company supervisor's company
  const companyInternships = data.internships.filter((i) => i.company_id === user?.company_id);

  // Get accepted applications for those internships
  const acceptedApps = data.applications.filter(
    (a) =>
      a.status === 'accepted' &&
      companyInternships.some((i) => i.id === a.internship_id)
  );

  // Get the student users for those accepted applications
  const interns = acceptedApps
    .map((a) => data.users.find((u) => u.id === a.student_id))
    .filter(Boolean);

  return (
    <>
      <PageHead
        eyebrow="Company Supervisor"
        title="My Interns"
        description="All interns currently placed at your company."
      />
      <div className="card">
        {interns.length === 0 ? (
          <Empty title="No interns yet" text="You don't have any interns assigned to you." />
        ) : (
          <div className="table">
            <div className="thead">
              <span>Name</span>
              <span>Email</span>
              <span>Major</span>
              <span>Internship</span>
            </div>
            {interns.map((student) => {
              const app = acceptedApps.find((a) => a.student_id === student?.id);
              const internship = companyInternships.find((i) => i.id === app?.internship_id);
              return (
                <div className="trow" key={student!.id}>
                  <div>
                    <strong>{student!.name}</strong>
                  </div>
                  <div>{student!.email}</div>
                  <div>{student!.major || '—'}</div>
                  <div>{internship?.title || '—'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};