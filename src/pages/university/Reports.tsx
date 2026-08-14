import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

export const UniversityReports: React.FC = () => {
  const { user } = useApp();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.university_id) {
        setLoading(false);
        return;
      }
      const { data: students } = await supabase
        .from('users')
        .select('id, name')
        .eq('university_id', user.university_id)
        .eq('role', 'student');

      const studentIds = (students || []).map((s) => s.id);
      const nameMap: Record<string, string> = {};
      (students || []).forEach((s) => { nameMap[s.id] = s.name; });

      if (studentIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .in('student_id', studentIds)
        .order('date', { ascending: false });

      setReports((reportsData || []).map((r) => ({ ...r, studentName: nameMap[r.student_id] || 'Unknown' })));
      setLoading(false);
    };
    fetchReports();
  }, [user]);

  return (
    <>
      <PageHead eyebrow="University" title="Student reports" description="Weekly reports submitted by your students." />
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : reports.length ? (
          reports.map((r) => (
            <div className="report" key={r.id}>
              <div>
                <strong>{r.studentName} — Week {r.week}</strong>
                <span>{r.date} · {r.hours || 0} hours</span>
                <p>{r.activities}</p>
              </div>
              <Status value={r.status} />
            </div>
          ))
        ) : (
          <Empty title="No reports yet" text="Weekly reports from your students will appear here." />
        )}
      </div>
    </>
  );
};