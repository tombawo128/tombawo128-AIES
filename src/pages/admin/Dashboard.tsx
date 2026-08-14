import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';
import { supabase } from '../../supabaseClient';

export const AdminDashboard: React.FC = () => {
  const { user } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [users, students, companies, universities, internships, applications, pendingUsers, recentLogs] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('universities').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('internships').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('active', false),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalUsers: users.count || 0,
        students: students.count || 0,
        companies: companies.count || 0,
        universities: universities.count || 0,
        internships: internships.count || 0,
        applications: applications.count || 0,
        pendingUsers: pendingUsers.count || 0,
        recentActivity: recentLogs.data || [],
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  return (
    <>
      <PageHead eyebrow="Administrator" title="System overview" description="Monitor all activity across the platform." />
      {loading || !stats ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>
      ) : (
        <>
          <div className="metrics">
            <Metric label="Users" value={stats.totalUsers} detail="Total accounts" />
            <Metric label="Students" value={stats.students} detail="Registered students" />
            <Metric label="Companies" value={stats.companies} detail="Verified partners" />
            <Metric label="Universities" value={stats.universities} detail="Verified partners" />
            <Metric label="Internships" value={stats.internships} detail="Total listings" />
            <Metric label="Applications" value={stats.applications} detail="Submitted" />
          </div>
          {stats.pendingUsers > 0 && (
            <div className="card" style={{ marginBottom: '18px' }}>
              <h2>Pending approvals</h2>
              <p className="muted">{stats.pendingUsers} account(s) awaiting your review.</p>
            </div>
          )}
          <div className="dashboardGrid">
            <section className="card">
              <h2>Recent activity</h2>
              {stats.recentActivity.length ? (
                stats.recentActivity.map((log: any, i: number) => (
                  <div className="row" key={i}>
                    <div>
                      <strong>{log.action}</strong>
                      <span>{log.details ? `${log.details} · ` : ''}by {log.user_name || 'Unknown'} · {new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">No recent activity yet.</p>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
};