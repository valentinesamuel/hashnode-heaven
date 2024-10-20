import { GetPageResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export interface NotionInterface {
  getColumnArticlesFromDatabaseByStatus(
    columnName: string,
  ): Promise<QueryDatabaseResponse[] | null>;
  getArticleContentById(articleId: string): Promise<GetPageResponse | null>;
}
