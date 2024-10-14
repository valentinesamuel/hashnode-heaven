import { AppConfig } from './../../src/config/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schemas from './schemas';

const connectionString = AppConfig.databaseUrl || '';

export type PGDatabase = PostgresJsDatabase<typeof schemas> & {
  $client: postgres.Sql;
};

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db: PGDatabase = drizzle(client, { schema: schemas });
