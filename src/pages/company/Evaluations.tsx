import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

const CRITERIA = ['punctuality', 'teamwork', 'technicalSkills', 'communication', 'initiative'];

export const CompanyEvaluations: React.FC = () => {
  const { user } = useApp();
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');

  const fetchInterns = async () => {
    if (!user?.company_id) {
      setLoading(false);
      return;
    }
    const { data: internships } = await supabase.from('internships').select('id').eq('company_id', user.company_id);
    const internshipIds = (internships || []).map((i) => i.id);
    if (internshipIds.length === 0) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('applications')
      .select('id, users(name, email), internships(title)')
      .in('internship_id', internshipIds)
      .eq('status', 'accepted');
    setInterns((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInterns();
  }, [user]);

  const openForm = (app: any) => {
    setSelected(app);
    setScores({});
    setComments('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('evaluations').insert({
      application_id: selected.id,
      evaluator_id: user?.id,
      scores,
      comments,
    });
    if (error) {
      setMessage('Failed to submit: ' + error.message);
      return;
    }
    setMessage('Evaluation submitted!');
    setSelected(null);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <PageHead eyebrow="Company" title="Evaluations" description="Rate and review your interns' performance." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {selected ? (
        <form className="card formGrid" onSubmit={submit}>
          <h3 className="span2">Evaluating {selected.users?.name}</h3>
          {CRITERIA.map((c) => (
            <label key={c}>
              {c.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} (1-5)
              <input
                type="number"
                min={1}
                max={5}
                required
                value={scores[c] || ''}
                onChange={(e) => setScores({ ...scores, [c]: Number(e.target.value) })}
              />
            </label>
          ))}
          <label className="span2">Comments
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} required />
          </label>
          <button className="primary">Submit evaluation</button>
          <button type="button" className="ghost" onClick={() => setSelected(null)}>Cancel</button>
        </form>
      ) : (
        <div className="card">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : interns.length ? (
            interns.map((i) => (
              <div className="row" key={i.id}>
                <div>
                  <strong>{i.users?.name}</strong>
                  <span>{i.internships?.title || '—'}</span>
                </div>
                <button className="primary" onClick={() => openForm(i)}>Evaluate</button>
              </div>
            ))
          ) : (
            <Empty title="No interns to evaluate" text="Accepted interns will appear here for evaluation." />
          )}
        </div>
      )}
    </>
  );
};