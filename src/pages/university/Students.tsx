import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';

export const UniversityStudents: React.FC = () => {
  const { data, user } = useApp();
  const students = data.users.filter((u) => u.role === 'student' && u.universityId === user!.universityId);

  return (
    <>
      <PageHead eyebrow="University workspace" title="Students" description="View all students enrolled at your university." />
      <div className="cards3">
        {students.length ? (
          students.map((s) => (
            <div className="card" key={s.id}>
              <div className="companyMark large">{s.name.slice(0, 1)}</div>
              <h2>{s.name}</h2>
              <p>{s.email}</p>
              <p>{s.major || 'No major'}</p>
              <Status value={s.active ? 'Active' : 'Inactive'} />
            </div>
          ))
        ) : (
          <Empty title="No students" text="No students registered at your university yet." />
        )}
      </div>
    </>
  );
};