import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { Config } from 'drizzle-kit';
const postgres = require('postgres');

export const DB_CONNECTION = 'DB_CONNECTION';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      useValue: db,
    },
  ],
  exports: [DB_CONNECTION],
})
export class DbModule {}
