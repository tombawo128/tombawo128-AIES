import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';

export const UniversitySupervisors: React.FC = () => {
  const { data, user } = useApp();
  const supervisors = data.users.filter(
    (u) =>
      (u.role === 'academicSupervisor' || u.role === 'companySupervisor') &&
      u.universityId === user!.universityId,
  );

  return (
    <>
      <PageHead eyebrow="University workspace" title="Supervisors" description="Academic and company supervisors associated with your university." />
      <div className="cards3">
        {supervisors.length ? (
          supervisors.map((s) => (
            <div className="card" key={s.id}>
              <div className="companyMark large">{s.name.slice(0, 1)}</div>
              <h2>{s.name}</h2>
              <p>{s.email}</p>
              <p>{s.department || 'No department'}</p>
              <Status value={s.active ? 'Active' : 'Inactive'} />
            </div>
          ))
        ) : (
          <Empty title="No supervisors" text="No supervisors registered at your university yet." />
        )}
      </div>
    </>
  );
};