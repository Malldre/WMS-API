import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  omitAllInternalIds,
  omitAllInternalIdsFromArray,
} from '../common/utils/omit-id.util';

@Injectable()
export class InvoiceItemRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(): Promise<any[]> {
    const result = await this.db
      .select({
        uuid: schema.invoiceItems.uuid,
        quantity: schema.invoiceItems.quantity,
        totalValue: schema.invoiceItems.totalValue,
        unitValue: schema.invoiceItems.unitValue,
        status: schema.invoiceItems.status,
        remark: schema.invoiceItems.remark,
        createdAt: schema.invoiceItems.createdAt,
        invoiceId: schema.invoiceItems.invoiceId,
        materialId: schema.invoiceItems.materialId,
        // Dados do material
        materialName: schema.materials.description,
        materialUnit: schema.materials.materialUnit,
        // Dados da invoice
        invoiceNumber: schema.invoices.invoiceNumber,
      })
      .from(schema.invoiceItems)
      .leftJoin(
        schema.materials,
        eq(schema.invoiceItems.materialId, schema.materials.id),
      )
      .leftJoin(
        schema.invoices,
        eq(schema.invoiceItems.invoiceId, schema.invoices.id),
      )
      .orderBy(desc(schema.invoiceItems.createdAt));

    return result;
  }

  async findByUuid(uuid: string): Promise<any | null> {
    const result = await this.db
      .select({
        uuid: schema.invoiceItems.uuid,
        quantity: schema.invoiceItems.quantity,
        totalValue: schema.invoiceItems.totalValue,
        unitValue: schema.invoiceItems.unitValue,
        status: schema.invoiceItems.status,
        remark: schema.invoiceItems.remark,
        createdAt: schema.invoiceItems.createdAt,
        invoiceId: schema.invoiceItems.invoiceId,
        materialId: schema.invoiceItems.materialId,
        // Dados do material
        materialName: schema.materials.description,
        materialUnit: schema.materials.materialUnit,
        // Dados da invoice
        invoiceNumber: schema.invoices.invoiceNumber,
      })
      .from(schema.invoiceItems)
      .leftJoin(
        schema.materials,
        eq(schema.invoiceItems.materialId, schema.materials.id),
      )
      .leftJoin(
        schema.invoices,
        eq(schema.invoiceItems.invoiceId, schema.invoices.id),
      )
      .where(eq(schema.invoiceItems.uuid, uuid))
      .limit(1);

    return result[0] || null;
  }

  async findByInvoiceId(invoiceId: number): Promise<any[]> {
    const result = await this.db
      .select({
        uuid: schema.invoiceItems.uuid,
        quantity: schema.invoiceItems.quantity,
        totalValue: schema.invoiceItems.totalValue,
        unitValue: schema.invoiceItems.unitValue,
        status: schema.invoiceItems.status,
        remark: schema.invoiceItems.remark,
        createdAt: schema.invoiceItems.createdAt,
        invoiceId: schema.invoiceItems.invoiceId,
        materialId: schema.invoiceItems.materialId,
        // Dados do material
        materialName: schema.materials.description,
        materialUnit: schema.materials.materialUnit,
        materialDescription: schema.materials.description,
      })
      .from(schema.invoiceItems)
      .leftJoin(
        schema.materials,
        eq(schema.invoiceItems.materialId, schema.materials.id),
      )
      .where(eq(schema.invoiceItems.invoiceId, invoiceId))
      .orderBy(desc(schema.invoiceItems.createdAt));

    return result;
  }

  async findByInvoiceAndMaterial(
    invoiceId: number,
    materialId: number,
  ): Promise<Omit<typeof schema.invoiceItems.$inferSelect, 'id'> | null> {
    const result = await this.db
      .select()
      .from(schema.invoiceItems)
      .where(
        and(
          eq(schema.invoiceItems.invoiceId, invoiceId),
          eq(schema.invoiceItems.materialId, materialId),
        ),
      )
      .limit(1);

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }

  async create(
    invoiceItem: typeof schema.invoiceItems.$inferInsert,
  ): Promise<Omit<typeof schema.invoiceItems.$inferSelect, 'id'>> {
    const result = await this.db
      .insert(schema.invoiceItems)
      .values(invoiceItem)
      .returning();

    return omitAllInternalIds(result[0]);
  }

  async update(
    uuid: string,
    invoiceItem: Partial<typeof schema.invoiceItems.$inferInsert>,
  ): Promise<Omit<typeof schema.invoiceItems.$inferSelect, 'id'> | null> {
    const result = await this.db
      .update(schema.invoiceItems)
      .set(invoiceItem)
      .where(eq(schema.invoiceItems.uuid, uuid))
      .returning();

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }

  async delete(
    uuid: string,
  ): Promise<Omit<typeof schema.invoiceItems.$inferSelect, 'id'> | null> {
    const result = await this.db
      .delete(schema.invoiceItems)
      .where(eq(schema.invoiceItems.uuid, uuid))
      .returning();

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }
}