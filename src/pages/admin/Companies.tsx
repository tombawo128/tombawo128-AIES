import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  email: string;
  active: boolean;
  verified: boolean;
  created_at: string;
}

export const AdminCompanies: React.FC = () => {
  const { user } = useApp();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const { data: all } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    const { data: pending } = await supabase.from('companies').select('*').eq('active', false);
    setCompanies(all || []);
    setPendingCompanies(pending || []);
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
      target_type: 'company',
      target_id: targetId,
      details,
    });
  };

 const approveCompany = async (companyId: string, name: string) => {
    const { error } = await supabase.from('companies').update({ active: true, verified: true }).eq('id', companyId);
    if (error) {
      setMessage('Failed to approve: ' + error.message);
      return;
    }

    // Cascade: also activate the linked user account for this company
    const { error: userError } = await supabase
      .from('users')
      .update({ active: true, verified: true })
      .eq('company_id', companyId);
    if (userError) {
      console.error('Failed to activate linked user account:', userError.message);
    }

    await logAction('approve_company', companyId, name);
    setMessage('Company approved successfully.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };
  
  const rejectCompany = async (companyId: string, name: string) => {
    if (!window.confirm('Reject and remove this company registration? This cannot be undone.')) return;
    const { error } = await supabase.from('companies').delete().eq('id', companyId).eq('active', false);
    if (error) {
      setMessage('Failed to reject: ' + error.message);
      return;
    }
    await logAction('reject_company', companyId, name);
    setMessage('Company registration rejected.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const deactivateCompany = async (companyId: string, name: string) => {
    if (!window.confirm('Deactivate this company? They will lose access until reactivated.')) return;
    const { error } = await supabase.from('companies').update({ active: false }).eq('id', companyId);
    if (error) {
      setMessage('Failed to deactivate: ' + error.message);
      return;
    }
    await logAction('deactivate_company', companyId, name);
    setMessage('Company deactivated.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  return (
    <>
      <PageHead eyebrow="Administrator" title="Companies" description="Partner organizations and pending registrations." />

      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {pendingCompanies.length > 0 && (
        <>
          <h3>Pending approval</h3>
          <div className="card" style={{ marginBottom: '24px' }}>
            {pendingCompanies.map((c) => (
              <div className="row" key={c.id}>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.email || 'No email on file'} · {c.industry || '—'} · {c.location || '—'}</span>
                </div>
                <div className="rowActions">
                  <Status value="Pending" />
                  <button className="primary" onClick={() => approveCompany(c.id, c.name)}>
                    Approve
                  </button>
                  <button className="ghost" onClick={() => rejectCompany(c.id, c.name)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>All companies</h3>
      <div className="cards3">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading companies...</div>
        ) : companies.length ? (
          companies.map((c) => (
            <div className="card" key={c.id}>
              <div className="companyMark large">{c.name.slice(0, 1)}</div>
              <h2>{c.name}</h2>
              <p>{c.industry || '—'}</p>
              <p>{c.location || '—'}</p>
              <Status value={c.verified ? 'Verified' : 'Unverified'} />
              {c.active && (
                <button className="ghost" style={{ marginTop: '8px' }} onClick={() => deactivateCompany(c.id, c.name)}>
                  Deactivate
                </button>
              )}
            </div>
          ))
        ) : (
          <Empty title="No companies" text="No companies registered yet." />
        )}
      </div>
    </>
  );
};