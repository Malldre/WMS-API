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

  async findByInvoiceItemId(invoiceItemId: number) {
    return await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.materialId, invoiceItemId));
  }

  async findByStorageId(storageId: number) {
    return await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.storageId, storageId));
  }

  async findByInvoiceItemAndStorage(invoiceItemId: number, storageId: number) {
    const [inventory] = await this.db
      .select()
      .from(inventories)
      .where(
        and(
          eq(inventories.materialId, invoiceItemId),
          eq(inventories.storageId, storageId)
        )
      )
      .limit(1);
    
    return inventory;
  }

  async create(inventoryData: {
    invoiceItemId: number;
    storageId: number;
    quantity: string;
  }) {
    const [inventory] = await this.db
      .insert(inventories)
      .values({
        materialId: inventoryData.invoiceItemId,
        storageId: inventoryData.storageId,
        quantity: inventoryData.quantity,
      })
      .returning();
    
    return inventory;
  }

  async update(uuid: string, inventoryData: {
    invoiceItemId?: number;
    storageId?: number;
    quantity?: string;
  }) {
    const updateData: any = {};
    
    if (inventoryData.invoiceItemId !== undefined) {
      updateData.materialId = inventoryData.invoiceItemId;
    }
    if (inventoryData.storageId !== undefined) {
      updateData.storageId = inventoryData.storageId;
    }
    if (inventoryData.quantity !== undefined) {
      updateData.quantity = inventoryData.quantity;
    }

    const [inventory] = await this.db
      .update(inventories)
      .set(updateData)
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