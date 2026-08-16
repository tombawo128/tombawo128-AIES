import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/Logo';

const roleRoutes: Record<string, string> = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  university: '/university/dashboard',
  admin: '/admin/dashboard',
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Once context's user updates after a successful login, redirect
  useEffect(() => {
    if (attempted && user) {
      navigate(roleRoutes[user.role] || '/login');
    }
  }, [user, attempted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await login(email, password);
      setAttempted(true);
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