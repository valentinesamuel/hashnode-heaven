import dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  notionToken: process.env.NOTION_TOKEN,
  hashnodeToken: process.env.HASHNODE_TOKEN,
  redisUrl: process.env.UPSTASH_REDIS_URL,
  pollingInterval: 30000, // Poll every 30 seconds
  dbPath: '../data.sqlite',
};
