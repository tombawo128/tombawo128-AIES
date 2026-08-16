import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';
import { exportToCsv } from '../../utils/exportCsv';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
  company_id: string | null;
  university_id: string | null;
}

const roleLabels: Record<string, string> = {
  student: 'Students',
  university: 'Universities',
  company: 'Companies',
  admin: 'Admins',
};

const roleOrder = ['student', 'university', 'company', 'admin'];

export const AdminUsers: React.FC = () => {
  const { user } = useApp();
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('name', { ascending: true });
    if (error) {
      console.error('Failed to fetch users', error);
    }
    setAllUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const logAction = async (action: string, targetId: string, details: string) => {
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      user_name: user?.name,
      action,
      target_type: 'user',
      target_id: targetId,
      details,
    });
  };

  const approveUser = async (u: UserRow) => {
    const { error } = await supabase.from('users').update({ active: true, verified: true }).eq('id', u.id);
    if (error) {
      setMessage('Failed to approve: ' + error.message);
      return;
    }
    if (u.company_id) {
      await supabase.from('companies').update({ active: true, verified: true }).eq('id', u.company_id);
    }
    if (u.university_id && u.role === 'university') {
      await supabase.from('universities').update({ active: true, verified: true }).eq('id', u.university_id);
    }
    await logAction('approve_user', u.id, u.name);
    setMessage('User approved successfully.');
    await fetchUsers();
    setTimeout(() => setMessage(''), 3000);
  };

  const rejectUser = async (u: UserRow) => {
    if (!window.confirm(`Reject and remove ${u.name}'s pending registration? This cannot be undone.`)) return;
    const { error } = await supabase.from('users').delete().eq('id', u.id).eq('active', false);
    if (error) {
      setMessage('Failed to reject: ' + error.message);
      return;
    }
    await logAction('reject_user', u.id, u.name);
    setMessage('Registration rejected.');
    await fetchUsers();
    setTimeout(() => setMessage(''), 3000);
  };

  const deactivateUser = async (u: UserRow) => {
    if (!window.confirm(`Deactivate ${u.name}? They will lose access until reactivated.`)) return;
    const { error } = await supabase.from('users').update({ active: false }).eq('id', u.id);
    if (error) {
      setMessage('Failed to deactivate: ' + error.message);
      return;
    }
    await logAction('deactivate_user', u.id, u.name);
    setMessage('User deactivated.');
    await fetchUsers();
    setTimeout(() => setMessage(''), 3000);
  };

  const exportUsers = () => {
    const rows = allUsers.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Active: u.active ? 'Yes' : 'No',
      Verified: u.verified ? 'Yes' : 'No',
    }));
    exportToCsv('users.csv', rows);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allUsers;
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [allUsers, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, UserRow[]> = {};
    for (const role of roleOrder) groups[role] = [];
    for (const u of filtered) {
      if (!groups[u.role]) groups[u.role] = [];
      groups[u.role].push(u);
    }
    return groups;
  }, [filtered]);

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  return (
    <>
      <PageHead
        eyebrow="Administrator"
        title="All Users"
        description="Browse, search, approve, and manage accounts across every role."
        action={<button className="ghost" onClick={exportUsers}>Export CSV</button>}
      />

      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', marginBottom: '20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)' }}
      />

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>
      ) : filtered.length === 0 ? (
        <Empty title="No users found" text="Try a different search term." />
      ) : (
        roleOrder.map((role) =>
          grouped[role] && grouped[role].length > 0 ? (
            <div key={role} style={{ marginBottom: '24px' }}>
              <h3>{roleLabels[role] || role} ({grouped[role].length})</h3>
              <div className="card">
                {grouped[role].map((u) => (
                  <div className="row" key={u.id}>
                    <div style={{ cursor: 'pointer' }} onClick={() => window.location.assign(`/admin/user/${u.id}`)}>
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                    <div className="rowActions">
                      <Status value={u.active ? 'Active' : 'Pending'} />
                      {!u.active ? (
                        <>
                          <button className="primary" onClick={() => approveUser(u)}>Approve</button>
                          <button className="ghost" onClick={() => rejectUser(u)}>Reject</button>
                        </>
                      ) : u.role !== 'admin' ? (
                        <button className="ghost" onClick={() => deactivateUser(u)}>Deactivate</button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )
      )}
    </>
  );
};