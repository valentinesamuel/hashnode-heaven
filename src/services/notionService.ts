import { NotionRepository } from './../repositories/notion.repository';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionInterface } from '../repositories/interfaces/notion.interface';

export class NotionService {
  private readonly notionRepository: NotionInterface;

  constructor() {
    this.notionRepository = new NotionRepository();
  }

  async getArticlesToBePublished(
    columnName: string,
  ): Promise<QueryDatabaseResponse[] | null> {
    return await this.notionRepository.getColumnArticlesFromDatabaseByStatus(
      columnName,
    );
  }
}
