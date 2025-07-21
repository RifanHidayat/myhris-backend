// src/config/database.config.ts
import type { Knex } from 'knex';

export function createDbConfig(
  host: string,
  user: string,
  password: string,
  database: string,
): Knex.Config {
  return {
    client: 'mysql2',
    connection: {
      host,
      user,
      password,
      database,
    },
    pool: { min: 0, max: 10 },
  };
}

export function createSisAdminDbConfig(): Knex.Config {
  return {
    client: 'mysql2',
    connection: {
      host: process.env.MY_APP,
      user: 'pro',
      password: 'Siscom3519',
      database: 'sis_admin',
      timezone: '+00:00',
      multipleStatements: true,
    },
    pool: { min: 10, max: 100 },
    acquireConnectionTimeout: 60000,
  };
}
