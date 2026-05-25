import { useState, useEffect } from 'react';
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

export default function ForgotPasswordVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timerId = setInterval(() => {
      setResendSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [resendSeconds]);

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      await authApi.verifyPasswordResetCode({ email, code });
      navigate('/forgot-password/reset', { state: { email, code } });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (!email) {
      setError('Email is missing. Go back and enter your email again.');
      return;
    }

    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const message = await authApi.requestPasswordReset(email);
      setInfo(message);
      setCode('');
      setResendSeconds(120);
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
        <h1 style={s.brandTitle}>Verify your code</h1>
        <p style={s.brandText}>
          Enter the 6-digit code from your email. After verification, you’ll be
          able to choose a new password.
        </p>
      </aside>

      <div style={s.panel}>
        <div style={s.card}>
          <div className="auth-mobile-logo" style={s.mobileLogo}>
            <span style={{ color: '#3B82F6' }}>●</span> SaleCRM
          </div>

          <form onSubmit={handleVerifyCode}>
            <p style={{ marginBottom: 20 }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#3B82F6',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                ← Back
              </Link>
            </p>

            <h2 style={s.title}>Enter verification code</h2>
            <p style={s.subtitle}>
              Code sent to <strong>{email || 'your email address'}</strong>.
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
              <label style={s.label} htmlFor="verification-code">
                Verification code
              </label>
              <input
                id="verification-code"
                style={{ ...s.input, letterSpacing: '0.25em', fontWeight: 600 }}
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                required
                autoComplete="one-time-code"
              />
            </div>

            <button
              style={{ ...s.btn, ...(submitting ? s.btnDisabled : {}) }}
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Verifying…' : 'Verify code'}
            </button>

            <p style={s.hint}>
              <button
                type="button"
                style={s.link}
                onClick={handleResendCode}
                disabled={submitting || resendSeconds > 0}
              >
                {resendSeconds > 0
                  ? `You can resend in ${Math.floor(resendSeconds / 60)}:${String(
                      resendSeconds % 60,
                    ).padStart(2, '0')}`
                  : 'Send a new code'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
