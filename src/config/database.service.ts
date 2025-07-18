// import { Injectable, OnModuleDestroy } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import type { Knex } from 'knex';
// import KnexLib from 'knex';
// import { createDbConfig } from '../config/database.config';

// @Injectable()
// export class DbService implements OnModuleDestroy {
//   private knexInstance: Knex;

//   constructor(private configService: ConfigService) {
//     const host = this.configService.get<string>('DB_HOST') ?? 'localhost';
//     const user = this.configService.get<string>('DB_USER') ?? 'root';
//     const password = this.configService.get<string>('DB_PASSWORD') ?? '';
//     const database = this.configService.get<string>('DB_NAME') ?? 'testdb';

//     const config: Knex.Config = createDbConfig(host, user, password, database);

//     this.knexInstance = KnexLib(config);
//   }

//   get knex(): Knex {
//     return this.knexInstance;
//   }

//   async onModuleDestroy() {
//     await this.knexInstance.destroy();
//   }
// }
