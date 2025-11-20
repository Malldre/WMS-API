import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { storages } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class StorageRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(storages);
  }

  async findByUuid(uuid: string) {
    const [storage] = await this.db
      .select()
      .from(storages)
      .where(eq(storages.uuid, uuid))
      .limit(1);
    
    return storage;
  }

  async findByCode(code: string) {
    const [storage] = await this.db
      .select()
      .from(storages)
      .where(eq(storages.code, code))
      .limit(1);
    
    return storage;
  }

  async findByCompanyId(companyId: number) {
    return await this.db
      .select()
      .from(storages)
      .where(eq(storages.companyId, companyId));
  }

  async create(storageData: {
    code: string;
    name: string;
    companyId: number;
  }) {
    const [storage] = await this.db
      .insert(storages)
      .values(storageData)
      .returning();
    
    return storage;
  }

  async update(uuid: string, storageData: {
    code?: string;
    name?: string;
    companyId?: number;
  }) {
    const [storage] = await this.db
      .update(storages)
      .set(storageData)
      .where(eq(storages.uuid, uuid))
      .returning();
    
    return storage;
  }

  async delete(uuid: string) {
    const [storage] = await this.db
      .delete(storages)
      .where(eq(storages.uuid, uuid))
      .returning();
    
    return storage;
  }
}