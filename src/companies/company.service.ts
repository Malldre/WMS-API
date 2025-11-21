import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CompanyRepository } from './company.repository';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async findAll() {
    return await this.companyRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const company = await this.companyRepository.findByUuid(uuid);
    
    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }
    
    return company;
  }

  async findByCnpj(cnpj: string) {
    const company = await this.companyRepository.findByCnpj(cnpj);
    
    if (!company) {
      throw new NotFoundException(`Company with CNPJ ${cnpj} not found`);
    }
    
    return company;
  }

  async create(createCompanyDto: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    // Verificar se CNPJ já existe
    const existingCompany = await this.companyRepository.findByCnpj(createCompanyDto.cnpj);
    if (existingCompany) {
      throw new ConflictException('Company with this CNPJ already exists');
    }

    return await this.companyRepository.create(createCompanyDto);
  }

  async findOrCreate(createCompanyDto: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    // Buscar company existente
    const existingCompany = await this.companyRepository.findByCnpj(createCompanyDto.cnpj);

    if (existingCompany) {
      return existingCompany;
    }

    // Criar nova company se não existir
    return await this.companyRepository.create(createCompanyDto);
  }

  /**
   * Internal method for finding or creating a company with the id field included
   * Should only be used for internal foreign key relationships
   */
  async findOrCreateInternal(createCompanyDto: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    // Buscar company existente
    const existingCompany = await this.companyRepository.findByCnpjInternal(createCompanyDto.cnpj);

    if (existingCompany) {
      return existingCompany;
    }

    // Criar nova company se não existir
    return await this.companyRepository.createInternal(createCompanyDto);
  }

  async update(uuid: string, updateCompanyDto: {
    cnpj?: string;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    // Verificar se company existe
    await this.findByUuid(uuid);

    // Se estiver atualizando o CNPJ, verificar duplicação
    if (updateCompanyDto.cnpj) {
      const existingCompany = await this.companyRepository.findByCnpj(updateCompanyDto.cnpj);
      if (existingCompany && existingCompany.uuid !== uuid) {
        throw new ConflictException('Company with this CNPJ already exists');
      }
    }

    return await this.companyRepository.update(uuid, updateCompanyDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.companyRepository.delete(uuid);
  }
}