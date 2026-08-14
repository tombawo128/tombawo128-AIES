import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabaseClient';
import { Logo } from '../../components/Logo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('No user returned.');

      // 2. Fetch the user's profile from the 'users' table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (profileError) throw new Error('Profile not found. Please contact support.');

      // 3. Check if the user is active (approved by admin)
      if (!profile.active) {
        setMessage('Your account is pending admin approval. Please try again later.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 4. Save user to context and redirect
      setUser(profile);

      // 5. Redirect based on role
      const roleRoutes: Record<string, string> = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        university: '/university/dashboard',
        academicSupervisor: '/supervisor-academic/dashboard',
        companySupervisor: '/supervisor-company/dashboard',
        admin: '/admin/dashboard',
      };

      const redirectPath = roleRoutes[profile.role] || '/student/dashboard';
      navigate(redirectPath);

    } catch (err: any) {
      setMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simpleAuth">
      <Logo />
      <div className="formBox narrow">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to AIES</h1>
        <p className="muted">Access your internships, reports, and evaluations.</p>

        <form onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              minLength={8}
            />
          </label>

          <button className="primary full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {message && <div className="notice">{message}</div>}
        </form>

        <Link to="/forgot-password" className="small">
          Forgot password?
        </Link>
        <Link to="/register" className="small" style={{ marginLeft: '12px' }}>
          Create account
        </Link>
      </div>
    </div>
  );
};