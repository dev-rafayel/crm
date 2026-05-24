import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

function LoginForm({ onSwitch, registered, initialEmail = '' }) {
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
        <p style={{ ...s.error, background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
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

      <p style={s.hint}>
        Don't have an account?{' '}
        <button type="button" style={s.link} onClick={() => onSwitch('register')}>
          Sign up
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={s.title}>Create account</h2>
      <p style={s.subtitle}>Register to start using SaleCRM</p>

      {error && <p style={s.error}>{error}</p>}

      <div style={s.row}>
        <div style={s.field}>
          <label style={s.label}>First name</label>
          <input
            style={s.input}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Name"
            required
            autoComplete="given-name"
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Last name</label>
          <input
            style={s.input}
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Surname"
            required
            autoComplete="family-name"
          />
        </div>
      </div>

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
        <label style={s.label}>Mobile Number</label>
        <input
          style={s.input}
          type="tel"
          value={phone}
          required
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
          autoComplete="tel"
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Confirm password</label>
        <input
          style={s.input}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          required
          autoComplete="new-password"
        />
      </div>

      <button
        style={{ ...s.btn, ...(submitting ? s.btnDisabled : {}) }}
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>

      <p style={s.hint}>
        Already have an account?{' '}
        <button type="button" style={s.link} onClick={() => onSwitch('login')}>
          Sign in
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const registered = location.state?.registered === true;
  const prefilledEmail = location.state?.email || '';
  const [mode, setMode] = useState('login');

  useEffect(() => {
    if (location.pathname === '/login' || registered) {
      setMode('login');
    }
  }, [location.pathname, registered]);

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

          <div style={s.tabs}>
            <button
              type="button"
              style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}
              onClick={() => setMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              style={{ ...s.tab, ...(mode === 'register' ? s.tabActive : {}) }}
              onClick={() => setMode('register')}
            >
              Sign up
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm
              onSwitch={setMode}
              registered={registered}
              initialEmail={prefilledEmail}
            />
          ) : (
            <RegisterForm onSwitch={setMode} />
          )}
        </div>
      </div>

    </div>
  );
}
