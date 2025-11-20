import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { invoiceItems } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class InvoiceItemRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(invoiceItems);
  }

  async findByUuid(uuid: string) {
    const [item] = await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.uuid, uuid))
      .limit(1);
    
    return item;
  }

  async findByInvoiceId(invoiceId: number) {
    return await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async findByMaterialId(materialId: number) {
    return await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.materialId, materialId));
  }

  async create(itemData: {
    invoiceId: number;
    materialId: number;
    quantity: string;
    totalValue: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
  }) {
    const [item] = await this.db
      .insert(invoiceItems)
      .values(itemData)
      .returning();
    
    return item;
  }

  async update(uuid: string, itemData: {
    invoiceId?: number;
    materialId?: number;
    quantity?: string;
    totalValue?: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
  }) {
    const [item] = await this.db
      .update(invoiceItems)
      .set(itemData)
      .where(eq(invoiceItems.uuid, uuid))
      .returning();
    
    return item;
  }

  async delete(uuid: string) {
    const [item] = await this.db
      .delete(invoiceItems)
      .where(eq(invoiceItems.uuid, uuid))
      .returning();
    
    return item;
  }
}