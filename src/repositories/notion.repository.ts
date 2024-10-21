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
      const res = await this.notion.pages.update({
        page_id: pageId,
        properties: {
          'First Publication Date': {
            // @ts-ignore
            type: 'date',
            date: {
              start: data.first_published_at,
            },
          },
          'Last Publication Date': {
            // @ts-ignore
            type: 'date',
            date: {
              start: data.last_published_at,
            },
          },
          'Read Time': {
            // @ts-ignore
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: data.readTime,
                },
              },
            ],
          },
          Slug: {
            // @ts-ignore
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: data.slug,
                },
              },
            ],
          },
          Status: {
            // @ts-ignore
            type: 'select',
            select: {
              name: data.status,
            },
          },
          Tags: {
            // @ts-ignore
            type: 'multi_select',
            multi_select: data.tags.map((tag) => ({ name: tag })),
          },
          URL: {
            // @ts-ignore
            type: 'url',
            url: data.url,
          },
        },
      });
      return res;
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
