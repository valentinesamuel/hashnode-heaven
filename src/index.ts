import express, { Request, Response } from 'express';
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
  target: 'http://www.example.org/api', // target host with the same base path
  changeOrigin: true, // needed for virtual hosted sites
});
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  logger.info('Hello, TypeScript is running!');
  res.send('Hello, TypeScript!');
});
app.use('/api', defaultProxyOptions);
app.use('/health', (_: Request, res: Response) => {
  try {
    // Check database connection
    // const client = await pool.connect();
    // client.release();

    res.status(200).json({
      status: 'UP',
      timestamp: new Date(),
      database: 'OK',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      database: 'ERROR',
      error: error.message,
    });
  }
});
app.get('/error', (req: Request, res: Response) => {
  throw new Error('This is a test error!');
});
app.use((err: Error, req: Request, res: Response, next: Function) => {
  logger.error('Internal server error:', err.message);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
