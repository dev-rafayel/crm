import mongoose from 'mongoose';

export function getHealthStatus() {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] ?? 'unknown',
  };
}
