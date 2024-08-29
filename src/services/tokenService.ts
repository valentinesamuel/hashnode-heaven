import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient';
import { secretKey, jwtExpiration, redisExpiration } from '../config/jwtConfig';

export function generateToken(payload: string | Buffer | object) {
  return jwt.sign(payload, secretKey, { 
    expiresIn: jwtExpiration,
   });
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}

export function setTokenInRedis({
  token,
  userId,
  sessionId,
  jwtExpiration,
}: {
  token: string;
  userId: string;
  sessionId: string;
  jwtExpiration: number;
}) {
  redisClient.hSet(`tokens:${token}`, [
    'user_id',
    userId,
    'session_id',
    sessionId,
    'expires_at',
    jwtExpiration.toString(),
    'status',
    'active',
  ]);
  redisClient.expire(`tokens:${token}`, redisExpiration);
}

export function setSessionIdInRedis({
  sessionId,
  userId,
  token,
  jwtExpiration,
}: {
  sessionId: string;
  userId: string;
  token: string;
  jwtExpiration: number;
}) {
  redisClient.hSet(`sessions:${sessionId}`, [
    'user_id',
    userId,
    'token',
    token,
    'expires_at',
    jwtExpiration.toString(),
  ]);
  redisClient.expire(`sessions:${sessionId}`, redisExpiration);
}

export async function blacklistToken(token: string) {
  // Add the token to a blacklist set with an expiration time
  const expirationTime = 2 * 1000; // Example: 1 hour
  await redisClient.set(`blacklist:${token}`, expirationTime, {
    EX: redisExpiration,
  });
}
