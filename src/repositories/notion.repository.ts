import { DatabaseObjectResponse, GetPageResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { AppConfig } from '../config/config';
import { Client, collectPaginatedAPI, LogLevel } from '@notionhq/client';
import * as fs from 'fs';
import { NotionInterface } from './interfaces/notion.interface';
import { HashnodeRepository } from './hasnode.repository';

export class NotionRepository {
  private readonly notion: Client;
  private readonly DATABASE_ID = AppConfig.notionDatabaseId;
  private readonly hasnodeRepository = new HashnodeRepository()
  constructor() {
    this.notion = new Client({
      auth: AppConfig.notionToken,
      logLevel: LogLevel.DEBUG,
    });
  }

  async getColumnArticlesFromDatabaseByStatus(columnName: string) {
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
      return blocks;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getArticleContentById(pageId: string): Promise<GetPageResponse | null> {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      return page;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async notionToMarkdown(pageId: string, filePath: string) {
    try {
      const blocks = await this.getPageBlocks(pageId);
      const lines: string[] = [];

      blocks.forEach(block => {
        const markdown = this.blockToMarkdown(block);
        lines.push(markdown);
      });

      const markdownContent = lines.join('\n');
      fs.writeFileSync(filePath, markdownContent);
      console.log(`Markdown content written to ${filePath}`);

      // Read the markdown file
      const fileContent = fs.readFileSync(filePath, 'utf-8');


      // Send content to Hashnode
      const res = await this.hasnodeRepository.publishPost({
        contentMarkdown: fileContent,
        title: 'Backend Systems!!!',
        publicationId: "61e06fd74a9e96783d2377bd"
      });

      // console.log('Post published to Hashnode:', res);

      // Delete the file after posting
      fs.unlinkSync(filePath);
      console.log(`Markdown file deleted: ${filePath}`);

      return res;

    } catch (error) {
      console.error('Error processing Notion to Markdown:', error);
      throw error;
    }
  }

  async getPageBlocks(pageId: string) {
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

    return blocks;
  }

  blockToMarkdown(block: {
    type: any;
    paragraph: { rich_text: any[] };
    heading_1: { rich_text: any[] };
    heading_2: { rich_text: any[] };
    heading_3: { rich_text: any[] };
    bulleted_list_item: { rich_text: any[] };
    numbered_list_item: { rich_text: any[] };
    code: { language: any; rich_text: any[] };
    image: { type: string; external: { url: any }; file: { url: any } };
  }) {
    switch (block.type) {
      case 'paragraph':
        return block.paragraph.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + `\n`;

      case 'heading_1':
        return '# ' + block.heading_1.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + `\n`;

      case 'heading_2':
        return '## ' + block.heading_2.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + `\n`;

      case 'heading_3':
        return '### ' + block.heading_3.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + `\n`;

      case 'bulleted_list_item':
        return '- ' + block.bulleted_list_item.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + `\n`;

      case 'numbered_list_item':
        return '1. ' + block.numbered_list_item.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + `\n`;

      case 'code':
        return '```' + block.code.language + '\n' + block.code.rich_text.map((text: { plain_text: any }) => text.plain_text).join('') + '\n```\n';

      case 'image':
        const imageUrl = block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;
        return `![Image](${imageUrl})\n\n`;

      default:
        return '';
    }
  }
}
