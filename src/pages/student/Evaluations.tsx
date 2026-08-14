import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';

export const StudentEvaluations: React.FC = () => {
  const { data, user } = useApp();
  const relevant = data.applications.filter((a) => a.studentId === user!.id);
  const evals = data.evaluations.filter((e) =>
    relevant.some((a) => a.id === e.applicationId),
  );

  return (
    <>
      <PageHead eyebrow="Student workspace" title="Evaluations" description="View evaluation results linked to your placement." />
      <div className="card">
        {evals.length ? (
          evals.map((e) => {
            const app = relevant.find((a) => a.id === e.applicationId);
            const i = data.internships.find((x) => x.id === app?.internshipId);
            const avg = Object.values(e.scores).reduce((a, b) => a + b, 0) / Object.values(e.scores).length;
            return (
              <div className="report" key={e.id}>
                <div>
                  <strong>Evaluation · {e.date}</strong>
                  <span>{i?.title}</span>
                  <p>{e.comments}</p>
                </div>
                <div className="score">{avg.toFixed(1)} / 5</div>
              </div>
            );
          })
        ) : (
          <Empty title="No evaluations yet" text="Evaluation results will appear after a supervisor submits one." />
        )}
      </div>
    </>
  );
};