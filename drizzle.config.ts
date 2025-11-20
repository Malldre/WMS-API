import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:malldrefatec*a@201.23.18.245:15432/wms_api',
  },
});
