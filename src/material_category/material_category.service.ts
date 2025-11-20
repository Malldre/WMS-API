import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { materialCategories, MaterialCategory, NewMaterialCategory } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { MaterialUnitEnum } from './material_category.entity';

@Injectable()
export class MaterialCategoryService {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findOne(category: string): Promise<MaterialCategory | undefined> {
    const result = await this.db
      .select()
      .from(materialCategories)
      .where(eq(materialCategories.name, category))
      .limit(1);

    return result[0];
  }

  async findById(uuid: string): Promise<MaterialCategory | undefined> {
    const result = await this.db
      .select()
      .from(materialCategories)
      .where(eq(materialCategories.uuid, uuid))
      .limit(1);

    return result[0];
  }

  async createMaterialCategory(name: string, description: string, materialUnit: MaterialUnitEnum): Promise<MaterialCategory> {
    const newMaterialCategory: NewMaterialCategory = {
      name,
      description,
      materialUnit
    };

    const result = await this.db.insert(materialCategories).values(newMaterialCategory).returning();
    return result[0];
  }
}
