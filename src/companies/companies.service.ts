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
    createdById: number;
  }) {
    // Verificar se CNPJ já existe
    try {
      const existingCompany = await this.companyRepository.findByCnpj(createCompanyDto.cnpj);
      if (existingCompany) {
        throw new ConflictException('Company with this CNPJ already exists');
      }
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    return await this.companyRepository.create(createCompanyDto);
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
    changedById: number;
  }) {
    // Verificar se company existe
    await this.findByUuid(uuid);

    // Se estiver atualizando o CNPJ, verificar duplicação
    if (updateCompanyDto.cnpj) {
      try {
        const existingCompany = await this.companyRepository.findByCnpj(updateCompanyDto.cnpj);
        if (existingCompany && existingCompany.uuid !== uuid) {
          throw new ConflictException('Company with this CNPJ already exists');
        }
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    return await this.companyRepository.update(uuid, updateCompanyDto);
  }

  async remove(uuid: string, deletedById: number) {
    await this.findByUuid(uuid);
    return await this.companyRepository.softDelete(uuid, deletedById);
  }
}