import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

interface Internship {
  id: string;
  title: string;
  description: string;
  skills: string;
  duration: string;
  location: string;
  deadline: string;
  positions: number;
  company_id: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  email: string;
}

interface University {
  id: string;
  name: string;
  city: string;
  email: string;
}

export const StudentInternships: React.FC = () => {
  const { user } = useApp();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [myUniversity, setMyUniversity] = useState<University | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Internship | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: list } = await supabase.from('internships').select('*').order('deadline', { ascending: true });
    setInternships(list || []);

    const companyIds = [...new Set((list || []).map((i) => i.company_id))];
    if (companyIds.length) {
      const { data: comps } = await supabase.from('companies').select('*').in('id', companyIds);
      const map: Record<string, Company> = {};
      (comps || []).forEach((c) => { map[c.id] = c; });
      setCompanies(map);
    }

    if (user) {
      const { data: myApps } = await supabase.from('applications').select('internship_id').eq('student_id', user.id);
      setAppliedIds((myApps || []).map((a) => a.internship_id));

      if (user!.universityId) {
        const { data: uni } = await supabase.from('universities').select('*').eq('id', user!.universityId).single();
        setMyUniversity(uni || null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const apply = async (internshipId: string) => {
    if (!user) return;
    const { error } = await supabase.from('applications').insert({
      student_id: user.id,
      internship_id: internshipId,
      status: 'pending',
    });
    if (error) {
      setMessage('Failed to apply: ' + error.message);
      return;
    }
    setMessage('Application submitted!');
    fetchData();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <PageHead eyebrow="Student" title="Internships" description="Browse and apply to open positions." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {myUniversity && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Your university</h3>
          <p>
            <strong>{myUniversity.name}</strong><br />
            {myUniversity.city || '—'} · {myUniversity.email || '—'}
          </p>
        </div>
      )}

      {selected ? (
        <div className="card">
          <button className="ghost" onClick={() => setSelected(null)} style={{ marginBottom: '16px' }}>
            ← Back to all internships
          </button>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <p><strong>Skills:</strong> {selected.skills || '—'}</p>
          <p><strong>Duration:</strong> {selected.duration || '—'}</p>
          <p><strong>Location:</strong> {selected.location || '—'}</p>
          <p><strong>Deadline:</strong> {selected.deadline || '—'}</p>
          <p><strong>Positions available:</strong> {selected.positions}</p>

          {companies[selected.company_id] && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <h3>About the company</h3>
              <p>
                <strong>{companies[selected.company_id].name}</strong><br />
                Industry: {companies[selected.company_id].industry || '—'}<br />
                Location: {companies[selected.company_id].location || '—'}<br />
                Contact: {companies[selected.company_id].email || '—'}
              </p>
            </div>
          )}

          {appliedIds.includes(selected.id) ? (
            <button className="ghost" disabled style={{ marginTop: '16px' }}>Already applied</button>
          ) : (
            <button className="primary" onClick={() => apply(selected.id)} style={{ marginTop: '16px' }}>Apply</button>
          )}
        </div>
      ) : (
        <div className="cards3">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading internships...</div>
          ) : internships.length ? (
            internships.map((i) => (
              <div className="card" key={i.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(i)}>
                <h2>{i.title}</h2>
                <p>{companies[i.company_id]?.name || 'Unknown company'}</p>
                <p><strong>Location:</strong> {i.location || '—'}</p>
                <p><strong>Deadline:</strong> {i.deadline || '—'}</p>
                {appliedIds.includes(i.id) ? (
                  <button className="ghost" disabled>Already applied</button>
                ) : (
                  <button className="primary" onClick={(e) => { e.stopPropagation(); apply(i.id); }}>Apply</button>
                )}
              </div>
            ))
          ) : (
            <Empty title="No internships" text="No internships are currently listed." />
          )}
        </div>
      )}
    </>
  );
};