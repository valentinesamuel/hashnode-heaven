import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import contextLogger from './logger/logger';
import { requestIdMiddleware } from './middleware/requestId.middleware';

process.on('unhandledRejection', (error) => {
  contextLogger.error('Unhandled Rejection at:', error as Error);
  process.exitCode = 1;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  contextLogger.error('Uncaught Exception thrown:', error);
  process.exitCode = 1;
});
dotenv.config();

const app = express();
app.use(helmet({}));
app.use(cors());

app.use(requestIdMiddleware);

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

app.get('/', (req: Request, res: Response) => {
  contextLogger.info('Request received', 'human', {
    requestId: req.requestId,
    correlationId: req.correlationId,
  });
  res.send('Hello, TypeScript!');
});

app.use('/api', defaultProxyOptions);

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
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      database: 'ERROR',
      error: (error as Error).message,
    });
  }
});

app.get('/error', (_req: Request, _res: Response) => {
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
  next(err);
});

const aNamedFunction = () => {
  contextLogger.info('This is a named function', 'json', {
    extra: 'metadata',
    some: 'data',
  });
};

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.debug('Server is running on port 3000');
});
