// Loads .env into process.env. Side-effect imports run before the module body,
// so the variables are in place by the time the options below are built.
import 'dotenv/config';
import 'reflect-metadata';

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
  logging: true,
  entities: [`${import.meta.dirname}/**/*.entity{.ts,.js}`],
  migrations: [`${import.meta.dirname}/migrations/**/*{.ts,.js}`],
});
