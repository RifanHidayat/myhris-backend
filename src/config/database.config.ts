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
