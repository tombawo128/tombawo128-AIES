import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';
import { User } from '../../types';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch all users (only admins can see this)
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch users:', error);
      setMessage('Error loading users.');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Approve user
  const approveUser = async (userId: string) => {
    if (!window.confirm('Approve this user? They will be able to log in.')) return;

    const { error } = await supabase
      .from('users')
      .update({ active: true, verified: true })
      .eq('id', userId);

    if (error) {
      setMessage('Failed to approve: ' + error.message);
      return;
    }

    setMessage('User approved successfully!');
    fetchUsers(); // Refresh list
    setTimeout(() => setMessage(''), 3000);
  };

  // Reject / Deactivate user
  const rejectUser = async (userId: string) => {
    if (!window.confirm('Reject this user? They will be deactivated.')) return;

    const { error } = await supabase
      .from('users')
      .update({ active: false, verified: false })
      .eq('id', userId);

    if (error) {
      setMessage('Failed to reject: ' + error.message);
      return;
    }

    setMessage('User deactivated.');
    fetchUsers();
    setTimeout(() => setMessage(''), 3000);
  };

  // Delete user (hard delete)
  const deleteUser = async (userId: string) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      setMessage('Failed to delete: ' + error.message);
      return;
    }

    setMessage('User deleted.');
    fetchUsers();
    setTimeout(() => setMessage(''), 3000);
  };

  // Filter: Only show pending users (active = false) – you can remove this filter to see all
  const pendingUsers = users.filter((u) => !u.active);
  const activeUsers = users.filter((u) => u.active);

  return (
    <>
      <PageHead
        eyebrow="Admin"
        title="User Management"
        description="Approve or reject pending registrations."
      />

      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      <div className="card">
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>
          Pending Approvals ({pendingUsers.length})
        </h2>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : pendingUsers.length === 0 ? (
          <Empty title="All clear!" text="No pending users need approval." />
        ) : (
          <div className="table">
            <div className="thead">
              <span>Name / Email</span>
              <span>Role</span>
              <span>University / Company</span>
              <span>Actions</span>
            </div>

            {pendingUsers.map((u) => (
              <div className="trow" key={u.id}>
                <div>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </div>
                <div>
                  <span className="status pending">{u.role}</span>
                </div>
                <div>
                  <small>
                    {u.university_id ? `University ID: ${u.university_id}` : ''}
                    {u.company_id ? `Company ID: ${u.company_id}` : ''}
                  </small>
                </div>
                <div className="rowActions">
                  <button
                    className="primary smallBtn"
                    onClick={() => approveUser(u.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="ghost smallBtn"
                    onClick={() => rejectUser(u.id)}
                  >
                    Reject
                  </button>
                  <button
                    className="ghost smallBtn"
                    style={{ color: '#76524f' }}
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional: Show active users too */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>
          Active Users ({activeUsers.length})
        </h2>
        {activeUsers.length === 0 ? (
          <Empty title="No active users yet." text="Approved users will appear here." />
        ) : (
          <div className="table">
            <div className="thead">
              <span>Name / Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {activeUsers.map((u) => (
              <div className="trow" key={u.id}>
                <div>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </div>
                <div>
                  <span className="status active">{u.role}</span>
                </div>
                <div>
                  <span className="status approved">Verified</span>
                </div>
                <div className="rowActions">
                  <button
                    className="ghost smallBtn"
                    onClick={() => rejectUser(u.id)}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};