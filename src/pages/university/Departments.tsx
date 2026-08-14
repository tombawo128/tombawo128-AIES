import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { Empty } from '../../components/common/Empty';
import { supabase } from '../../supabaseClient';

interface Department {
  id: string;
  department_name: string;
  code: string;
  description: string;
}

export const UniversityDepartments: React.FC = () => {
  const { user } = useApp();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const fetchDepartments = async () => {
    if (!user?.university_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('university_id', user.university_id)
      .order('department_name', { ascending: true });
    setDepartments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.university_id) {
      setMessage('No university linked to this account.');
      return;
    }
    const { error } = await supabase.from('departments').insert({
      university_id: user.university_id,
      department_name: name,
      code,
      description,
    });
    if (error) {
      setMessage('Failed to add department: ' + error.message);
      return;
    }
    setMessage('Department added.');
    setName('');
    setCode('');
    setDescription('');
    setShowForm(false);
    fetchDepartments();
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteDepartment = async (id: string) => {
    if (!window.confirm('Delete this department?')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) {
      setMessage('Failed to delete: ' + error.message);
      return;
    }
    setMessage('Department deleted.');
    fetchDepartments();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <PageHead
        eyebrow="University"
        title="Departments"
        description="Manage your academic departments."
        action={<button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add department'}</button>}
      />
      {message && <div className="notice" style={{ marginBottom: '15px' }}>{message}</div>}

      {showForm && (
        <form className="card formGrid" onSubmit={submit} style={{ marginBottom: '20px' }}>
          <label className="span2">Department name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>Code
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CS" />
          </label>
          <label className="span2">Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <button className="primary span2">Add department</button>
        </form>
      )}

      <div className="cards3">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : departments.length ? (
          departments.map((d) => (
            <div className="card" key={d.id}>
              <h2>{d.department_name}</h2>
              <p><strong>Code:</strong> {d.code || '—'}</p>
              <p>{d.description || 'No description.'}</p>
              <button className="ghost" onClick={() => deleteDepartment(d.id)}>Delete</button>
            </div>
          ))
        ) : (
          <Empty title="No departments yet" text="Add your first department to get started." />
        )}
      </div>
    </>
  );
};