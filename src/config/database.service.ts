// src/common/db/db.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Knex } from 'knex';
import KnexLib from 'knex';
import { createDbConfig } from '../config/database.config';
import { createSisAdminDbConfig } from '../config/database.config';

@Injectable()
export class DbService implements OnModuleDestroy {
  private connections: Map<string, Knex> = new Map();

  constructor(private configService: ConfigService) {
    console.log('DbService: Constructor called');
    console.log('DbService: ConfigService available:', !!this.configService);
    
    // Test reading environment variables
    const host = this.configService.get<string>('DB_HOST');
    const user = this.configService.get<string>('DB_USER');
    const password = this.configService.get<string>('DB_PASSWORD');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    
    console.log('DbService: Environment variables test:');
    console.log('DbService: DB_HOST:', host);
    console.log('DbService: DB_USER:', user);
    console.log('DbService: DB_PASSWORD:', password ? '***SET***' : '***NOT SET***');
    console.log('DbService: JWT_SECRET:', jwtSecret ? '***SET***' : '***NOT SET***');
    
    // Check if env file is being read
    console.log('DbService: NODE_ENV:', process.env.NODE_ENV);
    console.log('DbService: All env vars:', Object.keys(process.env).filter(key => key.includes('DB_') || key.includes('JWT_')));
  }

  getConnection(tenant: string): Knex {
    const dbName = `${tenant}_hrm`; // contoh: tenantA_hrm, tenantB_hrm

    // Sudah ada koneksi? Return dari cache
    if (this.connections.has(dbName)) {
      return this.connections.get(dbName)!;
    }

    // Kalau belum, buat koneksi baru
    const host = this.configService.get<string>('DB_HOST') ?? 'localhost';
    const user = this.configService.get<string>('DB_USER') ?? 'root';
    const password = this.configService.get<string>('DB_PASSWORD') ?? '';

    console.log('host', host);
    console.log('user', user);
    console.log('password', password);
    console.log('dbName', dbName);

    const config: Knex.Config = createDbConfig(host, user, password, dbName);
    const newConnection = KnexLib(config);

    this.connections.set(dbName, newConnection);
    return newConnection;
  }

  getSisAdminConnection(): Knex {
    const dbName = 'sis_admin';
    if (this.connections.has(dbName)) {
      return this.connections.get(dbName)!;
    }
    const config = createSisAdminDbConfig();
    const newConnection = KnexLib(config);
    this.connections.set(dbName, newConnection);
    return newConnection;
  }

  async onModuleDestroy() {
    for (const conn of this.connections.values()) {
      await conn.destroy();
    }
  }
}
