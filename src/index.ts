import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

import contextLogger from './logger/logger';
import redisClient from './config/redisClient';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import requestLogger from './middleware/requestlogger.middleware';
import { verifyToken } from './middleware/auth.middleware';
import validateRequest from './middleware/validator.middleware';
import { userSchema } from './validators/user.schema';
import { helmetMiddleware } from './middleware/security.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { PgDataSource } from './ormconfig';
import { loginUser, logoutUser } from './controller/user.controller';

process.on('unhandledRejection', (error) => {
  contextLogger.error('Unhandled Rejection at:', error as Error);
  process.exitCode = 1;
});

process.on('uncaughtException', (error) => {
  contextLogger.error('Uncaught Exception thrown:', error);
  process.exitCode = 1;
});
dotenv.config();

export const app = express();

app.disable('x-powered-by');

app.use(requestIdMiddleware);
app.use(requestLogger);

app.use(helmetMiddleware);

app.use(corsMiddleware);

const defaultProxyOptions = createProxyMiddleware({
  target: 'http://www.example.org/api',
  changeOrigin: true,
});

app.use(
  rateLimit({
    windowMs: 2000,
    limit: 2,
  }),
);

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, TypeScript!');
});

app.use('/api', defaultProxyOptions);

app.post('/login', validateRequest(userSchema), loginUser);

app.post('/logout', verifyToken, logoutUser);

app.get('/protected', verifyToken, (req: Request, res: Response) => {
  res.send(req?.user);
});

app.get('/health', (_req: Request, res: Response) => {
  try {
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

app
  .listen(port, async () => {
    await redisClient.connect();
    PgDataSource.initialize()
      .then(() => {
        console.log('Data Source has been initialized!');
      })
      .catch((err) => {
        console.error('Error during Data Source initialization', err);
      });
    console.debug('Server is running on port 3000');
  })
  .on('error', (err) => {
    console.error('Failed to start server:', err);
  });
