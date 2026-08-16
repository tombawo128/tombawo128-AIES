import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

const CRITERIA = ['discipline', 'academicApplication', 'professionalGrowth', 'communication', 'overallPerformance'];

export const UniversityEvaluations: React.FC = () => {
  const { user } = useApp();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');

  const fetchStudents = async () => {
    if (!user?.university_id) { setLoading(false); return; }
    setLoading(true);
    const { data: universityStudents } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('university_id', user.university_id)
      .eq('role', 'student');

    const studentIds = (universityStudents || []).map((s) => s.id);
    if (studentIds.length === 0) { setStudents([]); setLoading(false); return; }

    const { data: apps } = await supabase
      .from('applications')
      .select('id, student_id, status, internship_status, internships(title)')
      .in('student_id', studentIds)
      .eq('status', 'accepted');

    const merged = (universityStudents || []).map((s) => ({
      ...s,
      application: (apps || []).find((a) => a.student_id === s.id),
    }));
    setStudents(merged);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [user]);

  const openForm = (student: any) => {
    setSelected(student);
    setScores({});
    setComments('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.application) {
      setMessage('This student has no active internship application to evaluate.');
      return;
    }
    const { error } = await supabase.from('evaluations').insert({
      application_id: selected.application.id,
      evaluator_id: user?.id,
      scores,
      comments,
    });
    if (error) {
      setMessage('Failed: ' + error.message);
      return;
    }
    await supabase.from('applications').update({ internship_status: 'completed' }).eq('id', selected.application.id);
    setMessage(`Evaluation submitted. ${selected.name}'s internship is now marked complete.`);
    setSelected(null);
    fetchStudents();
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <>
      <PageHead eyebrow="University" title="Final Evaluations" description="Evaluate your students' completed internship period." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {selected ? (
        <form className="card formGrid" onSubmit={submit}>
          <h3 className="span2">Evaluating {selected.name}</h3>
          {!selected.application && <div className="error span2">No accepted internship found for this student yet.</div>}
          {CRITERIA.map((c) => (
            <label key={c}>
              {c.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} (1-5)
              <input type="number" min={1} max={5} required value={scores[c] || ''} onChange={(e) => setScores({ ...scores, [c]: Number(e.target.value) })} />
            </label>
          ))}
          <label className="span2">Final comments
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} required />
          </label>
          <button className="primary" disabled={!selected.application}>Submit final evaluation</button>
          <button type="button" className="ghost" onClick={() => setSelected(null)}>Cancel</button>
        </form>
      ) : (
        <div className="card">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : students.length ? (
            students.map((s) => (
              <div className="row" key={s.id}>
                <div>
                  <strong>{s.name}</strong>
                  <span>{s.application?.internships?.title || 'No active internship'} · {s.application?.internship_status === 'completed' ? 'Completed' : 'In progress'}</span>
                </div>
                <button className="primary" onClick={() => openForm(s)} disabled={s.application?.internship_status === 'completed'}>
                  {s.application?.internship_status === 'completed' ? 'Already evaluated' : 'Evaluate'}
                </button>
              </div>
            ))
          ) : (
            <Empty title="No students yet" text="Students registered under your university will appear here." />
          )}
        </div>
      )}
    </>
  );
};