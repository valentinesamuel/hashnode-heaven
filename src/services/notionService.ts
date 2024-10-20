import { NotionRepository } from './../repositories/notion.repository';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionInterface } from '../repositories/interfaces/notion.interface';

export class NotionService {
  private readonly notionRepository;

  constructor() {
    this.notionRepository = new NotionRepository();
  }

  async getArticlesToBePublished(
    columnName: string,
  ) {
    return await this.notionRepository.getColumnArticlesFromDatabaseByStatus(
      columnName,
    );
  }

  async getArticleById(pageId: string) {
    return await this.notionRepository.notionToMarkdown(pageId, 'article.md');
  }
}
