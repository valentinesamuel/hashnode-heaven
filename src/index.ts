import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { pollingService } from './services/pollingService';
import { AppConfig } from './config/config';
import { NotionService } from './services/notionService';

const app = express();

app.use(express.json());

const port = 3000;

const notionService = new NotionService();

app.get('/', async (req, res) => {
  // contextLogger.info('Hello, TypeScript with Node.js!');
  const articleDB = await notionService.getArticlesToBePublished('☘️ To Do');

  if (articleDB && articleDB.length > 0) {
    const page = await notionService.getArticleById(articleDB[0].id);
    res.json({ message: page });
  } else {
    res.status(404).json({ message: 'No articles found' });
  }
});





app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
});

app.listen(port, () => {
  // setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
