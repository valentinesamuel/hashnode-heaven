import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { pollingService } from './services/pollingService';
import { AppConfig } from './config/config';

const app = express();

app.use(express.json());

const port = 3000;

app.get('/', (req, res) => {
  contextLogger.info('Hello, TypeScript with Node.js!');
  res.send('Hello, TypeScript with Node.js!');
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
});

app.listen(port, () => {
  setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
