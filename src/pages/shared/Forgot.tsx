import React, { useState } from 'react';
import { Logo } from '../../components/Logo';

export const Forgot: React.FC = () => {
  const [sent, setSent] = useState(false);
  return (
    <div className="simpleAuth">
      <Logo />
      <div className="formBox narrow">
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Reset your password</h1>
        <p className="muted">Enter your account email. This frontend demo only confirms the request.</p>
        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <label>
              Email
              <input type="email" required />
            </label>
            <button className="primary full">Send request</button>
          </form>
        ) : (
          <div className="notice">
            Request received. In a production deployment, a secure reset email would be sent.
          </div>
        )}
        <a href="/login" className="small">
          Back to sign in
        </a>
      </div>
    </div>
  );
};