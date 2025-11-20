import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MaterialCategoryRepository } from './material_category.repository';

@Injectable()
export class MaterialCategoryService {
  constructor(private readonly materialCategoryRepository: MaterialCategoryRepository) {}

  async findAll() {
    return await this.materialCategoryRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const category = await this.materialCategoryRepository.findByUuid(uuid);
    
    if (!category) {
      throw new NotFoundException(`Material category with UUID ${uuid} not found`);
    }
    
    return category;
  }

  async findByName(name: string) {
    const category = await this.materialCategoryRepository.findByName(name);
    
    if (!category) {
      throw new NotFoundException(`Material category with name ${name} not found`);
    }
    
    return category;
  }

  async create(createCategoryDto: {
    name: string;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }) {
    // Verificar se name já existe
    const existingCategory = await this.materialCategoryRepository.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException('Material category with this name already exists');
    }

    return await this.materialCategoryRepository.create(createCategoryDto);
  }

  async update(uuid: string, updateCategoryDto: {
    name?: string;
    description?: string;
    materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }) {
    // Verificar se category existe
    await this.findByUuid(uuid);

    // Se estiver atualizando o name, verificar duplicação
    if (updateCategoryDto.name) {
      const existingCategory = await this.materialCategoryRepository.findByName(updateCategoryDto.name);
      if (existingCategory && existingCategory.uuid !== uuid) {
        throw new ConflictException('Material category with this name already exists');
      }
    }

    return await this.materialCategoryRepository.update(uuid, updateCategoryDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.materialCategoryRepository.delete(uuid);
  }
}