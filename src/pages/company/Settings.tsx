import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHead } from '../../components/common/PageHead';
import { supabase } from '../../supabaseClient';

export const CompanySettings: React.FC = () => {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user?.company_id) return;
      const { data } = await supabase.from('companies').select('*').eq('id', user.company_id).single();
      if (data) {
        setCompanyName(data.name || '');
        setIndustry(data.industry || '');
        setLocation(data.location || '');
        setCompanyEmail(data.email || '');
      }
    };
    fetchCompany();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: userError } = await supabase.from('users').update({ name, phone, address }).eq('id', user!.id);
    if (userError) {
      setError(userError.message);
      setSaving(false);
      return;
    }

    if (user?.company_id) {
      const { error: companyError } = await supabase
        .from('companies')
        .update({ name: companyName, industry, location, email: companyEmail })
        .eq('id', user.company_id);
      if (companyError) {
        setError(companyError.message);
        setSaving(false);
        return;
      }
    }

    setUser({ ...user!, name, phone, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <>
      <PageHead eyebrow="Company" title="Settings" description="Update your account and company profile." />
      <form className="card formGrid" onSubmit={save}>
        <h3 className="span2">Your account</h3>
        <label className="span2">Contact name
          <input value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
        </label>
        <label>Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={saving} />
        </label>
        <label>Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={saving} />
        </label>

        <h3 className="span2" style={{ marginTop: '10px' }}>Company profile</h3>
        <label className="span2">Company name
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required disabled={saving} />
        </label>
        <label>Industry
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={saving} />
        </label>
        <label>Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} disabled={saving} />
        </label>
        <label className="span2">Company email
          <input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} type="email" disabled={saving} />
        </label>

        <button className="primary span2" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        {saved && <div className="notice">Profile updated successfully.</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </>
  );
};