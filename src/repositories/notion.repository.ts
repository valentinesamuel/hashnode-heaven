import { PGDatabase, db } from './../../supabase/db/index';

class NotionRepository {
  private readonly db: PGDatabase;
  constructor() {
    this.db = db;
  }
  async getAllPages() {
    // Fetch all pages from Notion API
  }
}
