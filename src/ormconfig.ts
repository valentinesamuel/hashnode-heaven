import { DataSource } from 'typeorm';

export const PgDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'postgres',
  entities: [__dirname + '/entities/**/*.entity.ts'],
  migrations: [__dirname + '/migrations/**/*.ts'],
  synchronize: true,
  logging: true,
  extra: {
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  },
});
