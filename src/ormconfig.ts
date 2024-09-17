import { DataSource } from 'typeorm';

export const ProdDataSource = new DataSource({
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
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: '172.17.0.4', //172.17.0.4
  port: 5433,
  username: 'postgres',
  password: 'password',
  database: 'postgres',
  entities: [__dirname + '/entities/**/*.entity.ts'],
  synchronize: true,
  logging: true,
  // extra: {
  //   max: 20,
  //   idleTimeoutMillis: 30000,
  //   connectionTimeoutMillis: 2000,
  // },
});
