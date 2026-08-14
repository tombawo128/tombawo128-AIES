import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

interface University {
  id: string;
  name: string;
  city: string;
  email: string;
  active: boolean;
  verified: boolean;
  created_at: string;
}

export const AdminUniversities: React.FC = () => {
  const { user } = useApp();
  const [universities, setUniversities] = useState<University[]>([]);
  const [pendingUniversities, setPendingUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const { data: all } = await supabase.from('universities').select('*').order('created_at', { ascending: false });
    const { data: pending } = await supabase.from('universities').select('*').eq('active', false);
    setUniversities(all || []);
    setPendingUniversities(pending || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const logAction = async (action: string, targetId: string, details: string) => {
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      user_name: user?.name,
      action,
      target_type: 'university',
      target_id: targetId,
      details,
    });
  };

  const approveUniversity = async (universityId: string, name: string) => {
    const { error } = await supabase.from('universities').update({ active: true, verified: true }).eq('id', universityId);
    if (error) {
      setMessage('Failed to approve: ' + error.message);
      return;
    }

    // Cascade: also activate the linked user account for this university
    const { error: userError } = await supabase
      .from('users')
      .update({ active: true, verified: true })
      .eq('university_id', universityId)
      .eq('role', 'university');
    if (userError) {
      console.error('Failed to activate linked user account:', userError.message);
    }

    await logAction('approve_university', universityId, name);
    setMessage('University approved successfully.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const rejectUniversity = async (universityId: string, name: string) => {
    if (!window.confirm('Reject and remove this university registration? This cannot be undone.')) return;
    const { error } = await supabase.from('universities').delete().eq('id', universityId).eq('active', false);
    if (error) {
      setMessage('Failed to reject: ' + error.message);
      return;
    }
    await logAction('reject_university', universityId, name);
    setMessage('University registration rejected.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const deactivateUniversity = async (universityId: string, name: string) => {
    if (!window.confirm('Deactivate this university? They will lose access until reactivated.')) return;
    const { error } = await supabase.from('universities').update({ active: false }).eq('id', universityId);
    if (error) {
      setMessage('Failed to deactivate: ' + error.message);
      return;
    }
    await logAction('deactivate_university', universityId, name);
    setMessage('University deactivated.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  return (
    <>
      <PageHead eyebrow="Administrator" title="Universities" description="Partner universities and pending registrations." />

      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {pendingUniversities.length > 0 && (
        <>
          <h3>Pending approval</h3>
          <div className="card" style={{ marginBottom: '24px' }}>
            {pendingUniversities.map((u) => (
              <div className="row" key={u.id}>
                <div>
                  <strong>{u.name}</strong>
                  <span>{u.email || 'No email on file'} · {u.city || '—'}</span>
                </div>
                <div className="rowActions">
                  <Status value="Pending" />
                  <button className="primary" onClick={() => approveUniversity(u.id, u.name)}>
                    Approve
                  </button>
                  <button className="ghost" onClick={() => rejectUniversity(u.id, u.name)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>All universities</h3>
      <div className="cards3">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading universities...</div>
        ) : universities.length ? (
          universities.map((u) => (
            <div className="card" key={u.id}>
              <div className="companyMark large">{u.name.slice(0, 1)}</div>
              <h2>{u.name}</h2>
              <p>{u.city || '—'}</p>
              <Status value={u.verified ? 'Verified' : 'Unverified'} />
              {u.active && (
                <button className="ghost" style={{ marginTop: '8px' }} onClick={() => deactivateUniversity(u.id, u.name)}>
                  Deactivate
                </button>
              )}
            </div>
          ))
        ) : (
          <Empty title="No universities" text="No universities registered yet." />
        )}
      </div>
    </>
  );
};