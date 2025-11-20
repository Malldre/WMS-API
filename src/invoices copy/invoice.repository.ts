import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { invoices } from '../db/schema';
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
      .from(invoices);
  }

  async findByUuid(uuid: string) {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.uuid, uuid))
      .limit(1);
    
    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);
    
    return invoice;
  }

  async findBySupplierId(supplierId: number) {
    return await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.supplierId, supplierId));
  }

  async create(invoiceData: {
    invoiceNumber: string;
    supplierId: number;
    receivedAt: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
  }) {
    const [invoice] = await this.db
      .insert(invoices)
      .values(invoiceData)
      .returning();
    
    return invoice;
  }

  async update(uuid: string, invoiceData: {
    invoiceNumber?: string;
    supplierId?: number;
    receivedAt?: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
  }) {
    const [invoice] = await this.db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.uuid, uuid))
      .returning();
    
    return invoice;
  }

  async delete(uuid: string) {
    const [invoice] = await this.db
      .delete(invoices)
      .where(eq(invoices.uuid, uuid))
      .returning();
    
    return invoice;
  }
}