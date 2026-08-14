import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const CompanyInterns: React.FC = () => {
  const { user } = useApp();
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterns = async () => {
      if (!user?.company_id) {
        setLoading(false);
        return;
      }
      const { data: internships } = await supabase.from('internships').select('id, title').eq('company_id', user.company_id);
      const internshipIds = (internships || []).map((i) => i.id);
      if (internshipIds.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('applications')
        .select('id, status, internship_id, users(id, name, email), internships(title)')
        .in('internship_id', internshipIds)
        .eq('status', 'accepted');
      setInterns((data as any) || []);
      setLoading(false);
    };
    fetchInterns();
  }, [user]);

  return (
    <>
      <PageHead eyebrow="Company" title="Current interns" description="Students accepted into your internship programs." />
      <div className="cards3">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : interns.length ? (
          interns.map((i) => (
            <div className="card" key={i.id}>
              <div className="companyMark large">{i.users?.name?.slice(0, 1) || '?'}</div>
              <h2>{i.users?.name || 'Unknown'}</h2>
              <p>{i.users?.email}</p>
              <p><strong>Position:</strong> {i.internships?.title || '—'}</p>
            </div>
          ))
        ) : (
          <Empty title="No interns yet" text="Accepted applicants will appear here." />
        )}
      </div>
    </>
  );
};