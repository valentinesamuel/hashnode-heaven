import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import redisClient from '../config/redisClient';
import { secretKey } from '../config/jwtConfig';

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied.');

  // Retrieve token data from Redis
  const isBlacklisted = await redisClient.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return res.status(401).send('Token is blacklisted.');
  }

  // Verify the token using JWT
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) return res.status(401).send('Invalid token.');

    const { sessionId } = decoded as JwtPayload;

    // Check if the session ID exists and matches the token in Redis
    const sessionData = await redisClient.hGetAll(`sessions:${sessionId}`);
    if (!sessionData || sessionData.token !== token) {
      return res.status(401).send('Invalid session');
    }

    req.user = decoded;
    next();
  });
}
