import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

interface AppRow {
  id: string;
  status: string;
  date: string;
  cover_letter: string;
  users: { name: string; email: string } | null;
  internships: { title: string } | null;
}

export const CompanyApplications: React.FC = () => {
  const { user } = useApp();
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchApplications = async () => {
    if (!user?.company_id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Get this company's internship IDs first
    const { data: internships } = await supabase
      .from('internships')
      .select('id')
      .eq('company_id', user.company_id);

    const internshipIds = (internships || []).map((i) => i.id);
    if (internshipIds.length === 0) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('applications')
      .select('id, status, date, cover_letter, users(name, email), internships(title)')
      .in('internship_id', internshipIds)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch applications', error);
    }
    setApplications((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) {
      setMessage('Failed to update: ' + error.message);
      return;
    }
    setMessage(`Application ${status}.`);
    fetchApplications();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <PageHead eyebrow="Company" title="Applications" description="Review applications to your internship postings." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading applications...</div>
        ) : applications.length ? (
          applications.map((a) => (
            <div className="row" key={a.id}>
              <div>
                <strong>{a.users?.name || 'Unknown student'}</strong>
                <span>{a.users?.email} · Applied for: {a.internships?.title || '—'} · {a.date}</span>
              </div>
              <div className="rowActions">
                <Status value={a.status} />
                {a.status === 'pending' && (
                  <>
                    <button className="primary" onClick={() => updateStatus(a.id, 'accepted')}>Accept</button>
                    <button className="ghost" onClick={() => updateStatus(a.id, 'rejected')}>Reject</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty title="No applications yet" text="Applications to your internships will appear here." />
        )}
      </div>
    </>
  );
};