import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/Logo';
import { Icon } from '../../components/Icon';

export const Login: React.FC = () => {
  const { user, login, loading } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to the correct dashboard
  if (user) {
    const home = (r: string) =>
      `/${r === 'academicSupervisor' ? 'supervisor-academic' : r === 'companySupervisor' ? 'supervisor-company' : r}/dashboard`;
    return <Navigate to={home(user.role)} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="authPanel">
        <Logo light />
        <div className="authCopy">
          <p className="eyebrow">INTERNSHIP MANAGEMENT PLATFORM</p>
          <h1>Manage internships with clarity.</h1>
          <p>Connect students, universities, supervisors and organizations through one practical workspace.</p>
        </div>
        <div className="authFoot">AIES is designed for real academic and workplace workflows.</div>
      </div>
      <div className="authForm">
        <div className="formBox">
          <h2>Sign in</h2>
          <p className="muted"></p>
          <form onSubmit={submit} autoComplete="off">
            <input type="text" style={{ display: 'none' }} autoComplete="username" />
            <input type="password" style={{ display: 'none' }} autoComplete="new-password" />

            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                name="email"
                autoComplete="off"
                required
                disabled={loading || isSubmitting}
              />
            </label>
            <label>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="password"
                autoComplete="new-password"
                required
                disabled={loading || isSubmitting}
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="primary" disabled={loading || isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
              {!isSubmitting && <Icon name="arrow" size={16} />}
            </button>
          </form>
          <p className="small">
            <a href="/register">Create account</a> · <a href="/forgot-password">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
};