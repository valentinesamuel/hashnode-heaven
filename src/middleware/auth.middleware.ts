import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient';
import { secretKey } from '../config/jwtConfig';

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied.');

  const existingToken = await redisClient.get(`user:${token}`);
  if (!existingToken) return res.status(401).send('Token is blacklisted.');

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).send('Invalid token.');
    req.user = decoded;
    next();
  });
}
