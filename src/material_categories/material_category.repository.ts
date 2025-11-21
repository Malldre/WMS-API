import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { materialCategories } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class MaterialCategoryRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof materialCategories.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(materialCategories);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof materialCategories.$inferSelect, 'id'> | undefined> {
    const [category] = await this.db
      .select()
      .from(materialCategories)
      .where(eq(materialCategories.uuid, uuid))
      .limit(1);

    return category ? omitAllInternalIds(category) : undefined;
  }

  async findByName(name: string): Promise<Omit<typeof materialCategories.$inferSelect, 'id'> | undefined> {
    const [category] = await this.db
      .select()
      .from(materialCategories)
      .where(eq(materialCategories.name, name))
      .limit(1);

    return category ? omitAllInternalIds(category) : undefined;
  }

  async create(categoryData: {
    name: string;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }): Promise<Omit<typeof materialCategories.$inferSelect, 'id'>> {
    const [category] = await this.db
      .insert(materialCategories)
      .values(categoryData)
      .returning();

    return omitAllInternalIds(category);
  }

  async update(uuid: string, categoryData: {
    name?: string;
    description?: string;
    materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }): Promise<Omit<typeof materialCategories.$inferSelect, 'id'>> {
    const [category] = await this.db
      .update(materialCategories)
      .set(categoryData)
      .where(eq(materialCategories.uuid, uuid))
      .returning();

    return omitAllInternalIds(category);
  }

  async delete(uuid: string): Promise<Omit<typeof materialCategories.$inferSelect, 'id'>> {
    const [category] = await this.db
      .delete(materialCategories)
      .where(eq(materialCategories.uuid, uuid))
      .returning();

    return omitAllInternalIds(category);
  }
}