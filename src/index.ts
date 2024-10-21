import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { pollingService } from './services/pollingService';
import { AppConfig } from './config/config';
import { NotionService } from './services/notionService';
import { NotionHelper } from './utils/helper';
import { stringify } from 'querystring';
import { PartialPageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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
enum NOTIONCOLUMNS {
  TODO = '☘️ To Do',
  IN_PROGRESS = '⚒️ In Progress',
  VETTING = '🔍 Vetting',
  CLEAN_UP = '🧼 Cleanup',
  TO_BE_PUBLISHED = '📬 To Be Published',
  STAGING = '🏭 Staging',
  LIVE = '🎉 Live',
  TO_UPDATE = '♻️ To Update',
  REVAMPED = '🌟 Revamped',
  TRASH = '🗑️ Trash',
}

const notionService = new NotionService();
const notionHelper = new NotionHelper();

app.get('/', async (req, res) => {
  // contextLogger.info('Hello, TypeScript with Node.js!');
  const articles = await notionService.getArticlesToBePublished('☘️ To Do');
  let response: any[] = [];
  articles?.forEach(async (article) => {
    const articleProperties = notionHelper.processArticleProperties(article);
    const pageContent = await notionService.getArticleById(article.id);
    const data = {
      fileContent: pageContent,
      title: articleProperties.title,
      subtitle: articleProperties.subTitle,
      tags: articleProperties.tags,
      enableTableOfContent: true,
      coverImageUrl: articleProperties.cover.url,
    };
    const hashnodeBlog = await notionService.publishBlogPostToHashnode(data);
    // contextLogger.info(
    //   `Published to hashnode\n${JSON.stringify(hashnodeBlog)}`,
    //   'human',
    // );
    // const ress = await notionService.updateNotionBlogPorperties(article.id, {
    //   status: NOTIONCOLUMNS.IN_PROGRESS,
    //   url: 'http://muhwobiw.pr/cisjigsi',
    //   last_published_at: new Date('2025-11-10').toISOString(),
    //   readTime: '10 min',
    //   slug: 'slug',
    //   tags: ['tag1', 'tag2'],
    //   first_published_at: new Date('2025-11-10').toISOString(),
    // });
    response.push(hashnodeBlog);
  });

  res.json({ message: response });
});

app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  console.error(err);
});

app.listen(port, () => {
  // setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
