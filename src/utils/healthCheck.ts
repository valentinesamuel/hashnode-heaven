// healthCheckService.ts
import { Pool } from 'pg';
import redisClient from '../config/redisClient';

// Assuming you have initialized your Postgres and Redis clients elsewhere
const pgPool = new Pool({
  database: 'postgres',
  host: 'localhost',
  password: 'password',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  user: 'postgres',
});

export const checkHealth = async () => {
  const healthStatus: Record<
    string,
    { status: 'ok' | 'error'; message?: string }
  > = {};

  try {
    await pgPool.query('SELECT NOW()');
    healthStatus.postgres = { status: 'ok' };
  } catch (err) {
    const error = err as Error;
    healthStatus.postgres = { status: 'error', message: error.message };
  }

  try {
    await redisClient.ping();
    healthStatus.redis = { status: 'ok' };
  } catch (err) {
    const error = err as Error;
    healthStatus.redis = { status: 'error', message: error.message };
  }

  return healthStatus;
};
