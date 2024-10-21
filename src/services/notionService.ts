import { NotionRepository } from '../repositories/notion.repository';
import { HashnodeService } from './hashnodeService';
import { AppConfig } from '../config/config';
import Logger from '../logger/logger';

export class NotionService {
  private readonly notionRepository;
  private readonly hashnodeService;
  private readonly contextLogger;

  constructor() {
    this.notionRepository = new NotionRepository();
    this.hashnodeService = new HashnodeService();
    this.contextLogger = Logger;
  }

  async getArticlesToBePublished(columnName: string) {
    return await this.notionRepository.getColumnArticlesFromDatabaseByStatus(
      columnName,
    );
  }

  getArticleById(pageId: string) {
    return this.notionRepository.getPageContent(pageId);
  }

  async publishBlogPostToHashnode({
    fileContent,
    title,
    subtitle,
    tags,
    enableTableOfContent,
  }: {
    fileContent: string;
    title: string;
    subtitle: string;
    tags: string[];
    enableTableOfContent: any;
  }) {
    try {
      const articleTags = tags.map((tag) => ({
        name: tag,
      }));
      return await this.hashnodeService.publishPost({
        contentMarkdown: fileContent,
        title,
        subtitle,
        tags: articleTags,
        settings: {
          enableTableOfContent,
        },
        publicationId: AppConfig.hashnodePublicationId,
      });
    } catch (error) {
      this.contextLogger.error(
        'Error publishing article to Hashnode:',
        error as Error,
      );
      throw error;
    }
  }

  updateNotionBlogPorperties(pageId: string, properties: any) {
    return this.notionRepository.updatePageProperties(pageId, properties);
  }
}
