import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

export const AdminSearch: React.FC = () => {
  const { user } = useApp();
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    const q = `%${term.trim()}%`;

    const [u, c, uni, i] = await Promise.all([
      supabase.from('users').select('*').or(`name.ilike.${q},email.ilike.${q}`).limit(20),
      supabase.from('companies').select('*').ilike('name', q).limit(20),
      supabase.from('universities').select('*').ilike('name', q).limit(20),
      supabase.from('internships').select('*').ilike('title', q).limit(20),
    ]);

    setUsers(u.data || []);
    setCompanies(c.data || []);
    setUniversities(uni.data || []);
    setInternships(i.data || []);
    setLoading(false);
  };

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  const totalResults = users.length + companies.length + universities.length + internships.length;

  return (
    <>
      <PageHead eyebrow="Administrator" title="Search" description="Search across users, companies, universities, and internships." />

      <form onSubmit={runSearch} style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search anything..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)' }}
        />
        <button className="primary" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>

      {searched && !loading && totalResults === 0 && (
        <Empty title="No results" text="Try a different search term." />
      )}

      {users.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3>Users ({users.length})</h3>
          <div className="card">
            {users.map((u) => (
              <div className="row" key={u.id} style={{ cursor: 'pointer' }} onClick={() => window.location.assign(`/admin/user/${u.id}`)}>
                <div>
                  <strong>{u.name}</strong>
                  <span>{u.email} · {u.role}</span>
                </div>
                <Status value={u.active ? 'Active' : 'Pending'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3>Companies ({companies.length})</h3>
          <div className="card">
            {companies.map((c) => (
              <div className="row" key={c.id}>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.industry || '—'} · {c.location || '—'}</span>
                </div>
                <Status value={c.verified ? 'Verified' : 'Unverified'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {universities.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3>Universities ({universities.length})</h3>
          <div className="card">
            {universities.map((u) => (
              <div className="row" key={u.id}>
                <div>
                  <strong>{u.name}</strong>
                  <span>{u.city || '—'}</span>
                </div>
                <Status value={u.verified ? 'Verified' : 'Unverified'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {internships.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3>Internships ({internships.length})</h3>
          <div className="card">
            {internships.map((i) => (
              <div className="row" key={i.id}>
                <div>
                  <strong>{i.title}</strong>
                  <span>{i.location || '—'} · Deadline: {i.deadline || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};