import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import authStyles from './authStyles.js';
import './AuthPage.css';

const s = authStyles;

function formatError(err) {
  if (err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details).flat();
    if (msgs.length) return msgs.join('. ');
  }
  return err.message || 'Something went wrong';
}

function LoginForm({ registered, initialEmail = '' }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={s.title}>Welcome back</h2>
      <p style={s.subtitle}>Sign in to continue to SaleCRM</p>

      {registered && (
        <p
          style={{
            ...s.error,
            background: '#ECFDF5',
            color: '#047857',
            border: '1px solid #A7F3D0',
          }}
        >
          Account created. Sign in with your email and the password you just set.
        </p>
      )}

      {error && <p style={s.error}>{error}</p>}

      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          autoComplete="email"
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <button
        style={{ ...s.btn, ...(submitting ? s.btnDisabled : {}) }}
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p style={{ ...s.hint, marginTop: 12 }}>
        <Link
          to="/forgot-password"
          style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}
        >
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const registered = location.state?.registered === true;
  const prefilledEmail = location.state?.email || '';

  return (
    <div className="auth-page" style={s.page}>
      <aside className="auth-brand" style={s.brand}>
        <div style={s.brandLogo}>
          <span>●</span> SaleCRM
        </div>
        <h1 style={s.brandTitle}>Manage clients and deals in one place</h1>
        <p style={s.brandText}>
          Track your pipeline, collaborate with your team, and close more deals
          faster.
        </p>
      </aside>

      <div style={s.panel}>
        <div style={s.card}>
          <div className="auth-mobile-logo" style={s.mobileLogo}>
            <span style={{ color: '#3B82F6' }}>●</span> SaleCRM
          </div>

          <LoginForm registered={registered} initialEmail={prefilledEmail} />
        </div>
      </div>
    </div>
  );
}
