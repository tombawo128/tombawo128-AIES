import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const CompanyInternships: React.FC = () => {
  const { user } = useApp();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [positions, setPositions] = useState(1);
  const [message, setMessage] = useState('');

  const fetchInternships = async () => {
    if (!user?.company_id) return;
    const { data } = await supabase.from('internships').select('*').eq('company_id', user.company_id).order('created_at', { ascending: false });
    setInternships(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInternships();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id) {
      setMessage('No company linked to this account.');
      return;
    }
    const { error } = await supabase.from('internships').insert({
      title, description, skills, duration, location, deadline, positions,
      company_id: user.company_id,
    });
    if (error) {
      setMessage('Failed to post: ' + error.message);
      return;
    }
    setMessage('Internship posted!');
    setTitle(''); setDescription(''); setSkills(''); setDuration(''); setLocation(''); setDeadline(''); setPositions(1);
    setShowForm(false);
    fetchInternships();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <PageHead
        eyebrow="Company"
        title="Internships"
        description="Manage your posted internship openings."
        action={<button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Post new internship'}</button>}
      />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {showForm && (
        <form className="card formGrid" onSubmit={submit} style={{ marginBottom: '20px' }}>
          <label className="span2">Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="span2">Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label>Skills
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, SQL..." />
          </label>
          <label>Duration
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3 months" />
          </label>
          <label>Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label>Deadline
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <label>Positions
            <input type="number" min={1} value={positions} onChange={(e) => setPositions(Number(e.target.value))} />
          </label>
          <button className="primary span2">Post internship</button>
        </form>
      )}

      <div className="cards3">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : internships.length ? (
          internships.map((i) => (
            <div className="card" key={i.id}>
              <h2>{i.title}</h2>
              <p>{i.description}</p>
              <p><strong>Deadline:</strong> {i.deadline || '—'}</p>
              <p><strong>Positions:</strong> {i.positions}</p>
            </div>
          ))
        ) : (
          <Empty title="No internships posted" text="Post your first internship to start receiving applications." />
        )}
      </div>
    </>
  );
};