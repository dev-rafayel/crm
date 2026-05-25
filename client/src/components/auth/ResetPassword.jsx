import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as authApi from '../../api/auth.api.js';
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const code = location.state?.code || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    if (!email || !code) {
      setError('Start password reset from the verification page first.');
      return;
    }
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
      const message = await authApi.resetPasswordWithCode({
        email,
        code,
        password,
      });
      setInfo(message);
      setDone(true);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="auth-page" style={s.page}>
        <aside className="auth-brand" style={s.brand}>
          <div style={s.brandLogo}>
            <span>●</span> SaleCRM
          </div>
          <h1 style={s.brandTitle}>Password updated</h1>
          <p style={s.brandText}>
            Your password has been reset successfully. You can now sign in.
          </p>
        </aside>

        <div style={s.panel}>
          <div style={s.card}>
            <div className="auth-mobile-logo" style={s.mobileLogo}>
              <span style={{ color: '#3B82F6' }}>●</span> SaleCRM
            </div>

            <h2 style={s.title}>Password updated</h2>
            <p style={s.subtitle}>{info}</p>
            <button
              type="button"
              style={s.btn}
              onClick={() => navigate('/login', { replace: true })}
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={s.page}>
      <aside className="auth-brand" style={s.brand}>
        <div style={s.brandLogo}>
          <span>●</span> SaleCRM
        </div>
        <h1 style={s.brandTitle}>Choose a new password</h1>
        <p style={s.brandText}>
          Set a secure password for your account and sign in again.
        </p>
      </aside>

      <div style={s.panel}>
        <div style={s.card}>
          <div className="auth-mobile-logo" style={s.mobileLogo}>
            <span style={{ color: '#3B82F6' }}>●</span> SaleCRM
          </div>

          <form onSubmit={handleResetPassword}>
            <h2 style={s.title}>New password</h2>
            <p style={s.subtitle}>
              Reset password for <strong>{email || 'your account'}</strong>.
            </p>

            {error && <p style={s.error}>{error}</p>}

            <div style={s.field}>
              <label style={s.label} htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
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
              <label style={s.label} htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
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
              {submitting ? 'Saving…' : 'Set new password'}
            </button>

            <p style={s.hint}>
              <Link
                to="/forgot-password/verify"
                style={{
                  color: '#3B82F6',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Back to code verification
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
