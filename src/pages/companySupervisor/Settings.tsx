import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { supabase } from '../../supabaseClient';

export const CompanySupervisorSettings: React.FC = () => {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error } = await supabase.from('users').update({ name, phone, address }).eq('id', user!.id);
    if (error) { setError(error.message); } else {
      setUser({ ...user!, name, phone, address });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <>
      <PageHead eyebrow="Company Supervisor" title="Settings" description="Update your profile." />
      <form className="card formGrid" onSubmit={save}>
        <label className="span2">Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
        </label>
        <label>Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={saving} />
        </label>
        <label>Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={saving} />
        </label>
        <button className="primary span2" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        {saved && <div className="notice">Profile updated successfully.</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </>
  );
};