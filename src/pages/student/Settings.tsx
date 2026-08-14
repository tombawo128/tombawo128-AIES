import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { supabase } from '../../supabaseClient';

interface University {
  id: string;
  name: string;
}

export const StudentSettings: React.FC = () => {
  const { data, user, setData } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [major, setMajor] = useState(user?.major || '');
  const [universityId, setUniversityId] = useState(user?.university_id || '');
  const [saved, setSaved] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch active universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('active', true)
        .order('name');
      if (error) {
        console.error('Failed to fetch universities:', error);
        return;
      }
      setUniversities(data || []);
    };
    fetchUniversities();
  }, []);

  // 2. Helper to update the user profile in Supabase
  const updateProfile = async (updates: any) => {
    if (!user) return false;
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    setLoading(false);
    if (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
    return true;
  };

  // 3. Auto-save when the university dropdown changes
  const handleUniversityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUniversityId = e.target.value;
    setUniversityId(newUniversityId);
    const success = await updateProfile({ university_id: newUniversityId || null });
    if (success) {
      // Update context
      const updatedUser = { ...user!, university_id: newUniversityId };
      setData({
        ...data,
        users: data.users.map((u) => (u.id === user!.id ? updatedUser : u)),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // 4. Save the other fields (name, phone, address, major)
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = { name, phone, address, major };
    const success = await updateProfile(updates);
    if (success) {
      const updatedUser = { ...user!, name, phone, address, major };
      setData({
        ...data,
        users: data.users.map((u) => (u.id === user!.id ? updatedUser : u)),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="Student"
        title="Settings"
        description="Update your profile information."
      />
      <form className="card formGrid" onSubmit={save}>
        <label className="span2">
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Major / Field of study
          <input value={major} onChange={(e) => setMajor(e.target.value)} />
        </label>
        <label>
          University
          <select value={universityId} onChange={handleUniversityChange}>
            <option value="">Select university</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <button className="primary span2" disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
        {saved && <div className="notice">Profile updated successfully.</div>}
      </form>
    </>
  );
};