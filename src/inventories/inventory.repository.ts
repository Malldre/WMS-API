import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { inventories } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class InventoryRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof inventories.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(inventories);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof inventories.$inferSelect, 'id'> | undefined> {
    const [inventory] = await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.uuid, uuid))
      .limit(1);

    return inventory ? omitAllInternalIds(inventory) : undefined;
  }

  async findByInvoiceItemId(invoiceItemId: number): Promise<Omit<typeof inventories.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.materialId, invoiceItemId));
    return omitAllInternalIdsFromArray(result);
  }

  async findByStorageId(storageId: number): Promise<Omit<typeof inventories.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(inventories)
      .where(eq(inventories.storageId, storageId));
    return omitAllInternalIdsFromArray(result);
  }

  async findByInvoiceItemAndStorage(invoiceItemId: number, storageId: number): Promise<Omit<typeof inventories.$inferSelect, 'id'> | undefined> {
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

    return inventory ? omitAllInternalIds(inventory) : undefined;
  }

  async create(inventoryData: {
    invoiceItemId: number;
    storageId: number;
    quantity: string;
  }): Promise<Omit<typeof inventories.$inferSelect, 'id'>> {
    const [inventory] = await this.db
      .insert(inventories)
      .values({
        materialId: inventoryData.invoiceItemId,
        storageId: inventoryData.storageId,
        quantity: inventoryData.quantity,
      })
      .returning();

    return omitAllInternalIds(inventory);
  }

  async update(uuid: string, inventoryData: {
    invoiceItemId?: number;
    storageId?: number;
    quantity?: string;
  }): Promise<Omit<typeof inventories.$inferSelect, 'id'>> {
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

    return omitAllInternalIds(inventory);
  }

  async delete(uuid: string): Promise<Omit<typeof inventories.$inferSelect, 'id'>> {
    const [inventory] = await this.db
      .delete(inventories)
      .where(eq(inventories.uuid, uuid))
      .returning();

    return omitAllInternalIds(inventory);
  }
}