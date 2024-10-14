import { RedisCacheService } from '../adapters/redisCache';
import { HashnodeService } from './hashnodeService';
import { NotionService } from './notionService';

const notionService = new NotionService();
const hashnodeService = new HashnodeService();
const redisCacheService = new RedisCacheService();

export const pollingService = async () => {
  const articles = await notionService.getArticlesInColumn('To Be Published');

  if (!articles) {
    return;
  }

  for (const article of articles) {
    const articleId = article.id;
    const articleTitle = article.properties.Name.title[0].text.content;
    const articleUrl = article.properties.URL.url;

    const articleData = await hashnodeService.getArticleBySlug(articleUrl);

    if (!articleData) {
      continue;
    }

    const articleContent = articleData.contentMarkdown;

    await redisCacheService.setCache(articleId, articleContent);

    await notionService.updateArticleStatus(articleId, 'Published');
  }
};
