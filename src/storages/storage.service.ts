import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { StorageRepository } from './storage.repository';

@Injectable()
export class StorageService {
  constructor(private readonly storageRepository: StorageRepository) {}

  async findAll() {
    return await this.storageRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const storage = await this.storageRepository.findByUuid(uuid);
    
    if (!storage) {
      throw new NotFoundException(`Storage with UUID ${uuid} not found`);
    }
    
    return storage;
  }

  async findByCode(code: string) {
    const storage = await this.storageRepository.findByCode(code);
    
    if (!storage) {
      throw new NotFoundException(`Storage with code ${code} not found`);
    }
    
    return storage;
  }

  async findByCompanyId(companyId: number) {
    return await this.storageRepository.findByCompanyId(companyId);
  }

  async create(createStorageDto: {
    code: string;
    name: string;
    companyId: number;
  }) {
    // Verificar se code já existe
    const existingStorage = await this.storageRepository.findByCode(createStorageDto.code);
    if (existingStorage) {
      throw new ConflictException('Storage with this code already exists');
    }

    return await this.storageRepository.create(createStorageDto);
  }

  async update(uuid: string, updateStorageDto: {
    code?: string;
    name?: string;
    companyId?: number;
  }) {
    // Verificar se storage existe
    await this.findByUuid(uuid);

    // Se estiver atualizando o code, verificar duplicação
    if (updateStorageDto.code) {
      const existingStorage = await this.storageRepository.findByCode(updateStorageDto.code);
      if (existingStorage && existingStorage.uuid !== uuid) {
        throw new ConflictException('Storage with this code already exists');
      }
    }

    return await this.storageRepository.update(uuid, updateStorageDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.storageRepository.delete(uuid);
  }
}