import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [university, setUniversity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [postedInternships, setPostedInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const { data: u } = await supabase.from('users').select('*').eq('id', id).single();
      setUser(u);

      if (u?.company_id) {
        const { data: c } = await supabase.from('companies').select('*').eq('id', u.company_id).single();
        setCompany(c);
        const { data: internships } = await supabase
          .from('internships')
          .select('*')
          .eq('company_id', u.company_id)
          .order('created_at', { ascending: false });
        setPostedInternships(internships || []);
      }

      if (u?.university_id) {
        const { data: uni } = await supabase.from('universities').select('*').eq('id', u.university_id).single();
        setUniversity(uni);
      }

      if (u?.role === 'student') {
        const { data: apps } = await supabase
          .from('applications')
          .select('id, status, date, internships(title, location)')
          .eq('student_id', id);
        setApplications(apps || []);
      }

      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <>
      <PageHead
        eyebrow="User detail"
        title={`${user.name} – ${user.role}`}
        description="Full profile and activity overview."
        action={<button className="ghost" onClick={() => navigate('/admin/users')}>Back to users</button>}
      />

      <div className="card" style={{ marginBottom: '18px' }}>
        <p>
          <strong>Email:</strong> {user.email} <br />
          <strong>Phone:</strong> {user.phone || '—'} <br />
          <strong>Address:</strong> {user.address || '—'} <br />
          {user.major && <><strong>Major:</strong> {user.major}<br /></>}
        </p>
        <Status value={user.active ? 'Active' : 'Pending'} />
      </div>

      {company && (
        <>
          <h3>Company details</h3>
          <div className="card" style={{ marginBottom: '18px' }}>
            <p>
              <strong>Name:</strong> {company.name} <br />
              <strong>Industry:</strong> {company.industry || '—'} <br />
              <strong>Location:</strong> {company.location || '—'} <br />
              <strong>Email:</strong> {company.email || '—'}
            </p>
            <Status value={company.verified ? 'Verified' : 'Unverified'} />
          </div>

          <h3>Internships posted ({postedInternships.length})</h3>
          <div className="card" style={{ marginBottom: '18px' }}>
            {postedInternships.length ? (
              postedInternships.map((i) => (
                <div className="row" key={i.id}>
                  <div>
                    <strong>{i.title}</strong>
                    <span>{i.location || '—'} · Deadline: {i.deadline || '—'}</span>
                  </div>
                </div>
              ))
            ) : (
              <Empty title="No internships posted" text="This company hasn't posted any internships yet." />
            )}
          </div>
        </>
      )}

      {university && (
        <>
          <h3>University details</h3>
          <div className="card" style={{ marginBottom: '18px' }}>
            <p>
              <strong>Name:</strong> {university.name} <br />
              <strong>City:</strong> {university.city || '—'} <br />
              <strong>Email:</strong> {university.email || '—'}
            </p>
            <Status value={university.verified ? 'Verified' : 'Unverified'} />
          </div>
        </>
      )}

      {user.role === 'student' && (
        <>
          <h3>Applications</h3>
          <div className="card">
            {applications.length ? (
              applications.map((a: any) => (
                <div className="row" key={a.id}>
                  <div>
                    <strong>{a.internships?.title || '—'}</strong>
                    <span>{a.internships?.location || '—'} · Applied: {a.date}</span>
                  </div>
                  <Status value={a.status} />
                </div>
              ))
            ) : (
              <Empty title="No applications" text="This student hasn't applied to any internship." />
            )}
          </div>
        </>
      )}
    </>
  );
};