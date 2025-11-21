import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { materials } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class MaterialRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof materials.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(materials);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof materials.$inferSelect, 'id'> | undefined> {
    const [material] = await this.db
      .select()
      .from(materials)
      .where(eq(materials.uuid, uuid))
      .limit(1);

    return material ? omitAllInternalIds(material) : undefined;
  }

  async findByExternalCode(externalCode: string): Promise<Omit<typeof materials.$inferSelect, 'id'> | undefined> {
    const [material] = await this.db
      .select()
      .from(materials)
      .where(eq(materials.externalCode, externalCode))
      .limit(1);

    return material ? omitAllInternalIds(material) : undefined;
  }

  async findByCategoryId(categoryId: number): Promise<Omit<typeof materials.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(materials)
      .where(eq(materials.categoryId, categoryId));
    return omitAllInternalIdsFromArray(result);
  }

  async create(materialData: {
    externalCode: string;
    categoryId: number;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }): Promise<Omit<typeof materials.$inferSelect, 'id'>> {
    const [material] = await this.db
      .insert(materials)
      .values(materialData)
      .returning();

    return omitAllInternalIds(material);
  }

  async update(uuid: string, materialData: {
    externalCode?: string;
    categoryId?: number;
    description?: string;
    materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }): Promise<Omit<typeof materials.$inferSelect, 'id'>> {
    const [material] = await this.db
      .update(materials)
      .set(materialData)
      .where(eq(materials.uuid, uuid))
      .returning();

    return omitAllInternalIds(material);
  }

  async delete(uuid: string): Promise<Omit<typeof materials.$inferSelect, 'id'>> {
    const [material] = await this.db
      .delete(materials)
      .where(eq(materials.uuid, uuid))
      .returning();

    return omitAllInternalIds(material);
  }
}