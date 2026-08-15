import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

export const AcademicReports: React.FC = () => {
  const { user } = useApp();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchReports = async () => {
    if (!user) return;
    setLoading(true);
    const { data: students } = await supabase.from('users').select('id, name').eq('supervisor_id', user.id);
    const studentIds = (students || []).map((s) => s.id);
    const nameMap: Record<string, string> = {};
    (students || []).forEach((s) => { nameMap[s.id] = s.name; });

    if (studentIds.length === 0) { setLoading(false); return; }

    const { data } = await supabase.from('reports').select('*').in('student_id', studentIds).order('date', { ascending: false });
    setReports((data || []).map((r) => ({ ...r, studentName: nameMap[r.student_id] })));
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) { setMessage('Failed: ' + error.message); return; }
    setMessage(`Report ${status}.`);
    fetchReports();
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <>
      <PageHead eyebrow="Academic Supervisor" title="Reports" description="Review weekly reports from your students." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : reports.length ? (
          reports.map((r) => (
            <div className="report" key={r.id}>
              <div>
                <strong>{r.studentName} — Week {r.week}</strong>
                <span>{r.date} · {r.hours || 0} hours</span>
                <p>{r.activities}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <Status value={r.status} />
                {r.status === 'submitted' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="primary" onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                    <button className="ghost" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty title="No reports yet" text="Reports from your assigned students will appear here." />
        )}
      </div>
    </>
  );
};