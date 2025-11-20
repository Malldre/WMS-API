import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { invoiceItems, InvoiceItem, NewInvoiceItem } from '../db/schema';
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
      .from(invoiceItems)
      .where(isNull(invoiceItems.deletedAt));
  }

  async findByUuid(uuid: string) {
    const [item] = await this.db
      .select()
      .from(invoiceItems)
      .where(
        and(
          eq(invoiceItems.uuid, uuid),
          isNull(invoiceItems.deletedAt)
        )
      )
      .limit(1);
    
    return item;
  }

  async findByInvoiceId(invoiceId: number) {
    return await this.db
      .select()
      .from(invoiceItems)
      .where(
        and(
          eq(invoiceItems.invoiceId, invoiceId),
          isNull(invoiceItems.deletedAt)
        )
      );
  }

  async findByMaterialId(materialId: number) {
    return await this.db
      .select()
      .from(invoiceItems)
      .where(
        and(
          eq(invoiceItems.materialId, materialId),
          isNull(invoiceItems.deletedAt)
        )
      );
  }

  async create(itemData: NewInvoiceItem) {
    const [item] = await this.db
      .insert(invoiceItems)
      .values(itemData)
      .returning();
    
    return item;
  }

  async update(uuid: string, itemData: Partial<InvoiceItem>) {
    const [item] = await this.db
      .update(invoiceItems)
      .set({
        ...itemData,
        changedAt: new Date(),
      })
      .where(
        and(
          eq(invoiceItems.uuid, uuid),
          isNull(invoiceItems.deletedAt)
        )
      )
      .returning();
    
    return item;
  }

  async softDelete(uuid: string) {
    const [item] = await this.db
      .update(invoiceItems)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(invoiceItems.uuid, uuid),
          isNull(invoiceItems.deletedAt)
        )
      )
      .returning();
    
    return item;
  }
}