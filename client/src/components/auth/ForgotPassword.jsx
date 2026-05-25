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
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const message = await authApi.requestPasswordReset(email);
      setInfo(message);
      setStep('reset');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
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
      const message = await authApi.resetPasswordWithCode({
        email,
        code,
        password,
      });
      setInfo(message);
      setStep('done');
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
          We will send a verification code to your email so you can set a new
          password securely.
        </p>
      </aside>

      <div style={s.panel}>
        <div style={s.card}>
          <div className="auth-mobile-logo" style={s.mobileLogo}>
            <span style={{ color: '#3B82F6' }}>●</span> SaleCRM
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendCode}>
              <h2 style={s.title}>Forgot password?</h2>
              <p style={s.subtitle}>
                Enter your account email. We will send a 6-digit verification code.
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
                <Link to="/login" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>
                  Back to sign in
                </Link>
              </p>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <h2 style={s.title}>Enter code & new password</h2>
              <p style={s.subtitle}>
                Code sent to <strong>{email}</strong>. Valid for 15 minutes.
              </p>

              {info && (
                <p
                  style={{
                    ...s.error,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  {info}
                </p>
              )}
              {error && <p style={s.error}>{error}</p>}

              <div style={s.field}>
                <label style={s.label} htmlFor="reset-code">
                  Verification code
                </label>
                <input
                  id="reset-code"
                  style={{ ...s.input, letterSpacing: '0.25em', fontWeight: 600 }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  autoComplete="one-time-code"
                />
              </div>

              <div style={s.field}>
                <label style={s.label} htmlFor="reset-password">
                  New password
                </label>
                <input
                  id="reset-password"
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
                <label style={s.label} htmlFor="reset-password-confirm">
                  Confirm password
                </label>
                <input
                  id="reset-password-confirm"
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
                <button
                  type="button"
                  style={s.link}
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setCode('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Use a different email
                </button>
              </p>
            </form>
          )}

          {step === 'done' && (
            <div>
              <h2 style={s.title}>Password updated</h2>
              <p style={s.subtitle}>{info || 'You can now sign in with your new password.'}</p>
              <button
                type="button"
                style={s.btn}
                onClick={() => navigate('/login', { replace: true })}
              >
                Go to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
