import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { invoices, Invoice, NewInvoice } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class InvoiceRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(invoices)
      .where(isNull(invoices.deletedAt));
  }

  async findByUuid(uuid: string) {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.uuid, uuid),
          isNull(invoices.deletedAt)
        )
      )
      .limit(1);
    
    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNumber, invoiceNumber),
          isNull(invoices.deletedAt)
        )
      )
      .limit(1);
    
    return invoice;
  }

  async findBySupplierId(supplierId: number) {
    return await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.supplierId, supplierId),
          isNull(invoices.deletedAt)
        )
      );
  }

  async create(invoiceData: NewInvoice) {
    const [invoice] = await this.db
      .insert(invoices)
      .values(invoiceData)
      .returning();
    
    return invoice;
  }

  async update(uuid: string, invoiceData: Partial<Invoice>) {
    const [invoice] = await this.db
      .update(invoices)
      .set({
        ...invoiceData,
        changedAt: new Date(),
      })
      .where(
        and(
          eq(invoices.uuid, uuid),
          isNull(invoices.deletedAt)
        )
      )
      .returning();
    
    return invoice;
  }

  async softDelete(uuid: string) {
    const [invoice] = await this.db
      .update(invoices)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(invoices.uuid, uuid),
          isNull(invoices.deletedAt)
        )
      )
      .returning();
    
    return invoice;
  }
}