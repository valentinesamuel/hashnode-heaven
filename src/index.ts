import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { pollingService } from './services/pollingService';
import { AppConfig } from './config/config';
import { NotionService } from './services/notionService';
import { NotionHelper } from './utils/helper';

const app = express();

app.use(express.json());

const port = 3000;

const notionService = new NotionService();
const notionHelper = new NotionHelper();

app.get('/', async (req, res) => {
  // contextLogger.info('Hello, TypeScript with Node.js!');
  const articles = await notionService.getArticlesToBePublished('☘️ To Do');

  // if (articles && articles.length > 0) {
  //   const page = await notionService.getArticleById(articles[0].id);

  //   articles.forEach(async (article) => {
  //     await notionService.publishBlogPostToHashnode({
  //       fileContent: page,
  //       title: article.properties.Name.title[0].text.content,
  //       subtitle: article.properties.Subtitle.rich_text[0].text.content,
  //       tags: article.properties.Tags.multi_select.map((tag) => tag.name),
  //       enableTableOfContent: article.properties['Table of Content'].checkbox,
  //     });
  //   })

  //   res.json({ message: page });
  // } else {
  //   res.status(404).json({ message: 'No articles found' });
  // }
  const articleProperties = notionHelper.processArticleProperties(articles as any);
  res.json({ message: articleProperties });
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
});

app.listen(port, () => {
  // setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
