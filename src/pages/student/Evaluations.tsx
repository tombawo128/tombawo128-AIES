import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const StudentEvaluations: React.FC = () => {
  const { user } = useApp();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvals = async () => {
      if (!user) return;
      const { data: apps } = await supabase.from('applications').select('id').eq('student_id', user.id);
      const appIds = (apps || []).map((a) => a.id);
      if (appIds.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('evaluations').select('*').in('application_id', appIds);
      setEvaluations(data || []);
      setLoading(false);
    };
    fetchEvals();
  }, [user]);

  {evaluations.length > 0 && (
        <div className="notice" style={{ marginBottom: '18px' }}>
          🎉 You have successfully completed your internship. See your evaluation below.
        </div>
      )}

  return (
    <>
      <PageHead eyebrow="Student" title="Evaluations" description="Feedback and scores from your internship supervisors." />
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : evaluations.length ? (
          evaluations.map((e) => {
            const scores = typeof e.scores === 'string' ? JSON.parse(e.scores) : e.scores || {};
            const vals = Object.values(scores) as number[];
            const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            return (
              <div className="report" key={e.id}>
                <div>
                  <strong>Evaluation</strong>
                  <span>{e.date}</span>
                  <p>{e.comments}</p>
                </div>
                <div className="score">{avg.toFixed(1)} / 5</div>
              </div>
            );
          })
        ) : (
          <Empty title="No evaluations yet" text="Evaluations from your supervisors will appear here." />
        )}
      </div>
    </>
  );
};