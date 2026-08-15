import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

export const AdminReports: React.FC = () => {
  const { user } = useApp();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, users(name, email)')
      .order('date', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const openReport = async (report: any) => {
    setSelected(report);
    setFeedback(report.admin_feedback || '');
    if (!report.read_by_admin) {
      await supabase.from('reports').update({ read_by_admin: true }).eq('id', report.id);
      fetchReports();
    }
  };

  const submitFeedback = async (status: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status, admin_feedback: feedback, read_by_admin: true })
      .eq('id', selected.id);
    if (error) {
      setMessage('Failed: ' + error.message);
      return;
    }
    setMessage('Feedback saved.');
    setSelected(null);
    fetchReports();
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  if (selected) {
    return (
      <>
        <PageHead
          eyebrow="Administrator"
          title={`${selected.users?.name} — Week ${selected.week}`}
          description={selected.users?.email}
          action={<button className="ghost" onClick={() => setSelected(null)}>Back to reports</button>}
        />
        <div className="card" style={{ marginBottom: '18px' }}>
          <p><strong>Hours:</strong> {selected.hours || 0} · <strong>Date:</strong> {selected.date}</p>
          <p><strong>Activities:</strong><br />{selected.activities}</p>
          <p><strong>Challenges:</strong><br />{selected.challenges}</p>
          <p><strong>Skills gained:</strong><br />{selected.skills}</p>
        </div>
        <div className="card formGrid">
          <label className="span2">Your feedback
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </label>
          <button className="primary" onClick={() => submitFeedback('approved')}>Approve</button>
          <button className="ghost" onClick={() => submitFeedback('rejected')}>Reject</button>
        </div>
        {message && <div className="notice" style={{ marginTop: '15px' }}>{message}</div>}
      </>
    );
  }

  return (
    <>
      <PageHead eyebrow="Administrator" title="Weekly reports" description="All reports submitted by students, across all supervisors." />
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : reports.length ? (
          reports.map((r) => (
            <div className="row" key={r.id} style={{ cursor: 'pointer', position: 'relative' }} onClick={() => openReport(r)}>
              <div>
                <strong>
                  {r.users?.name} — Week {r.week}
                  {!r.read_by_admin && (
                    <span style={{
                      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                      background: '#c0392b', marginLeft: '8px', verticalAlign: 'middle',
                    }} />
                  )}
                </strong>
                <span>{r.date} · {r.hours || 0} hours</span>
              </div>
              <Status value={r.status} />
            </div>
          ))
        ) : (
          <Empty title="No reports yet" text="Weekly reports from all students will appear here." />
        )}
      </div>
    </>
  );
};