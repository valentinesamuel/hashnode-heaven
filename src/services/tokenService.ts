import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient';
import { secretKey, expiresIn } from '../config/jwtConfig';

export function generateToken(payload: string | Buffer | object) {
  return jwt.sign(payload, secretKey, { expiresIn });
}

export function storeTokenInRedis(token: string) {
  redisClient.set(`user:${token}`, token, {
    EX: 3600,
  });
  return true;
}
