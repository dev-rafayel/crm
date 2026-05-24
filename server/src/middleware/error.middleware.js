import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? 'Internal Server Error';
  let details = err.details ?? null;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([key, e]) => [key, e.message]),
    );
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    details = err.keyValue;
  }

  if (!(err instanceof AppError) && statusCode === 500 && env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
    details = null;
  }

  if (env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
}
