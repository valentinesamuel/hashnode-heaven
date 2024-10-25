import dotenv from 'dotenv';

dotenv.config();

type AppConfigType = {
  notionToken: string;
  hashnodeToken: string;
  notionDatabaseId: string;
  redisUrl: string;
  hashnodePublicationId: string;
  pollingInterval: number;
  databaseUrl: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_BUCKET_NAME: string;
}

export const AppConfig: AppConfigType = {
  notionToken: process.env.NOTION_INTEGRATION_TOKEN as string,
  hashnodeToken: process.env.HASHNODE_TOKEN as string,
  hashnodePublicationId: process.env.HASHNODE_PUBLICATION_ID as string,
  notionDatabaseId: process.env.NOTION_DATABASE_ID as string,
  redisUrl: process.env.UPSTASH_REDIS_URL as string,
  pollingInterval: parseInt(process.env.POLLING_INTERVAL as string) || 10000,
  databaseUrl: process.env.DATABASE_URL as string,
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY as string,
  SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME as string
};
