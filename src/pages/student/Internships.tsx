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

export const StudentInternships: React.FC = () => {
  const { user } = useApp();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Internship | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: list, error } = await supabase.from('internships').select('*').order('deadline', { ascending: true });
    if (error) console.error('Failed to fetch internships:', error);
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
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const apply = async (internshipId: string) => {
    if (!user) {
      setMessage('You must be logged in to apply.');
      return;
    }
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

  const filtered = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHead eyebrow="Student" title="Internships" description="Find your next opportunity." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      <div className="toolbar">
        <div className="search">
          <input placeholder="Search internships..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {selected ? (
        <div className="card">
          <button className="ghost" onClick={() => setSelected(null)} style={{ marginBottom: '16px' }}>
            ← Back to all internships
          </button>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <div className="meta">
            <span>📍 {selected.location || '—'}</span>
            <span>⏳ {selected.duration || '—'}</span>
            <span>🎯 {selected.positions} positions</span>
          </div>
          <div className="chips">
            {(selected.skills || '').split(',').filter(Boolean).map((skill) => (
              <span key={skill.trim()}>{skill.trim()}</span>
            ))}
          </div>
          <p><strong>Deadline:</strong> {selected.deadline || '—'}</p>

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
            <button className="primary" onClick={() => apply(selected.id)} style={{ marginTop: '16px' }}>Apply Now</button>
          )}
        </div>
      ) : loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <Empty title="No internships found" text="Try adjusting your search." />
      ) : (
        <div className="cards3">
          {filtered.map((internship) => (
            <div className="card internship" key={internship.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(internship)}>
              <h2>{internship.title}</h2>
              <p>{companies[internship.company_id]?.name || 'Unknown company'}</p>
              <p>{(internship.description || '').slice(0, 120)}...</p>
              <div className="meta">
                <span>📍 {internship.location || '—'}</span>
                <span>⏳ {internship.duration || '—'}</span>
                <span>🎯 {internship.positions} positions</span>
              </div>
              <div className="chips">
                {(internship.skills || '').split(',').filter(Boolean).map((skill) => (
                  <span key={skill.trim()}>{skill.trim()}</span>
                ))}
              </div>
              {appliedIds.includes(internship.id) ? (
                <button className="ghost" disabled>Already applied</button>
              ) : (
                <button className="primary" onClick={(e) => { e.stopPropagation(); apply(internship.id); }}>
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};