import dotenv from 'dotenv';

dotenv.config();

type AppConfigType = {
  notionToken: string;
  hashnodeToken: string;
  notionDatabaseId: string;
  redisUrl: string;
  pollingInterval: number;
  databaseUrl: string;
}

export const AppConfig: AppConfigType = {
  notionToken: process.env.NOTION_INTEGRATION_TOKEN as string,
  hashnodeToken: process.env.HASHNODE_TOKEN as string,
  notionDatabaseId: process.env.NOTION_DATABASE_ID as string,
  redisUrl: process.env.UPSTASH_REDIS_URL as string,
  pollingInterval: parseInt(process.env.POLLING_INTERVAL as string) || 10000,
  databaseUrl: process.env.DATABASE_URL as string,
};
