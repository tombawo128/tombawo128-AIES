import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';

export const UniversitySettings: React.FC = () => {
  const { data, user, setData } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user!, name, phone, address };
    setData({
      ...data,
      users: data.users.map((u) => (u.id === user!.id ? updatedUser : u)),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHead eyebrow="University" title="Settings" description="Update your university profile." />
      <form className="card formGrid" onSubmit={save}>
        <label className="span2">
          University name
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
        <button className="primary span2">Save changes</button>
        {saved && <div className="notice">Profile updated successfully.</div>}
      </form>
    </>
  );
};