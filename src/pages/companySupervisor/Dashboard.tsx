import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';
import { supabase } from '../../supabaseClient';

export const CompanySupervisorDashboard: React.FC = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({ interns: 0, evaluations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.company_id) { setLoading(false); return; }
      const { data: internships } = await supabase.from('internships').select('id').eq('company_id', user.company_id);
      const internshipIds = (internships || []).map((i) => i.id);
      let interns = 0;
      if (internshipIds.length) {
        const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).in('internship_id', internshipIds).eq('status', 'accepted');
        interns = count || 0;
      }
      const { count: evalCount } = await supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('evaluator_id', user.id);
      setStats({ interns, evaluations: evalCount || 0 });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  return (
    <>
      <PageHead eyebrow="Company Supervisor" title="Overview" description="Your interns and evaluations." />
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className="metrics">
          <Metric label="Interns" value={stats.interns} detail="Currently supervising" />
          <Metric label="Evaluations" value={stats.evaluations} detail="Submitted by you" />
        </div>
      )}
    </>
  );
};