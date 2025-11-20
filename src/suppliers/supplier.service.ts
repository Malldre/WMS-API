import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupplierRepository } from './supplier.repository';
import { CompanyService } from '../companies/company.service';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly companyService: CompanyService,
  ) {}

  async findAll() {
    return await this.supplierRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const supplier = await this.supplierRepository.findByUuid(uuid);
    
    if (!supplier) {
      throw new NotFoundException(`Supplier with UUID ${uuid} not found`);
    }
    
    return supplier;
  }

  async findByCnpj(cnpj: string) {
    const supplier = await this.supplierRepository.findByCnpj(cnpj);
    
    if (!supplier) {
      throw new NotFoundException(`Supplier with CNPJ ${cnpj} not found`);
    }
    
    return supplier;
  }

  async create(createSupplierDto: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    // Verificar se já existe um supplier com este CNPJ
    try {
      const existingSupplier = await this.supplierRepository.findByCnpj(createSupplierDto.cnpj);
      if (existingSupplier) {
        throw new ConflictException('Supplier with this CNPJ already exists');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Se for NotFoundException, continua (supplier não existe)
    }

    // Buscar ou criar a company (usa findOrCreate)
    const company = await this.companyService.findOrCreate(createSupplierDto);

    // Criar supplierInfo vinculado à company
    return await this.supplierRepository.create(company.id);
  }

  async update(uuid: string, updateSupplierDto: {
    cnpj?: string;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    // Verificar se supplier existe
    const supplier = await this.findByUuid(uuid);

    // Atualizar a company através do CompanyService
    await this.companyService.update(supplier.company.uuid, updateSupplierDto);

    // Retornar supplier atualizado
    return await this.findByUuid(uuid);
  }

  async remove(uuid: string) {
    // Verificar se supplier existe
    await this.findByUuid(uuid);
    
    // Deletar apenas supplierInfo (não deletar a company)
    return await this.supplierRepository.delete(uuid);
  }
}