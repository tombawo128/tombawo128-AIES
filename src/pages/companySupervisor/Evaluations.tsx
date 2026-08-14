import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Evaluation } from '../../types';
import { supabase } from '../../supabaseClient';

export const CompanySupervisorEvaluations: React.FC = () => {
  const { data, user, refreshData } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get internships for this company supervisor's company
  const companyInternships = data.internships.filter((i) => i.company_id === user?.company_id);

  // Get accepted applications for those internships
  const acceptedApps = data.applications.filter(
    (a) =>
      a.status === 'accepted' &&
      companyInternships.some((i) => i.id === a.internship_id)
  );

  // Get evaluations relevant to these applications
  const relevantEvals = data.evaluations.filter((e) =>
    acceptedApps.some((a) => a.id === e.application_id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    setSubmitting(true);

    const newEval = {
      application_id: selectedApplication,
      evaluator_id: user!.id,
      scores,
      comments,
      date: new Date().toISOString(),
    };

    const { error } = await supabase.from('evaluations').insert(newEval);
    if (error) {
      setMessage('Failed to submit evaluation: ' + error.message);
    } else {
      setMessage('Evaluation submitted!');
      setShowForm(false);
      setSelectedApplication('');
      setScores({});
      setComments('');
      await refreshData(); // reload data from Supabase
    }
    setTimeout(() => setMessage(''), 3000);
    setSubmitting(false);
  };

  return (
    <>
      <PageHead
        eyebrow="Company Supervisor"
        title="Evaluations"
        description="Write performance reviews for your interns."
        action={
          <button className="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Evaluation'}
          </button>
        }
      />
      {message && <div className="notice">{message}</div>}

      {showForm && (
        <form className="card formGrid" onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <label className="span2">
            Select Intern
            <select
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value)}
              required
            >
              <option value="">Choose an intern...</option>
              {acceptedApps.map((a) => {
                const student = data.users.find((u) => u.id === a.student_id);
                const internship = companyInternships.find((i) => i.id === a.internship_id);
                return (
                  <option key={a.id} value={a.id}>
                    {student?.name} – {internship?.title}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="span2">
            Comments
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            />
          </label>
          <div className="span2">
            <p style={{ fontSize: '12px', marginBottom: '8px' }}>Scores (1–5):</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {['Communication', 'Technical', 'Teamwork', 'Problem Solving'].map((skill) => (
                <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {skill}
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={scores[skill] || ''}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [skill]: parseInt(e.target.value) || 0,
                      }))
                    }
                    style={{ width: '60px' }}
                    required
                  />
                </label>
              ))}
            </div>
          </div>
          <button className="primary span2" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        </form>
      )}

      <div className="card">
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>
          Submitted Evaluations ({relevantEvals.length})
        </h2>
        {relevantEvals.length === 0 ? (
          <Empty title="No evaluations yet" text="Write your first evaluation above." />
        ) : (
          <div className="reportList">
            {relevantEvals.map((e) => {
              const app = acceptedApps.find((a) => a.id === e.application_id);
              const student = data.users.find((u) => u.id === app?.student_id);
              const internship = companyInternships.find((i) => i.id === app?.internship_id);
              return (
                <div className="report" key={e.id}>
                  <div>
                    <strong>{student?.name}</strong>
                    <span>{internship?.title}</span>
                    <p>Comments: {e.comments}</p>
                    <small>Date: {new Date(e.date).toLocaleDateString()}</small>
                  </div>
                  <div className="score">
                    {Object.entries(e.scores)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' | ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};