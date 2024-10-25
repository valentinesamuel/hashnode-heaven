import { NotionRepository } from '../repositories/notion.repository';
import { HashnodeService } from './hashnodeService';
import { AppConfig } from '../config/config';
import Logger from '../logger/logger';
import { convertToSlug } from '../utils/fetch';

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
    this.contextLogger.info('Fetching articles to be published');
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
    coverImageUrl,
    enableTableOfContent,
  }: {
    fileContent: string;
    title: string;
    subtitle: string;
    tags: string[];
    coverImageUrl: string;
    enableTableOfContent: any;
  }) {
    this.contextLogger.info('Publishing article to Hashnode');
    try {
      const articleTags = tags.map((tag) => ({
        name: tag,
        slug: convertToSlug(tag),
      }));
      const publishedPost = await this.hashnodeService.publishPost({
        contentMarkdown: fileContent,
        coverImageOptions: {
          coverImageURL: encodeURI(coverImageUrl),
        },
        title,
        subtitle,
        tags: articleTags,
        settings: {
          enableTableOfContent,
        },
        publicationId: AppConfig.hashnodePublicationId,
      });
      return publishedPost;
    } catch (error) {
      this.contextLogger.error(
        'Error publishing article to Hashnode:',
        error as Error,
        'human'
      );
      throw error;
    }
  }

  updateNotionBlogPorperties(
    pageId: string,
    properties: {
      first_published_at?: string;
      last_published_at?: string;
      readTime: string;
      slug: string;
      status: string;
      tags: string[];
      url: string;
    },
  ) {
    this.contextLogger.info(`Updating Notion blog properties at ${properties.url}`);
    return this.notionRepository.updatePageProperties(pageId, properties);
  }
}
