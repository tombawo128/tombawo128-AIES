import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

export const StudentReports: React.FC = () => {
  const { user } = useApp();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [week, setWeek] = useState(1);
  const [activities, setActivities] = useState('');
  const [challenges, setChallenges] = useState('');
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState(0);
  const [message, setMessage] = useState('');

  const fetchReports = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('student_id', user.id)
      .order('week', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('reports').insert({
      student_id: user.id,
      week,
      activities,
      challenges,
      skills,
      hours,
      status: 'submitted',
    });
    if (error) {
      setMessage('Failed to submit: ' + error.message);
      return;
    }
    setMessage('Report submitted!');
    setWeek(week + 1);
    setActivities('');
    setChallenges('');
    setSkills('');
    setHours(0);
    setShowForm(false);
    fetchReports();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <PageHead
        eyebrow="Student"
        title="Weekly reports"
        description="Log your internship activities each week."
        action={<button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Submit new report'}</button>}
      />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {showForm && (
        <form className="card formGrid" onSubmit={submit} style={{ marginBottom: '20px' }}>
          <label>Week number
            <input type="number" min={1} value={week} onChange={(e) => setWeek(Number(e.target.value))} required />
          </label>
          <label>Hours worked
            <input type="number" min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <label className="span2">Activities this week
            <textarea value={activities} onChange={(e) => setActivities(e.target.value)} required />
          </label>
          <label className="span2">Challenges faced
            <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} required />
          </label>
          <label className="span2">Skills gained
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} required />
          </label>
          <button className="primary span2">Submit report</button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading reports...</div>
        ) : reports.length ? (
          reports.map((r) => (
            <div className="report" key={r.id}>
              <div>
                <strong>Week {r.week}</strong>
                <span>{r.date} · {r.hours || 0} hours</span>
                <p>{r.activities}</p>
              </div>
              <Status value={r.status} />
            </div>
          ))
        ) : (
          <Empty title="No reports yet" text="Submit your first weekly report to get started." />
        )}
      </div>
    </>
  );
};