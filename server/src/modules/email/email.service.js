import { env } from '../../config/env.js';

async function sendResendEmail({ from, to, subject, text, html }) {
  // Защита: если ключа нет, не шлём запрос, чтобы не вешать сервер
  if (!env.RESEND_API_KEY) {
    console.warn('[email] Сбой отправки: RESEND_API_KEY не настроен в окружении.');
    return null;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from, to, subject, text, html }),
  });

  // Если Resend вернул 401/400/500, обрабатываем это безопасно
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errorMessage = data.error?.message || data.message || response.statusText;
    console.error('[email] Resend API Error:', {
      status: response.status,
      error: errorMessage,
    });
    // Выбрасываем ошибку наружу, её поймает try/catch ниже
    throw new Error(`Resend API failed: ${errorMessage}`);
  }

  const data = await response.json();
  console.info(`[email] Email sent successfully to ${to} (id: ${data.id})`);
  return data;
}

function buildInviteEmailHtml({ inviteUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#F8F9FB;font-family:sans-serif;">
  <table width="100%" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="padding:32px;background:linear-gradient(145deg,#1E3A8A 0%,#3B82F6 100%);">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">● SaleCRM</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:22px;color:#0F172A;">Team invitation</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#64748B;">
                You have been invited to SaleCRM. Click the button below to complete your registration.
              </p>
              <a href="${inviteUrl}" style="display:inline-block;padding:14px 28px;background:#3B82F6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:8px;">
                Complete registration
              </a>
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
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#F8F9FB;font-family:sans-serif;">
  <table width="100%" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="padding:32px;background:linear-gradient(145deg,#1E3A8A 0%,#3B82F6 100%);">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">● SaleCRM</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:22px;color:#0F172A;">Password reset</h1>
              <p style="margin:0 0 24px;font-size:32px;font-weight:700;color:#0F172A;">${code}</p>
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
  const text = `Your SaleCRM password reset code is: ${code}`;
  const html = buildPasswordResetEmailHtml({ code });
  const from = env.RESEND_FROM;

  try {
    return await sendResendEmail({ from, to, subject: 'SaleCRM password reset code', text, html });
  } catch (err) {
    console.error('[email] Failed to send password reset email:', { to, message: err.message });
    // Не даём падать всему приложению, просто логируем ошибку
    return null;
  }
}

export async function sendInviteEmail({ to, token }) {
  const inviteUrl = `${env.CLIENT_URL}/register-by-invite?token=${encodeURIComponent(token)}`;
  const text = `You have been invited to SaleCRM. Complete your registration here: ${inviteUrl}`;
  const html = buildInviteEmailHtml({ inviteUrl });
  const from = env.RESEND_FROM;

  try {
    return await sendResendEmail({ from, to, subject: 'You are invited to SaleCRM', text, html });
  } catch (err) {
    console.error('[email] Failed to send invite email:', { to, message: err.message });
    // Не генерируем throw наружу, чтобы бэкенд выжил при сетевых сбоях
    return null;
  }
}