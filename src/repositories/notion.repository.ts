import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { AppConfig } from '../config/config';
import { Client, collectPaginatedAPI, LogLevel } from '@notionhq/client';
import { NotionInterface } from './interfaces/notion.interface';

export class NotionRepository implements NotionInterface {
  private readonly notion: Client;
  private readonly DATABASE_ID = 'd9824bdc-8445-4327-be8b-5b47500af6ce';
  constructor() {
    this.notion = new Client({
      auth: AppConfig.notionToken,
      logLevel: LogLevel.DEBUG,
    });
  }
  async getColumnArticlesFromDatabaseByStatus(
    columnName: string,
  ): Promise<QueryDatabaseResponse[] | null> {
    try {
      const blocks = await collectPaginatedAPI(this.notion.databases.query, {
        database_id: this.DATABASE_ID,
        filter: {
          property: 'Status',
          select: {
            equals: columnName,
          },
        },
      });
      return blocks as unknown as QueryDatabaseResponse[];
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
