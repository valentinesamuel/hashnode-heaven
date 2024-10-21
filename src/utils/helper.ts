import fs from 'fs';
import { AppConfig } from '../config/config';
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export class NotionHelper {
  convertNotionBlocksToMarkdown(notionBlocks: any[]) {
    try {
      const filePath = 'tempArticle.md';
      const lines: string[] = [];

      notionBlocks.forEach((block) => {
        const markdown = this.blockToMarkdown(block);
        lines.push(markdown);
      });

      const markdownContent = lines.join('\n');
      fs.writeFileSync(filePath, markdownContent);
      console.log(`Markdown content written to ${filePath}`);

      // Read the markdown file
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Delete the file after reading
      fs.unlinkSync(filePath);

      return fileContent;
    } catch (error) {
      console.error('Error processing Notion blocks to Markdown:', error);
      throw error;
    }
  }

  protected blockToMarkdown(block: {
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
    if (block.type === 'paragraph') {
      return (
        block.paragraph.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') + `\n`
      );
    } else if (block.type === 'heading_1') {
      return (
        '# ' +
        block.heading_1.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') +
        `\n`
      );
    } else if (block.type === 'heading_2') {
      return (
        '## ' +
        block.heading_2.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') +
        `\n`
      );
    } else if (block.type === 'heading_3') {
      return (
        '### ' +
        block.heading_3.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') +
        `\n`
      );
    } else if (block.type === 'bulleted_list_item') {
      return (
        '- ' +
        block.bulleted_list_item.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') +
        `\n`
      );
    } else if (block.type === 'numbered_list_item') {
      return (
        '1. ' +
        block.numbered_list_item.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') +
        `\n`
      );
    } else if (block.type === 'code') {
      return (
        '```' +
        block.code.language +
        '\n' +
        block.code.rich_text
          .map((text: { plain_text: any }) => text.plain_text)
          .join('') +
        '\n```\n'
      );
    } else if (block.type === 'image') {
      const imageUrl =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;
      return `![Image](${imageUrl})\n\n`;
    } else {
      return '';
    }
  }

  getProperty(obj: any, path: string[], defaultValue: any = null): any {
    return path.reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
  }

  processArticleProperties(article: any) {
    let processedProperties: {
      articleId: string;
      status: string;
      lastPublishedAt: string;
      firstPublishedAt: string;
      readTime: string;
      slug: string;
      tags: string[];
      url: string;
      featured: string;
      hashnodeId: string;
      featuredAt: string;
      deletedAt: string;
      createdAt: string;
      lastEditedAt: string;
      cover: { expiryTime: string; url: string };
      title: string;
      isDeleted: boolean;
      subTitle: string;
    };

    let cover = {
      expiryTime: '',
      url: '',
    };

    if (article.cover) {
      if (article.cover.type === 'external') {
        cover.url = article.cover.external.url;
      } else if (article.cover.type === 'file') {
        cover.url = article.cover.file.url;
        cover.expiryTime = article.cover.file.expiry_time;
      }
    }

    const tags: string[] = [];
    article.properties['Tags'].multi_select.forEach((tag: { name: string }) =>
      tags.push(tag.name),
    );

    const properties = {
      articleId: this.getProperty(article, ['id']),
      status: this.getProperty(article, [
        'properties',
        'Status',
        'select',
        'name',
      ]),
      lastPublishedAt: this.getProperty(article, [
        'properties',
        'Last Publication Date',
        'date',
        'start',
      ]),
      firstPublishedAt: this.getProperty(article, [
        'properties',
        'First Publication Date',
        'date',
        'start',
      ]),
      readTime: this.getProperty(article, [
        'properties',
        'Read Time',
        'number',
      ]),
      slug: this.getProperty(
        article,
        ['properties', 'Slug', 'rich_text', '0', 'plain_text'],
        '',
      ),
      tags,
      url: this.getProperty(article, ['properties', 'URL', 'url'], ''),
      featured: this.getProperty(article, [
        'properties',
        'Featured',
        'select',
        'name',
      ]),
      hashnodeId: this.getProperty(article, [
        'properties',
        'Hashnode Blog ID',
        'rich_text',
        '0',
        'plain_text',
      ]),
      featuredAt: this.getProperty(article, [
        'properties',
        'Feature Date',
        'date',
        'start',
      ]),
      deletedAt: this.getProperty(article, [
        'properties',
        'Deleted At',
        'date',
        'start',
      ]),
      createdAt:
        this.getProperty(article, ['created_time']) ||
        this.getProperty(article, [
          'properties',
          'Created time',
          'created_time',
        ]),
      lastEditedAt:
        this.getProperty(article, ['last_edited_time']) ||
        this.getProperty(article, [
          'properties',
          'Last edited time',
          'last_edited_time',
        ]),
      cover,
      title: this.getProperty(article, [
        'properties',
        'Name',
        'title',
        '0',
        'text',
        'content',
      ]),
      subTitle: this.getProperty(article, [
        'properties',
        'Subtitle',
        'rich_text',
        '0',
        'plain_text',
      ]),
      isDeleted: this.getProperty(article, ['in_trash']),
    };

    return properties;
  }
}
