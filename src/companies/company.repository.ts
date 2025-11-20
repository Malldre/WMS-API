import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { companies } from '../db/schema';
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
      .from(companies);
  }

  async findByUuid(uuid: string) {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.uuid, uuid))
      .limit(1);
    
    return company;
  }

  async findByCnpj(cnpj: string) {
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
  }) {
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
  }) {
    const [company] = await this.db
      .update(companies)
      .set(companyData)
      .where(eq(companies.uuid, uuid))
      .returning();
    
    return company;
  }

  async delete(uuid: string) {
    const [company] = await this.db
      .delete(companies)
      .where(eq(companies.uuid, uuid))
      .returning();
    
    return company;
  }
}