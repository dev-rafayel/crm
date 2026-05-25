import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await authApi.requestPasswordReset(email);
      navigate('/forgot-password/verify', { state: { email } });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page" style={s.page}>
      <aside className="auth-brand" style={s.brand}>
        <div style={s.brandLogo}>
          <span>●</span> SaleCRM
        </div>
        <h1 style={s.brandTitle}>Reset your password</h1>
        <p style={s.brandText}>
          Enter your email and we’ll send a verification code to proceed.
        </p>
      </aside>

      <div style={s.panel}>
        <div style={s.card}>
          <div className="auth-mobile-logo" style={s.mobileLogo}>
            <span style={{ color: '#3B82F6' }}>●</span> SaleCRM
          </div>

          <form onSubmit={handleSendCode}>
            <h2 style={s.title}>Forgot password?</h2>
            <p style={s.subtitle}>
              Enter the email linked to your account and we will send a code.
            </p>

            {error && <p style={s.error}>{error}</p>}

            <div style={s.field}>
              <label style={s.label} htmlFor="reset-email">
                Email
              </label>
              <input
                id="reset-email"
                style={s.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <button
              style={{ ...s.btn, ...(submitting ? s.btnDisabled : {}) }}
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send verification code'}
            </button>

            <p style={s.hint}>
              <Link
                to="/login"
                style={{
                  color: '#3B82F6',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
