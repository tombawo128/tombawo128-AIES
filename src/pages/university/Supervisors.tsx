import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

export const UniversitySupervisors: React.FC = () => {
  const { user } = useApp();
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    if (!user?.university_id) { setLoading(false); return; }
    setLoading(true);
    const { data: sups } = await supabase
      .from('users')
      .select('*')
      .eq('university_id', user.university_id)
      .eq('role', 'academicSupervisor');
    const { data: studs } = await supabase
      .from('users')
      .select('id, name, email, supervisor_id')
      .eq('university_id', user.university_id)
      .eq('role', 'student');
    setSupervisors(sups || []);
    setStudents(studs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const assignStudent = async (studentId: string, supervisorId: string) => {
    const { error } = await supabase.from('users').update({ supervisor_id: supervisorId || null }).eq('id', studentId);
    if (error) { setMessage('Failed to assign: ' + error.message); return; }
    setMessage('Assignment updated.');
    fetchData();
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <>
      <PageHead eyebrow="University" title="Supervisors" description="Academic supervisors and their assigned students." />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      <h3>Supervisors ({supervisors.length})</h3>
      <div className="card" style={{ marginBottom: '24px' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : supervisors.length ? (
          supervisors.map((s) => {
            const count = students.filter((st) => st.supervisor_id === s.id).length;
            return (
              <div className="row" key={s.id}>
                <div>
                  <strong>{s.name}</strong>
                  <span>{s.email} · {count} student{count !== 1 ? 's' : ''} assigned</span>
                </div>
              </div>
            );
          })
        ) : (
          <Empty title="No supervisors yet" text="Academic supervisor accounts registered under your university will appear here." />
        )}
      </div>

      <h3>Assign students to supervisors</h3>
      <div className="card">
        {students.length ? (
          students.map((st) => (
            <div className="row" key={st.id}>
              <div>
                <strong>{st.name}</strong>
                <span>{st.email}</span>
              </div>
              <select
                value={st.supervisor_id || ''}
                onChange={(e) => assignStudent(st.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          ))
        ) : (
          <Empty title="No students" text="No students registered under your university yet." />
        )}
      </div>
    </>
  );
};