import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MaterialRepository } from './material.repository';

@Injectable()
export class MaterialService {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async findAll() {
    return await this.materialRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const material = await this.materialRepository.findByUuid(uuid);
    
    if (!material) {
      throw new NotFoundException(`Material with UUID ${uuid} not found`);
    }
    
    return material;
  }

  async findByExternalCode(externalCode: string) {
    const material = await this.materialRepository.findByExternalCode(externalCode);
    
    if (!material) {
      throw new NotFoundException(`Material with external code ${externalCode} not found`);
    }
    
    return material;
  }

  async findByCategoryId(categoryId: number) {
    return await this.materialRepository.findByCategoryId(categoryId);
  }

  async create(createMaterialDto: {
    externalCode: string;
    categoryId: number;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }) {
    // Verificar se externalCode já existe
    const existingMaterial = await this.materialRepository.findByExternalCode(createMaterialDto.externalCode);
    if (existingMaterial) {
      throw new ConflictException('Material with this external code already exists');
    }

    return await this.materialRepository.create(createMaterialDto);
  }

  async update(uuid: string, updateMaterialDto: {
    externalCode?: string;
    categoryId?: number;
    description?: string;
    materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }) {
    // Verificar se material existe
    await this.findByUuid(uuid);

    // Se estiver atualizando o externalCode, verificar duplicação
    if (updateMaterialDto.externalCode) {
      const existingMaterial = await this.materialRepository.findByExternalCode(updateMaterialDto.externalCode);
      if (existingMaterial && existingMaterial.uuid !== uuid) {
        throw new ConflictException('Material with this external code already exists');
      }
    }

    return await this.materialRepository.update(uuid, updateMaterialDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.materialRepository.delete(uuid);
  }
}