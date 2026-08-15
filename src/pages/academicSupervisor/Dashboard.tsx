import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Metric } from '../../components/common/Metric';
import { supabase } from '../../supabaseClient';

export const AcademicDashboard: React.FC = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({ students: 0, reports: 0, pendingReports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const { data: students } = await supabase.from('users').select('id').eq('supervisor_id', user.id);
      const studentIds = (students || []).map((s) => s.id);
      let reports = 0, pending = 0;
      if (studentIds.length) {
        const { count: total } = await supabase.from('reports').select('*', { count: 'exact', head: true }).in('student_id', studentIds);
        const { count: pendingCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).in('student_id', studentIds).eq('status', 'submitted');
        reports = total || 0;
        pending = pendingCount || 0;
      }
      setStats({ students: studentIds.length, reports, pendingReports: pending });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  return (
    <>
      <PageHead eyebrow="Academic Supervisor" title="Overview" description="Your assigned students and their progress." />
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className="metrics">
          <Metric label="Students" value={stats.students} detail="Assigned to you" />
          <Metric label="Reports" value={stats.reports} detail="Total submitted" />
          <Metric label="Pending review" value={stats.pendingReports} detail="Awaiting feedback" />
        </div>
      )}
    </>
  );
};