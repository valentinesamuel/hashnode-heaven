import { jwtExpiration, redisExpiration } from '../config/jwtConfig';
import redisClient from '../config/redisClient';

export function setTokenInRedis({
  token,
  userId,
  sessionId,
}: {
  token: string;
  userId: string;
  sessionId: string;
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
}: {
  sessionId: string;
  userId: string;
  token: string;
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
  const expirationTime = 2 * 1000;
  const blacklisted = await redisClient.set(
    `blacklist:${token}`,
    expirationTime,
    {
      EX: redisExpiration,
    },
  );

  return blacklisted;
}
