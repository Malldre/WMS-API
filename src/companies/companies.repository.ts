import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { companies, Company, NewCompany } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class CompanyRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(companies)
      .where(isNull(companies.deletedAt));
  }

  async findByUuid(uuid: string) {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(
        and(
          eq(companies.uuid, uuid),
          isNull(companies.deletedAt)
        )
      )
      .limit(1);
    
    return company;
  }

  async findByCnpj(cnpj: string) {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(
        and(
          eq(companies.cnpj, cnpj),
          isNull(companies.deletedAt)
        )
      )
      .limit(1);
    
    return company;
  }

  async create(companyData: NewCompany) {
    const [company] = await this.db
      .insert(companies)
      .values(companyData)
      .returning();
    
    return company;
  }

  async update(uuid: string, companyData: Partial<Company>) {
    const [company] = await this.db
      .update(companies)
      .set({
        ...companyData,
        changedAt: new Date(),
      })
      .where(
        and(
          eq(companies.uuid, uuid),
          isNull(companies.deletedAt)
        )
      )
      .returning();
    
    return company;
  }

  async softDelete(uuid: string, deletedById: number) {
    const [company] = await this.db
      .update(companies)
      .set({
        deletedById,
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(companies.uuid, uuid),
          isNull(companies.deletedAt)
        )
      )
      .returning();
    
    return company;
  }
}