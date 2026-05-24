import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    const smtpOk = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS;
    if (!smtpOk) {
      console.warn(
        '[startup] SMTP not configured in server/.env — invites will fail until SMTP_HOST, SMTP_USER and SMTP_PASS are set.',
      );
    } else if (
      env.SMTP_HOST?.includes('gmail') &&
      env.SMTP_PASS?.length !== 16
    ) {
      console.warn(
        `[startup] SMTP_PASS length is ${env.SMTP_PASS.length} — Google App Passwords are exactly 16 characters. Update server/.env and restart.`,
      );
    }
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
