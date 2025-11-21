import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { supplierInfo, companies } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class SupplierRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    const result = await this.db
      .select({
        id: supplierInfo.id,
        uuid: supplierInfo.uuid,
        companyId: supplierInfo.companyId,
        company: companies,
        createdAt: supplierInfo.createdAt,
      })
      .from(supplierInfo)
      .innerJoin(companies, eq(supplierInfo.companyId, companies.id));

    return result.map(item => ({
      uuid: item.uuid,
      companyId: item.companyId,
      company: item.company ? omitAllInternalIds(item.company) : item.company,
      createdAt: item.createdAt,
    }));
  }

  async findByUuid(uuid: string) {
    const [supplier] = await this.db
      .select({
        id: supplierInfo.id,
        uuid: supplierInfo.uuid,
        companyId: supplierInfo.companyId,
        company: companies,
        createdAt: supplierInfo.createdAt,
      })
      .from(supplierInfo)
      .innerJoin(companies, eq(supplierInfo.companyId, companies.id))
      .where(eq(supplierInfo.uuid, uuid))
      .limit(1);

    if (!supplier) return undefined;

    return {
      uuid: supplier.uuid,
      companyId: supplier.companyId,
      company: supplier.company ? omitAllInternalIds(supplier.company) : supplier.company,
      createdAt: supplier.createdAt,
    };
  }

  async findByCnpj(cnpj: string) {
    const [supplier] = await this.db
      .select({
        id: supplierInfo.id,
        uuid: supplierInfo.uuid,
        companyId: supplierInfo.companyId,
        company: companies,
        createdAt: supplierInfo.createdAt,
      })
      .from(supplierInfo)
      .innerJoin(companies, eq(supplierInfo.companyId, companies.id))
      .where(eq(companies.cnpj, cnpj))
      .limit(1);

    if (!supplier) return undefined;

    return {
      uuid: supplier.uuid,
      companyId: supplier.companyId,
      company: supplier.company ? omitAllInternalIds(supplier.company) : supplier.company,
      createdAt: supplier.createdAt,
    };
  }

  async findByCompanyId(companyId: number) {
    const [supplier] = await this.db
      .select({
        id: supplierInfo.id,
        uuid: supplierInfo.uuid,
        companyId: supplierInfo.companyId,
        company: companies,
        createdAt: supplierInfo.createdAt,
      })
      .from(supplierInfo)
      .innerJoin(companies, eq(supplierInfo.companyId, companies.id))
      .where(eq(supplierInfo.companyId, companyId))
      .limit(1);

    if (!supplier) return undefined;

    return {
      uuid: supplier.uuid,
      companyId: supplier.companyId,
      company: supplier.company ? omitAllInternalIds(supplier.company) : supplier.company,
      createdAt: supplier.createdAt,
    };
  }

  async create(companyId: number) {
    const [supplier] = await this.db
      .insert(supplierInfo)
      .values({
        companyId,
      })
      .returning();

    return await this.findByUuid(supplier.uuid);
  }

  async delete(uuid: string): Promise<Omit<typeof supplierInfo.$inferSelect, 'id'>> {
    const [supplier] = await this.db
      .delete(supplierInfo)
      .where(eq(supplierInfo.uuid, uuid))
      .returning();

    return omitAllInternalIds(supplier);
  }
}