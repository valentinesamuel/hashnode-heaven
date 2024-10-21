import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { pollingService } from './services/pollingService';
import { AppConfig } from './config/config';
import { NotionService } from './services/notionService';
import { NotionHelper } from './utils/helper';

const app = express();

app.use(express.json());

const port = 3000;

export type Article = {
  articleId: string;
  status: string;
  lastPublishedAt: string;
  firstPublishedAt: string;
  readTime: string;
  slug: string;
  tags: string[];
  url: string;
  featured: string;
  hashnodeId: string;
  featuredAt: string;
  deletedAt: string;
  createdAt: string;
  lastEditedAt: string;
  cover: {
    expiryTime: string;
    url: string;
  };
  title: string;
  isDeleted: string;
};

const notionService = new NotionService();
const notionHelper = new NotionHelper();

app.get('/', async (req, res) => {
  // contextLogger.info('Hello, TypeScript with Node.js!');
  const articles = await notionService.getArticlesToBePublished('☘️ To Do');

  articles?.forEach(async (article) => {
    const articleProperties = notionHelper.processArticleProperties(article);
    const pageContent = await notionService.getArticleById(article.id);
    const data = {
      fileContent: pageContent,
      title: articleProperties.title,
      subtitle: articleProperties.title,
      tags: articleProperties.tags,
      enableTableOfContent: true,
    };
    const hasnodeBlog = notionService.publishBlogPostToHashnode(data);
  });

  res.json({ message: result });
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
});

app.listen(port, () => {
  // setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
