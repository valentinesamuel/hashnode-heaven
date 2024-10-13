export class NotionService {
  async getArticlesInColumn(columnName: string): Promise<Article[]> {
    // Fetch articles from Notion
    return [{ id: '1', title: 'My First Article' }];
  }

  async updateArticleStatus(articleId: string, status: string) {
    // Update article status in Notion
  }
}
