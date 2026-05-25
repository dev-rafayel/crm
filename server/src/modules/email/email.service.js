import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

let transporter;

function getMissingSmtpVars() {
  const missing = [];
  if (!env.SMTP_HOST?.trim()) missing.push('SMTP_HOST');
  if (!env.SMTP_USER?.trim()) missing.push('SMTP_USER');
  if (!env.SMTP_PASS?.trim()) missing.push('SMTP_PASS');
  return missing;
}

async function getTransporter() {
  if (transporter) return transporter;

  const missing = getMissingSmtpVars();
  if (missing.length > 0) {
    const message =
      `[email] SMTP is not configured. Missing in .env: ${missing.join(', ')}. ` +
      'Invite emails cannot be sent until SMTP_HOST, SMTP_USER and SMTP_PASS are set.';
    console.error(message);
    throw new Error(message);
  }

  const isGmail = env.SMTP_HOST?.toLowerCase().includes('gmail');

  transporter = isGmail
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

  try {
    await transporter.verify();
    console.info(
      `[email] SMTP ready: ${env.SMTP_HOST}:${env.SMTP_PORT} (user: ${env.SMTP_USER})`,
    );
  } catch (err) {
    transporter = null;
    const passLen = env.SMTP_PASS?.length ?? 0;
    console.error('[email] SMTP connection failed. Check .env settings:', {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      smtpPassLength: passLen,
      hint:
        passLen !== 16 && isGmail
          ? 'Google App Password must be exactly 16 characters (no spaces). Create a new one at https://myaccount.google.com/apppasswords'
          : 'Verify SMTP_USER matches the Google account and SMTP_PASS is a fresh App Password (not your login password)',
      error: err.message,
      code: err.code,
    });
    throw err;
  }

  return transporter;
}

function buildInviteEmailHtml({ inviteUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F8F9FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;background:linear-gradient(145deg,#1E3A8A 0%,#3B82F6 100%);">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">● SaleCRM</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:22px;color:#0F172A;">Team invitation</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#64748B;">
                You have been invited to SaleCRM. Click the button below to complete your registration.
                This link is valid for 48 hours.
              </p>
              <a href="${inviteUrl}"
                 style="display:inline-block;padding:14px 28px;background:#3B82F6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:8px;">
                Complete registration
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#94A3B8;line-height:1.5;">
                If the button does not work, copy this link:<br />
                <a href="${inviteUrl}" style="color:#3B82F6;word-break:break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPasswordResetEmailHtml({ code }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F8F9FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;background:linear-gradient(145deg,#1E3A8A 0%,#3B82F6 100%);">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">● SaleCRM</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:22px;color:#0F172A;">Password reset</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#64748B;">
                Use this verification code to set a new password. The code expires in 15 minutes.
              </p>
              <p style="margin:0 0 8px;font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">Your code</p>
              <p style="margin:0 0 24px;font-size:32px;font-weight:700;letter-spacing:0.2em;color:#0F172A;">${code}</p>
              <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.5;">
                If you did not request this, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail({ to, code }) {
  const text = `Your SaleCRM password reset code is: ${code}. It expires in 15 minutes.`;
  const html = buildPasswordResetEmailHtml({ code });

  const mailOptions = {
    from: env.SMTP_FROM || `SaleCRM <${env.SMTP_USER}>`,
    to,
    subject: 'SaleCRM password reset code',
    text,
    html,
  };

  const transport = await getTransporter();

  try {
    const info = await transport.sendMail(mailOptions);
    console.info(`[email] Password reset code sent to ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error('[email] Failed to send password reset email:', {
      to,
      code: err.code,
      message: err.message,
    });
    throw err;
  }
}

export async function sendInviteEmail({ to, token }) {
  const inviteUrl = `${env.CLIENT_URL}/register-by-invite?token=${encodeURIComponent(token)}`;
  const text = `You have been invited to SaleCRM. Complete your registration here: ${inviteUrl}`;
  const html = buildInviteEmailHtml({ inviteUrl });

  const mailOptions = {
    from: env.SMTP_FROM || `SaleCRM <${env.SMTP_USER}>`,
    to,
    subject: 'You are invited to SaleCRM',
    text,
    html,
  };

  const transport = await getTransporter();

  try {
    const info = await transport.sendMail(mailOptions);
    console.info(`[email] Invite sent to ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error('[email] Failed to send invite email. Check SMTP credentials in .env:', {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      to,
      code: err.code,
      responseCode: err.responseCode,
      message: err.message,
      response: err.response,
    });
    throw err;
  }
}
