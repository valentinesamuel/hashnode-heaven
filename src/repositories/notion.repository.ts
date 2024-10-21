import {
  DatabaseObjectResponse,
  GetPageResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { AppConfig } from '../config/config';
import { Client, collectPaginatedAPI, LogLevel } from '@notionhq/client';
import * as fs from 'fs';
import { NotionHelper } from '../utils/helper';

export class NotionRepository {
  private readonly notion: Client;
  private readonly DATABASE_ID = AppConfig.notionDatabaseId;
  private readonly notionHelper = new NotionHelper();

  constructor() {
    this.notion = new Client({
      auth: AppConfig.notionToken,
      logLevel: LogLevel.DEBUG,
    });
  }

  async getColumnArticlesFromDatabaseByStatus(columnName: string) {
    try {
      return await collectPaginatedAPI(this.notion.databases.query, {
        database_id: this.DATABASE_ID,
        filter: {
          property: 'Status',
          select: {
            equals: columnName,
          },
        },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updatePageProperties(
    pageId: string,
    data: {
      first_published_at?: string;
      last_published_at?: string;
      readTime: string;
      slug: string;
      status: string;
      tags: string[];
      url: string;
    },
  ) {
    try {
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          'First Published At': {
            // @ts-ignore
            type: 'date',
            date: {
              start: data.first_published_at,
            },
          },
          'Last Published At': {
            // @ts-ignore
            type: 'date',
            date: {
              start: data.last_published_at,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getPageContent(pageId: string) {
    let blocks: any[] = [];
    let cursor;

    while (true) {
      const { results, next_cursor } = await this.notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
      });

      blocks = blocks.concat(results);

      if (!next_cursor) break;
      cursor = next_cursor;
    }

    return this.notionHelper.convertNotionBlocksToMarkdown(blocks);
  }

  async getPageProperties(pageId: string) {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      console.log(page);
      return page;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
