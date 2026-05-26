import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRoutes from './routes.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet());

  // Массив всех разрешенных адресов
  const allowedOrigins = [
    'http://localhost:5173',          // Локальный фронт Vite
    'http://localhost:3000',          // На всякий случай обычный React
    env.CLIENT_URL,                   // Твой домен из .env (https://raf-salecrm.online)
    'https://www.raf-salecrm.online'  // Версия с www
  ].filter(Boolean); // Очистит массив от undefined, если env.CLIENT_URL не задан

  app.use(
    cors({
      origin: function (origin, callback) {
        // Разрешаем запросы без origin (например, Postman или мобильные приложения)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS'));
        }
      },
      credentials: true,
    }),
  );

  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'CRM API',
      docs: '/api/health',
    });
  });

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
