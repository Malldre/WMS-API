import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { supplierInfo, companies } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class SupplierRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select({
        id: supplierInfo.id,
        uuid: supplierInfo.uuid,
        companyId: supplierInfo.companyId,
        company: companies,
        createdAt: supplierInfo.createdAt,
      })
      .from(supplierInfo)
      .innerJoin(companies, eq(supplierInfo.companyId, companies.id));
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
    
    return supplier;
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
    
    return supplier;
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
    
    return supplier;
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

  async delete(uuid: string) {
    const [supplier] = await this.db
      .delete(supplierInfo)
      .where(eq(supplierInfo.uuid, uuid))
      .returning();
    
    return supplier;
  }
}