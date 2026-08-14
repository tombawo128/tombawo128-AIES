import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const AdminLogs: React.FC = () => {
  const { user } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (!user || user.role !== 'admin') return <div>Access Denied. Only the General Admin can view this.</div>;

  return (
    <>
      <PageHead eyebrow="Administrator" title="Audit log" description="A record of admin actions across the platform." />
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading logs...</div>
        ) : logs.length ? (
          logs.map((log) => (
            <div className="row" key={log.id}>
              <div>
                <strong>{log.action}</strong>
                <span>{log.details ? `${log.details} · ` : ''}by {log.user_name || 'Unknown'} · {new Date(log.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <Empty title="No activity yet" text="Admin actions will appear here as they happen." />
        )}
      </div>
    </>
  );
};