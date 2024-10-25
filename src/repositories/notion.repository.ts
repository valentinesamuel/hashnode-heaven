import { Client, collectPaginatedAPI, LogLevel } from "@notionhq/client";
import { NotionHelper } from "../utils/helper";
import { AppConfig } from "../config/config";

export class NotionRepository {
  private readonly notion: Client;
  private readonly DATABASE_ID = AppConfig.notionDatabaseId;
  private readonly notionHelper: NotionHelper;

  constructor() {
    this.notion = new Client({
      auth: AppConfig.notionToken,
      logLevel: LogLevel.DEBUG,
    });
    this.notionHelper = new NotionHelper(this.notion);
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

  async updatePageProperties(pageId: string, data: Record<string, any>) {
    try {
      const res = await this.notion.pages.update({
        page_id: pageId,
        properties: {
          'First Publication Date': { date: { start: data.first_published_at } },
          'Last Publication Date': { date: { start: data.last_published_at } },
          'Read Time': { rich_text: [{ text: { content: data.readTime } }] },
          Slug: { rich_text: [{ text: { content: data.slug } }] },
          Status: { select: { name: data.status } },
          Tags: { multi_select: data.tags.map((tag: string) => ({ name: tag })) },
          URL: { url: data.url },
        },
      });
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  async getPageContent(pageId: string) {
    try {
      return await this.notionHelper.convertNotionBlocksToMarkdown(pageId);
    } catch (error) {
      console.error('Error fetching page content:', error);
      return null;
    }
  }

  async getPageProperties(pageId: string) {
    try {
      return await this.notion.pages.retrieve({ page_id: pageId });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  private getProperty(obj: any, path: string[], defaultValue: any = null): any {
    return path.reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
  }

  processArticleProperties(article: any) {

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