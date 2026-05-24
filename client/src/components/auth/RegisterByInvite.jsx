import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as inviteApi from '../../api/invite.api.js';
import './AuthPage.css';

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

const page = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F8F9FB',
  padding: 24,
  boxSizing: 'border-box',
};

const card = {
  width: '100%',
  maxWidth: 420,
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #E2E8F0',
  padding: 32,
  boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
};

const title = {
  margin: '0 0 6px',
  fontSize: 22,
  fontWeight: 700,
  color: '#0F172A',
};

const subtitle = {
  margin: '0 0 24px',
  fontSize: 14,
  color: '#64748B',
};

const row = { display: 'flex', gap: 12, marginBottom: 0 };

const field = { flex: 1, marginBottom: 16 };

const label = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#334155',
  marginBottom: 6,
};

const input = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  boxSizing: 'border-box',
  outline: 'none',
};

const btn = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: '#3B82F6',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  marginTop: 8,
};

const btnDisabled = { opacity: 0.7, cursor: 'not-allowed' };

const errorBox = {
  margin: '0 0 16px',
  fontSize: 13,
  color: '#DC2626',
  background: '#FEF2F2',
  padding: '10px 12px',
  borderRadius: 8,
  lineHeight: 1.4,
};

function formatError(err) {
  if (err.details && typeof err.details === 'object') {
    const msgs = Object.values(err.details).flat();
    if (msgs.length) return msgs.join('. ');
  }
  return err.message || 'Something went wrong';
}

function normalizePhone(value) {
  return value.replace(/[\s\-()]/g, '');
}

function isValidPhone(value) {
  return PHONE_REGEX.test(normalizePhone(value));
}

export default function RegisterByInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid invitation link. Please request a new invite.');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(phone)) {
      setError(
        'Enter a valid international phone number, e.g. +37499123456 (at least 7 digits after the country code).',
      );
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
      const user = await inviteApi.registerByInvite({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: normalizedPhone,
        password,
      });

      await logout();

      navigate('/login', {
        replace: true,
        state: { registered: true, email: user?.email ?? '' },
      });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page" style={page}>
      <div style={card}>
        <form onSubmit={handleSubmit}>
          <h2 style={title}>Create your account</h2>
          <p style={subtitle}>Complete registration using your invitation</p>

          {error && <p style={errorBox}>{error}</p>}

          <div style={row}>
            <div style={field}>
              <label style={label} htmlFor="invite-first-name">
                First name
              </label>
              <input
                id="invite-first-name"
                style={input}
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
                autoComplete="given-name"
              />
            </div>
            <div style={field}>
              <label style={label} htmlFor="invite-last-name">
                Last name
              </label>
              <input
                id="invite-last-name"
                style={input}
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div style={field}>
            <label style={label} htmlFor="invite-phone">
              Phone number
            </label>
            <input
              id="invite-phone"
              style={input}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+37499123456"
              required
              autoComplete="tel"
            />
          </div>

          <div style={field}>
            <label style={label} htmlFor="invite-password">
              Password
            </label>
            <input
              id="invite-password"
              style={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div style={field}>
            <label style={label} htmlFor="invite-password-confirm">
              Confirm password
            </label>
            <input
              id="invite-password-confirm"
              style={input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            style={{ ...btn, ...(submitting ? btnDisabled : {}) }}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
