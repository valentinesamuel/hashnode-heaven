import { DatabaseObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionArticleProperties } from '../notion.repository';

export interface NotionInterface {
  getColumnArticlesFromDatabaseByStatus(
    columnName: string,
  ): Promise<(PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse)[] | null>
  updatePageProperties(pageId: string, data: Record<string, any>): Promise<PartialPageObjectResponse | undefined>
  getPageContent(pageId: string): Promise<string | null>
  getPageProperties(pageId: string): Promise<PartialPageObjectResponse | null>
  processArticleProperties(article: any): NotionArticleProperties
}


