import dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  notionToken: process.env.NOTION_INTEGRATION_TOKEN,
  hashnodeToken: process.env.HASHNODE_TOKEN,
  notionDatabaseId: process.env.NOTION_DATABASE_ID,
  redisUrl: process.env.UPSTASH_REDIS_URL,
  pollingInterval: process.env.POLLING_INTERVAL,
  databaseUrl: process.env.DATABASE_URL,
};
