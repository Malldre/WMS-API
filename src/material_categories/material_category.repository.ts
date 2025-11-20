import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { materialCategories } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class MaterialCategoryRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(materialCategories);
  }

  async findByUuid(uuid: string) {
    const [category] = await this.db
      .select()
      .from(materialCategories)
      .where(eq(materialCategories.uuid, uuid))
      .limit(1);
    
    return category;
  }

  async findByName(name: string) {
    const [category] = await this.db
      .select()
      .from(materialCategories)
      .where(eq(materialCategories.name, name))
      .limit(1);
    
    return category;
  }

  async create(categoryData: {
    name: string;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }) {
    const [category] = await this.db
      .insert(materialCategories)
      .values(categoryData)
      .returning();
    
    return category;
  }

  async update(uuid: string, categoryData: {
    name?: string;
    description?: string;
    materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }) {
    const [category] = await this.db
      .update(materialCategories)
      .set(categoryData)
      .where(eq(materialCategories.uuid, uuid))
      .returning();
    
    return category;
  }

  async delete(uuid: string) {
    const [category] = await this.db
      .delete(materialCategories)
      .where(eq(materialCategories.uuid, uuid))
      .returning();
    
    return category;
  }
}