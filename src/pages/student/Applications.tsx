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
  internships: { title: string; location: string } | null;
}

export const StudentApplications: React.FC = () => {
  const { user } = useApp();
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('applications')
        .select('id, status, date, internships(title, location)')
        .eq('student_id', user.id)
        .order('date', { ascending: false });
      setApplications((data as any) || []);
      setLoading(false);
    };
    fetchApps();
  }, [user]);

  return (
    <>
      <PageHead eyebrow="Student" title="My applications" description="Track the status of your internship applications." />
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : applications.length ? (
          applications.map((a) => (
            <div className="row" key={a.id}>
              <div>
                <strong>{a.internships?.title || 'Untitled'}</strong>
                <span>{a.internships?.location || '—'} · Applied: {a.date}</span>
              </div>
              <Status value={a.status} />
            </div>
          ))
        ) : (
          <Empty title="No applications yet" text="Browse internships and apply to get started." />
        )}
      </div>
    </>
  );
};