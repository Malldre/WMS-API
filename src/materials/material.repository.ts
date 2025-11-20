import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { materials } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class MaterialRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(materials);
  }

  async findByUuid(uuid: string) {
    const [material] = await this.db
      .select()
      .from(materials)
      .where(eq(materials.uuid, uuid))
      .limit(1);
    
    return material;
  }

  async findByExternalCode(externalCode: string) {
    const [material] = await this.db
      .select()
      .from(materials)
      .where(eq(materials.externalCode, externalCode))
      .limit(1);
    
    return material;
  }

  async findByCategoryId(categoryId: number) {
    return await this.db
      .select()
      .from(materials)
      .where(eq(materials.categoryId, categoryId));
  }

  async create(materialData: {
    externalCode: string;
    categoryId: number;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }) {
    const [material] = await this.db
      .insert(materials)
      .values(materialData)
      .returning();
    
    return material;
  }

  async update(uuid: string, materialData: {
    externalCode?: string;
    categoryId?: number;
    description?: string;
    materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }) {
    const [material] = await this.db
      .update(materials)
      .set(materialData)
      .where(eq(materials.uuid, uuid))
      .returning();
    
    return material;
  }

  async delete(uuid: string) {
    const [material] = await this.db
      .delete(materials)
      .where(eq(materials.uuid, uuid))
      .returning();
    
    return material;
  }
}