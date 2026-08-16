import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Role } from '../../types';
import { supabase } from '../../supabaseClient';

interface OrgOption {
  id: string;
  name: string;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [major, setMajor] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  const [universityName, setUniversityName] = useState('');
  const [city, setCity] = useState('');

  const [universities, setUniversities] = useState<OrgOption[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>(['student', 'university', 'company']);

  useEffect(() => {
    const checkAdmin = async () => {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');
      if (error) {
        console.error('Admin count check failed', error);
        return;
      }
      if (count === 0) {
        setAvailableRoles(['student', 'university', 'company', 'admin']);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (role !== 'student') return;
    const fetchUniversities = async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('active', true);
      if (error) {
        console.error('Failed to fetch universities', error);
        return;
      }
      setUniversities(data || []);
    };
    fetchUniversities();
  }, [role]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Signup failed.');

      let companyId: string | undefined;
      let universityIdToUse: string | undefined = universityId || undefined;

      if (role === 'company') {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({ name: companyName, industry, location, email, active: false, verified: false })
          .select()
          .single();
        if (companyError) throw new Error(companyError.message);
        companyId = company.id;
      }

      if (role === 'university') {
        if (!universityName.trim()) {
          throw new Error('University name is required for university registration.');
        }
        const { data: uni, error: uniError } = await supabase
          .from('universities')
          .insert({ name: universityName, city, email, active: false, verified: false })
          .select()
          .single();
        if (uniError) throw new Error(uniError.message);
        universityIdToUse = uni.id;
      }

      const profileData = {
        auth_id: authData.user.id,
        name,
        email,
        role,
        phone,
        address,
        active: role === 'admin' || role === 'student',
        verified: role === 'admin' || role === 'student',
        major: role === 'student' ? major : null,
        university_id: universityIdToUse,
        company_id: companyId,
      };

      const { error: profileError } = await supabase.from('users').insert(profileData);
      if (profileError) {
        console.error('Profile insert error:', profileError);
        if (profileError.message.includes('auth_id')) {
          throw new Error('Database setup incomplete: Please contact the administrator to add the auth_id column to the users table.');
        }
        throw new Error(profileError.message);
      }

      setMessage(
        role === 'student'
          ? 'Account created! You can now sign in.'
          : 'Account created. You must wait for admin approval to sign in.'
      );
      setTimeout(() => navigate('/login'), 900);
    } catch (err: any) {
      setMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = (r: Role) => {
    if (r === 'admin') return 'General Admin (First time setup)';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div className="simpleAuth">
      <Logo />
      <div className="formBox wide">
        <p className="eyebrow">ACCOUNT SETUP</p>
        <h1>Create your AIES account</h1>
        <p className="muted">Students, companies and universities can register here. Some registrations are reviewed by an admin before activation.</p>
        <form onSubmit={submit} className="grid2">
          <label>
            Full name / Contact person
            <input value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required disabled={isSubmitting} />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required disabled={isSubmitting} />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={isSubmitting}>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
          </label>
          <label>
            Address
            <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSubmitting} />
          </label>

          {role === 'student' && (
            <>
              <label className="span2">
                University
                <select value={universityId} onChange={(e) => setUniversityId(e.target.value)} disabled={isSubmitting} required>
                  <option value="">Select university</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span2">
                Major / Field of study
                <input value={major} onChange={(e) => setMajor(e.target.value)} disabled={isSubmitting} />
              </label>
            </>
          )}

          {role === 'company' && (
            <>
              <label className="span2">
                Company name
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required disabled={isSubmitting} />
              </label>
              <label>
                Industry
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={isSubmitting} />
              </label>
              <label>
                Location
                <input value={location} onChange={(e) => setLocation(e.target.value)} disabled={isSubmitting} />
              </label>
            </>
          )}

          {role === 'university' && (
            <>
              <label className="span2">
                University name
                <input value={universityName} onChange={(e) => setUniversityName(e.target.value)} required disabled={isSubmitting} />
              </label>
              <label>
                City
                <input value={city} onChange={(e) => setCity(e.target.value)} disabled={isSubmitting} />
              </label>
            </>
          )}

          <button className="primary full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Request approval'}
          </button>
        </form>
        {message && <div className="notice">{message}</div>}
        <a href="/login" className="small">
          Back to sign in
        </a>
      </div>
    </div>
  );
};