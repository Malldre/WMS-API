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

  async findById(id: number) {
    const storage = await this.storageRepository.findById(id);
    
    if (!storage) {
      throw new NotFoundException(`Storage with ID ${id} not found`);
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

  async getAllStorageNames() {
    const storages = await this.storageRepository.findAll();
    return storages.map(storage => ({
      uuid: storage.uuid,
      name: storage.name,
      code: storage.code,
    }));
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

    // Verificar se name já existe
    const existingName = await this.storageRepository.findByName(createStorageDto.name);
    if (existingName) {
      throw new ConflictException('Storage with this name already exists');
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

    // Se estiver atualizando o name, verificar duplicação
    if (updateStorageDto.name) {
      const existingName = await this.storageRepository.findByName(updateStorageDto.name);
      if (existingName && existingName.uuid !== uuid) {
        throw new ConflictException('Storage with this name already exists');
      }
    }

    return await this.storageRepository.update(uuid, updateStorageDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.storageRepository.delete(uuid);
  }
}