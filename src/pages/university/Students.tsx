import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { Status } from '../../components/Status';
import { supabase } from '../../supabaseClient';

export const UniversityStudents: React.FC = () => {
  const { user } = useApp();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.university_id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('university_id', user.university_id)
        .eq('role', 'student')
        .order('name', { ascending: true });
      setStudents(data || []);
      setLoading(false);
    };
    fetchStudents();
  }, [user]);

  const viewStudent = async (student: any) => {
    setSelected(student);
    const { data } = await supabase
      .from('applications')
      .select('id, status, date, internships(title, location)')
      .eq('student_id', student.id);
    setApplications(data || []);
  };

  if (selected) {
    return (
      <>
        <PageHead
          eyebrow="University"
          title={selected.name}
          description="Student progress and internship applications."
          action={<button className="ghost" onClick={() => setSelected(null)}>Back to students</button>}
        />
        <div className="card" style={{ marginBottom: '18px' }}>
          <p>
            <strong>Email:</strong> {selected.email} <br />
            <strong>Major:</strong> {selected.major || '—'} <br />
            <strong>Phone:</strong> {selected.phone || '—'}
          </p>
        </div>
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
            <Empty title="No applications" text="This student hasn't applied to any internship yet." />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead eyebrow="University" title="Students" description="Students enrolled from your university." />
      <div className="card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : students.length ? (
          students.map((s) => (
            <div className="row" key={s.id} style={{ cursor: 'pointer' }} onClick={() => viewStudent(s)}>
              <div>
                <strong>{s.name}</strong>
                <span>{s.email} · {s.major || 'No major listed'}</span>
              </div>
              <Status value={s.active ? 'Active' : 'Pending'} />
            </div>
          ))
        ) : (
          <Empty title="No students yet" text="Students who register with your university will appear here." />
        )}
      </div>
    </>
  );
};