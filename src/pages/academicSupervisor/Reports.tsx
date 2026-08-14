import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';

export const AcademicReports: React.FC = () => {
  const { data, user, setData } = useApp();
  const students = data.users.filter((u) => u.role === 'student' && u.university_id === user!.university_id);
  const reports = data.reports.filter((r) => students.some((s) => s.id === r.student_id));

  const review = (id: string, status: 'approved' | 'rejected') => {
    setData({
      ...data,
      reports: data.reports.map((r) => (r.id === id ? { ...r, status } : r)),
    });
  };

  return (
    <>
      <PageHead eyebrow="Academic Supervisor" title="Reports" description="Review student internship reports." />
      <div className="card reportList">
        {reports.length ? (
          reports.map((r) => {
            const student = students.find((s) => s.id === r.student_id);
            return (
              <div className="report" key={r.id}>
                <div>
                  <strong>Week {r.week}</strong>
                  <span>{student?.name} · {r.date}</span>
                  <p>{r.activities}</p>
                  <small>Challenges: {r.challenges}</small>
                  <small>Skills: {r.skills}</small>
                </div>
                <div className="rowActions">
                  <Status value={r.status} />
                  {r.status === 'submitted' && (
                    <>
                      <button className="primary smallBtn" onClick={() => review(r.id, 'approved')}>
                        Approve
                      </button>
                      <button className="ghost smallBtn" onClick={() => review(r.id, 'rejected')}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <Empty title="No reports" text="No student reports submitted yet." />
        )}
      </div>
    </>
  );
};