import { RedisCacheService } from '../adapters/redisCache';
import { HashnodeService } from './hashnodeService';
import { NotionService } from './notionService';

const notionService = new NotionService();
const hashnodeService = new HashnodeService();
const redisCacheService = new RedisCacheService();

export const pollingService = async () => {
  const articles = await notionService.getArticlesInColumn('To Be Published');
  for (const article of articles) {
    if (!cache.has(article.id)) {
      const result = await hashnodeService.publishArticle(article);
      if (result.success) {
        await notionService.updateArticleStatus(article.id, 'Published');
        cache.set(article.id, true); // Prevent re-processing
      }
    }
  }
};
