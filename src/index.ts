import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import contextLogger from './logger/logger';
import redisClient from './config/redisClient';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import requestLogger from './middleware/requestlogger.middleware';

import { helmetMiddleware } from './middleware/security.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { ProdDataSource } from './ormconfig';
import { getHealthStatus } from './controller/health.controller';
import authRoute from './routes/auth.route';

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
  target: 'https://www.example.org/api',
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

app.get('/health', getHealthStatus);

app.use('/auth', authRoute);

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

app.get('/unhandled', async (_req: Request, res: Response) => {
  await Promise.reject(new Error('This is an unhandled rejection!'));
  res.send('This will not execute because of the unhandled rejection.');
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
  next(err);
});

const port = process.env.PORT ?? 3000;

app
  .listen(port, async () => {
    await redisClient.connect();
    ProdDataSource.initialize()
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
