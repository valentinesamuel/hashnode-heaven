import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from './logger';

dotenv.config();

const app = express();
app.use(helmet({}));
app.use(cors());
const defaultProxyOptions = createProxyMiddleware({
  target: 'http://www.example.org/api',
  changeOrigin: true,
});
app.use(
  rateLimit({
    windowMs: 1000,
    max: 2,
  }),
);
app.use(express.json());

app.get('/', (_: Request, res: Response) => {
  res.send('Hello, TypeScript!');
});

app.use('/api', defaultProxyOptions);

app.use('/health', (_: Request, res: Response) => {
  try {
    // Check database connection
    // const client = await pool.connect();
    // client.release();
    logger.warn('This is a warning message', {
      fileName: 'index.ts',
      lineNumber: 100,
      columnNumber: 10,
    });

    res.status(200).json({
      status: 'UP',
      timestamp: new Date(),
      database: 'OK',
    });
  } catch (error: unknown) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      database: 'ERROR',
      error: (error as Error).message,
    });
  }
});

app.get('/error', (_req: Request, _res: Response) => {
  logger.error(new Error('an error') as unknown as string, {
    fileName: 'index.ts',
    lineNumber: 100,
    columnNumber: 10,
  });
  throw new Error('This is a test error!');
});

app.get('/uncaught', (_req: Request, _res: Response, _next: NextFunction) => {
  setTimeout(() => {
    throw new Error('hello world');
  }, 250);
});

app.get('/unhandled', (_req: Request, res: Response) => {
  Promise.reject(new Error('This is an unhandled rejection!'));
  res.send('This will not execute because of the unhandled rejection.');
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  logger.error('Caught exception in middleware:', err);
  next(err);
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.debug('Server is running on port 3000');
});
