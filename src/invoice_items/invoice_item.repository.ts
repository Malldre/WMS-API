import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { invoiceItems } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class InvoiceItemRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(invoiceItems);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'> | undefined> {
    const [item] = await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.uuid, uuid))
      .limit(1);

    return item ? omitAllInternalIds(item) : undefined;
  }

  async findByInvoiceId(invoiceId: number): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
    return omitAllInternalIdsFromArray(result);
  }

  async findByMaterialId(materialId: number): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.materialId, materialId));
    return omitAllInternalIdsFromArray(result);
  }

  async create(itemData: {
    invoiceId: number;
    materialId: number;
    quantity: string;
    totalValue: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
  }): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'>> {
    const [item] = await this.db
      .insert(invoiceItems)
      .values(itemData)
      .returning();

    return omitAllInternalIds(item);
  }

  async update(uuid: string, itemData: {
    invoiceId?: number;
    materialId?: number;
    quantity?: string;
    totalValue?: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
  }): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'>> {
    const [item] = await this.db
      .update(invoiceItems)
      .set(itemData)
      .where(eq(invoiceItems.uuid, uuid))
      .returning();

    return omitAllInternalIds(item);
  }

  async delete(uuid: string): Promise<Omit<typeof invoiceItems.$inferSelect, 'id'>> {
    const [item] = await this.db
      .delete(invoiceItems)
      .where(eq(invoiceItems.uuid, uuid))
      .returning();

    return omitAllInternalIds(item);
  }
}