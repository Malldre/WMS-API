import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { invoices } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class InvoiceRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof invoices.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(invoices);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof invoices.$inferSelect, 'id'> | undefined> {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.uuid, uuid))
      .limit(1);

    return invoice ? omitAllInternalIds(invoice) : undefined;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Omit<typeof invoices.$inferSelect, 'id'> | undefined> {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);

    return invoice ? omitAllInternalIds(invoice) : undefined;
  }

  async findBySupplierId(supplierId: number): Promise<Omit<typeof invoices.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.supplierId, supplierId));
    return omitAllInternalIdsFromArray(result);
  }

  async create(invoiceData: {
    invoiceNumber: string;
    supplierId: number;
    receivedAt: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
  }): Promise<Omit<typeof invoices.$inferSelect, 'id'>> {
    const [invoice] = await this.db
      .insert(invoices)
      .values(invoiceData)
      .returning();

    return omitAllInternalIds(invoice);
  }

  async update(uuid: string, invoiceData: {
    invoiceNumber?: string;
    supplierId?: number;
    receivedAt?: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
  }): Promise<Omit<typeof invoices.$inferSelect, 'id'>> {
    const [invoice] = await this.db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.uuid, uuid))
      .returning();

    return omitAllInternalIds(invoice);
  }

  async delete(uuid: string): Promise<Omit<typeof invoices.$inferSelect, 'id'>> {
    const [invoice] = await this.db
      .delete(invoices)
      .where(eq(invoices.uuid, uuid))
      .returning();

    return omitAllInternalIds(invoice);
  }
}