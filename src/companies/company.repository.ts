import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { companies } from '../db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { omitAllInternalIds, omitAllInternalIdsFromArray } from '../common/utils/omit-id.util';

@Injectable()
export class CompanyRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findAll(): Promise<Omit<typeof companies.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(companies);
    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(uuid: string): Promise<Omit<typeof companies.$inferSelect, 'id'> | undefined> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.uuid, uuid))
      .limit(1);

    return company ? omitAllInternalIds(company) : undefined;
  }

  async findByCnpj(cnpj: string): Promise<Omit<typeof companies.$inferSelect, 'id'> | undefined> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.cnpj, cnpj))
      .limit(1);

    return company ? omitAllInternalIds(company) : undefined;
  }

  /**
   * Internal method that returns the full record including the id field
   * Should only be used for internal foreign key relationships
   */
  async findByCnpjInternal(cnpj: string): Promise<typeof companies.$inferSelect | undefined> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.cnpj, cnpj))
      .limit(1);

    return company;
  }

  async create(companyData: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }): Promise<Omit<typeof companies.$inferSelect, 'id'>> {
    const [company] = await this.db
      .insert(companies)
      .values(companyData)
      .returning();

    return omitAllInternalIds(company);
  }

  /**
   * Internal method that returns the full record including the id field
   * Should only be used for internal foreign key relationships
   */
  async createInternal(companyData: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }): Promise<typeof companies.$inferSelect> {
    const [company] = await this.db
      .insert(companies)
      .values(companyData)
      .returning();

    return company;
  }

  async update(uuid: string, companyData: {
    cnpj?: string;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }): Promise<Omit<typeof companies.$inferSelect, 'id'>> {
    const [company] = await this.db
      .update(companies)
      .set(companyData)
      .where(eq(companies.uuid, uuid))
      .returning();

    return omitAllInternalIds(company);
  }

  async delete(uuid: string): Promise<Omit<typeof companies.$inferSelect, 'id'>> {
    const [company] = await this.db
      .delete(companies)
      .where(eq(companies.uuid, uuid))
      .returning();

    return omitAllInternalIds(company);
  }
}