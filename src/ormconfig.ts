import { DataSource } from 'typeorm';

export const PgDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'your_database',
  entities: [__dirname + '/entity/**/*.ts'],
  migrations: [__dirname + '/migration/**/*.ts'],
  synchronize: true,
  logging: true
});
