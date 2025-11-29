import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { storages } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class StorageRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof storages.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(storages);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof storages.$inferSelect, 'id'> | undefined> {
    const [storage] = await this.db
      .select()
      .from(storages)
      .where(eq(storages.uuid, uuid))
      .limit(1);

    return storage ? omitAllInternalIds(storage) : undefined;
  }

  async findByCode(code: string): Promise<Omit<typeof storages.$inferSelect, 'id'> | undefined> {
    const [storage] = await this.db
      .select()
      .from(storages)
      .where(eq(storages.code, code))
      .limit(1);

    return storage ? omitAllInternalIds(storage) : undefined;
  }

  async findByName(name: string): Promise<Omit<typeof storages.$inferSelect, 'id'> | undefined> {
    const [storage] = await this.db
      .select()
      .from(storages)
      .where(eq(storages.name, name))
      .limit(1);

    return storage ? omitAllInternalIds(storage) : undefined;
  }

  async findById(id: number): Promise<Omit<typeof storages.$inferSelect, 'id'> | undefined> {
    const [storage] = await this.db
      .select()
      .from(storages)
      .where(eq(storages.id, id))
      .limit(1);

    return storage ? omitAllInternalIds(storage) : undefined;
  }

  async findByCompanyId(companyId: number): Promise<Omit<typeof storages.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(storages)
      .where(eq(storages.companyId, companyId));
    return omitAllInternalIdsFromArray(result);
  }

  async create(storageData: {
    code: string;
    name: string;
    companyId: number;
  }): Promise<Omit<typeof storages.$inferSelect, 'id'>> {
    const [storage] = await this.db
      .insert(storages)
      .values(storageData)
      .returning();

    return omitAllInternalIds(storage);
  }

  async update(uuid: string, storageData: {
    code?: string;
    name?: string;
    companyId?: number;
  }): Promise<Omit<typeof storages.$inferSelect, 'id'>> {
    const [storage] = await this.db
      .update(storages)
      .set(storageData)
      .where(eq(storages.uuid, uuid))
      .returning();

    return omitAllInternalIds(storage);
  }

  async delete(uuid: string): Promise<Omit<typeof storages.$inferSelect, 'id'>> {
    const [storage] = await this.db
      .delete(storages)
      .where(eq(storages.uuid, uuid))
      .returning();

    return omitAllInternalIds(storage);
  }
}