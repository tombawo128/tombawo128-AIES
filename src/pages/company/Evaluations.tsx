import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { id } from '../../utils';

export const CompanyEvaluations: React.FC = () => {
  const { data, user, setData } = useApp();
  const companyInternships = data.internships.filter((i) => i.companyId === user!.companyId);
  const relevantApps = data.applications.filter(
    (a) =>
      a.status === 'Accepted' &&
      companyInternships.some((i) => i.id === a.internshipId),
  );
  const [appId, setAppId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({
    Technical: 3,
    Communication: 3,
    Teamwork: 3,
    Professionalism: 3,
    ProblemSolving: 3,
  });
  const [comments, setComments] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      ...data,
      evaluations: [
        ...data.evaluations,
        {
          id: id('e'),
          applicationId: appId,
          evaluatorId: user!.id,
          scores,
          comments,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    };
    setData(next);
    setComments('');
    setAppId('');
  };

  const existing = data.evaluations.filter((e) =>
    relevantApps.some((a) => a.id === e.applicationId),
  );

  return (
    <>
      <PageHead eyebrow="Company workspace" title="Evaluations" description="Assess internship performance using a 1–5 scale." />
      <form className="card formGrid" onSubmit={submit}>
        <label className="span2">
          Placement
          <select value={appId} onChange={(e) => setAppId(e.target.value)} required>
            <option value="">Select placement</option>
            {relevantApps.map((a) => {
              const student = data.users.find((u) => u.id === a.studentId);
              const internship = companyInternships.find((i) => i.id === a.internshipId);
              return (
                <option key={a.id} value={a.id}>
                  {student?.name} · {internship?.title}
                </option>
              );
            })}
          </select>
        </label>
        {Object.keys(scores).map((k) => (
          <label key={k}>
            {k}
            <select
              value={scores[k]}
              onChange={(e) => setScores({ ...scores, [k]: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="span2">
          Comments
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} required />
        </label>
        <button className="primary span2">Submit evaluation</button>
      </form>
      <div className="card reportList">
        {existing.length ? (
          existing.map((e) => {
            const avg = Object.values(e.scores).reduce((a, b) => a + b, 0) / Object.values(e.scores).length;
            return (
              <div className="report" key={e.id}>
                <div>
                  <strong>Evaluation · {e.date}</strong>
                  <p>{e.comments}</p>
                </div>
                <div className="score">{avg.toFixed(1)} / 5</div>
              </div>
            );
          })
        ) : (
          <Empty title="No evaluations yet" text="Submit an evaluation above." />
        )}
      </div>
    </>
  );
};