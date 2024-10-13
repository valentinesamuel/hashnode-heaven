import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';

const app = express();

app.use(express.json());

const port = 3000;

app.get('/', (req, res) => {
  contextLogger.info('Hello, TypeScript with Node.js!');
  res.send('Hello, TypeScript with Node.js!');
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
  // next(err);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
