import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Status } from '../../components/Status';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useApp();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [university, setUniversity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [postedInternships, setPostedInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
    } else {
      setCompany(null);
      setPostedInternships([]);
    }

    if (u?.university_id) {
      const { data: uni } = await supabase.from('universities').select('*').eq('id', u.university_id).single();
      setUniversity(uni);
    } else {
      setUniversity(null);
    }

    if (u?.role === 'student') {
      const { data: apps } = await supabase
        .from('applications')
        .select('id, status, date, internships(title, location)')
        .eq('student_id', id);
      setApplications(apps || []);
    } else {
      setApplications([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const logAction = async (action: string, details: string) => {
    await supabase.from('audit_logs').insert({
      user_id: adminUser?.id,
      user_name: adminUser?.name,
      action,
      target_type: 'user',
      target_id: id,
      details,
    });
  };

  const deactivate = async () => {
    if (!window.confirm(`Deactivate ${user.name}? They will lose access until reactivated.`)) return;
    const { error } = await supabase.from('users').update({ active: false }).eq('id', id);
    if (error) {
      setMessage('Failed to deactivate: ' + error.message);
      return;
    }
    await logAction('deactivate_user', user.name);
    setMessage('User deactivated.');
    fetchDetail();
    setTimeout(() => setMessage(''), 3000);
  };

  const reactivate = async () => {
    const { error } = await supabase.from('users').update({ active: true }).eq('id', id);
    if (error) {
      setMessage('Failed to reactivate: ' + error.message);
      return;
    }
    await logAction('reactivate_user', user.name);
    setMessage('User reactivated.');
    fetchDetail();
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteUser = async () => {
    const linkedWarning =
      user.role === 'company' && company
        ? `\n\nThis will also permanently delete their company "${company.name}" and all ${postedInternships.length} internship(s) they posted.`
        : user.role === 'university' && university
        ? `\n\nThis will also permanently delete their university "${university.name}".`
        : '';

    if (!window.confirm(`Permanently delete ${user.name}'s account? This cannot be undone.${linkedWarning}`)) return;
    if (!window.confirm('Are you absolutely sure? This will remove all their data.')) return;

    try {
      // Cascade: delete linked company and its internships (and any applications to those internships)
      if (user.role === 'company' && user.company_id) {
        const internshipIds = postedInternships.map((i) => i.id);
        if (internshipIds.length > 0) {
          await supabase.from('applications').delete().in('internship_id', internshipIds);
          await supabase.from('internships').delete().eq('company_id', user.company_id);
        }
        await supabase.from('companies').delete().eq('id', user.company_id);
      }

      // Cascade: delete linked university
      if (user.role === 'university' && user.university_id) {
        await supabase.from('departments').delete().eq('university_id', user.university_id);
        await supabase.from('universities').delete().eq('id', user.university_id);
      }

      // Cascade: if a student, remove their applications and reports too
      if (user.role === 'student') {
        await supabase.from('applications').delete().eq('student_id', id);
        await supabase.from('reports').delete().eq('student_id', id);
      }

      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;

      await logAction('delete_user', user.name);
      navigate('/admin/users');
    } catch (err: any) {
      setMessage('Failed to delete: ' + err.message);
    }
  };

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

      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      <div className="card" style={{ marginBottom: '18px' }}>
        <p>
          <strong>Email:</strong> {user.email} <br />
          <strong>Phone:</strong> {user.phone || '—'} <br />
          <strong>Address:</strong> {user.address || '—'} <br />
          {user.major && <><strong>Major:</strong> {user.major}<br /></>}
          <strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
        </p>
        <Status value={user.active ? 'Active' : 'Pending / Inactive'} />

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          {user.active ? (
            user.role !== 'admin' && (
              <button className="ghost" onClick={deactivate}>Deactivate</button>
            )
          ) : (
            <button className="primary" onClick={reactivate}>Reactivate</button>
          )}
          {user.role !== 'admin' && (
            <button className="ghost" onClick={deleteUser} style={{ color: '#c0392b' }}>Delete account</button>
          )}
        </div>
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