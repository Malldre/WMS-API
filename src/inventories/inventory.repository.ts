import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { inventories } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class InventoryRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(inventories);
  }

  async findByUuid(uuid: string) {
    const [inventory] = await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.uuid, uuid))
      .limit(1);
    
    return inventory;
  }

  async findByMaterialId(materialId: number) {
    return await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.materialId, materialId));
  }

  async findByStorageId(storageId: number) {
    return await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.storageId, storageId));
  }

  async findByMaterialAndStorage(materialId: number, storageId: number) {
    const [inventory] = await this.db
      .select()
      .from(inventories)
      .where(
        and(
          eq(inventories.materialId, materialId),
          eq(inventories.storageId, storageId)
        )
      )
      .limit(1);
    
    return inventory;
  }

  async create(inventoryData: {
    materialId: number;
    storageId: number;
    quantity: string;
  }) {
    const [inventory] = await this.db
      .insert(inventories)
      .values(inventoryData)
      .returning();
    
    return inventory;
  }

  async update(uuid: string, inventoryData: {
    materialId?: number;
    storageId?: number;
    quantity?: string;
  }) {
    const [inventory] = await this.db
      .update(inventories)
      .set(inventoryData)
      .where(eq(inventories.uuid, uuid))
      .returning();
    
    return inventory;
  }

  async delete(uuid: string) {
    const [inventory] = await this.db
      .delete(inventories)
      .where(eq(inventories.uuid, uuid))
      .returning();
    
    return inventory;
  }
}