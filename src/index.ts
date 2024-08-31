import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';

import { jwtExpiration } from './config/jwtConfig';
import contextLogger from './logger/logger';
import redisClient from './config/redisClient';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import requestLogger from './middleware/requestlogger.middleware';
import { verifyToken } from './middleware/auth.middleware';
import {
  blacklistToken,
  generateToken,
  setSessionIdInRedis,
  setTokenInRedis,
} from './services/tokenService';

process.on('unhandledRejection', (error) => {
  contextLogger.error('Unhandled Rejection at:', error as Error);
  process.exitCode = 1;
});

process.on('uncaughtException', (error) => {
  contextLogger.error('Uncaught Exception thrown:', error);
  process.exitCode = 1;
});
dotenv.config();

const app = express();

app.use(requestIdMiddleware);
app.use(requestLogger);

app.use(helmet({}));
app.use(cors());

const defaultProxyOptions = createProxyMiddleware({
  target: 'http://www.example.org/api',
  changeOrigin: true,
});

app.use(
  rateLimit({
    windowMs: 2000,
    max: 2,
  }),
);
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, TypeScript!');
});

app.use('/api', defaultProxyOptions);

app.post('/login', (req: Request, res: Response) => {
  const userId = req.body.userId;
  const sessionId = uuidv4();
  const token = generateToken({ userId, sessionId });

  setTokenInRedis({ token, userId, sessionId, jwtExpiration });
  setSessionIdInRedis({ sessionId, userId, token, jwtExpiration });

  res.json({ token });
});

app.post('/logout', verifyToken, async (req: Request, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(400).send('No token provided.');

  await blacklistToken(token);

  res.send('Logged out and token blacklisted.');
});

app.get('/protected', verifyToken, (req: Request, res: Response) => {
  res.send(req?.user);
});

app.get('/health', (_req: Request, res: Response) => {
  try {
    // Check database connection
    // const client = await pool.connect();
    // client.release();
    aNamedFunction();
    res.status(200).json({
      status: 'UP',
      timestamp: new Date(),
      database: 'OK',
    });
  } catch (error: unknown) {
    contextLogger.error('Error in health check', error as Error, 'json', {
      extra: 'metadata',
      some: 'data',
    });
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      database: 'ERROR',
      error: (error as Error).message,
    });
  }
});

app.get('/error', (req: Request, _res: Response) => {
  try {
    throw new Error('This is a test error!');
  } catch (error: unknown) {
    contextLogger.error('Purposeful Error', error as Error, 'json', {
      requestId: req.requestId,
    });
  }
});

app.get('/uncaught', (_req: Request, _res: Response, _next: NextFunction) => {
  contextLogger.error('This is an uncaught error', new Error('Bad error'));
  throw new Error('hello world');
});

app.get('/unhandled', (_req: Request, res: Response) => {
  Promise.reject(new Error('This is an unhandled rejection!'));
  res.send('This will not execute because of the unhandled rejection.');
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
  next(err);
});

const aNamedFunction = () => {
  contextLogger.info('This is a named function', 'json', {
    extra: 'metadata',
    some: 'data',
  });
};

const port = process.env.PORT ?? 3000;

app.listen(port, async () => {
  await redisClient.connect();
  console.debug('Server is running on port 3000');
});
