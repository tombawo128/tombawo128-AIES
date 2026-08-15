import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export const StudentDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [internships, setInternships] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      const { data: internshipsData } = await supabase
        .from('internships')
        .select('*')
        .order('deadline', { ascending: true })
        .limit(3);
      setInternships(internshipsData || []);

      const companyIds = [...new Set((internshipsData || []).map((i) => i.company_id))];
      if (companyIds.length) {
        const { data: comps } = await supabase.from('companies').select('id, name').in('id', companyIds);
        const map: Record<string, string> = {};
        (comps || []).forEach((c) => { map[c.id] = c.name; });
        setCompanies(map);
      }

      const { data: appsData } = await supabase.from('applications').select('*').eq('student_id', user.id);
      setApplications(appsData || []);

      const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('student_id', user.id);
      setReportsCount(count || 0);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const pending = applications.filter((a) => a.status === 'pending').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;
  const hasApplied = applications.length > 0;

  const daysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Progress timeline steps
  const steps = [
    { label: 'Applied', done: hasApplied },
    { label: 'Under Review', done: pending > 0 || accepted > 0 },
    { label: 'Accepted', done: accepted > 0 },
    { label: 'Reports', done: reportsCount > 0 },
    { label: 'Evaluated', done: false },
  ];

  return (
    <>
      <PageHead eyebrow="Student" title="Dashboard" description="Overview of your internship journey." />

      <div className="metrics">
        <div className="metric">
          <span>Open Internships</span>
          <strong>{internships.length}</strong>
          <small>Available to apply</small>
        </div>
        <div className="metric">
          <span>Pending Applications</span>
          <strong>{pending}</strong>
          <small>Awaiting response</small>
        </div>
        <div className="metric">
          <span>Accepted</span>
          <strong>{accepted}</strong>
          <small>Placements confirmed</small>
        </div>
        <div className="metric">
          <span>Reports Submitted</span>
          <strong>{reportsCount}</strong>
          <small>Logbook entries</small>
        </div>
      </div>

      {/* Standout feature 1: Progress timeline */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="sectionTitle">
          <div>
            <h2>Your journey</h2>
            <p>Track where you stand in the internship process</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                minWidth: '100px',
                textAlign: 'center',
                padding: '10px 8px',
                borderRadius: '10px',
                background: s.done ? '#23212c' : '#f2f2ed',
                color: s.done ? '#F1FEC8' : 'rgba(35,33,44,.5)',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboardGrid">
        <div className="card">
          <div className="sectionTitle">
            <div>
              <h2>Recent Internships</h2>
              <p>Latest opportunities matching your profile</p>
            </div>
            <Link to="/student/internships" className="textLink">
              View all →
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : internships.length === 0 ? (
            <Empty title="No internships posted yet" text="Check back later." />
          ) : (
            internships.map((internship) => {
              const days = daysLeft(internship.deadline);
              return (
                <div className="row" key={internship.id}>
                  <div>
                    <strong>{internship.title}</strong>
                    <span>{companies[internship.company_id] || 'Unknown company'}</span>
                    <small>
                      {days > 0 ? `${days} day${days !== 1 ? 's' : ''} left to apply` : 'Deadline passed'}
                    </small>
                  </div>
                  <button className="primary smallBtn" onClick={() => navigate('/student/internships')}>
                    View
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Standout feature 2: dynamic next-step guidance */}
        <div className="card darkCard">
          <h2>Your Next Step</h2>
          <p className="lightMuted">
            {accepted > 0
              ? 'Congratulations! You have been accepted. Keep your weekly reports up to date.'
              : pending > 0
              ? `You have ${pending} pending application${pending > 1 ? 's' : ''}. Keep checking for updates!`
              : 'Browse internships and start applying today.'}
          </p>
          <div className="progressLine">
            <span style={{ width: `${accepted > 0 ? 100 : pending > 0 ? 50 : 10}%` }} />
          </div>
          {internships.length === 0 && !loading && (
            <button className="ghost" style={{ marginTop: '16px' }} onClick={() => navigate('/student/internships')}>
              Browse internships
            </button>
          )}
        </div>
      </div>
    </>
  );
};