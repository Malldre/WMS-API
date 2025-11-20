import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async findAll() {
    return await this.inventoryRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const inventory = await this.inventoryRepository.findByUuid(uuid);
    
    if (!inventory) {
      throw new NotFoundException(`Inventory with UUID ${uuid} not found`);
    }
    
    return inventory;
  }

  async findByMaterialId(materialId: number) {
    return await this.inventoryRepository.findByMaterialId(materialId);
  }

  async findByStorageId(storageId: number) {
    return await this.inventoryRepository.findByStorageId(storageId);
  }

  async findByMaterialAndStorage(materialId: number, storageId: number) {
    const inventory = await this.inventoryRepository.findByMaterialAndStorage(materialId, storageId);
    
    if (!inventory) {
      throw new NotFoundException(`Inventory with materialId ${materialId} and storageId ${storageId} not found`);
    }
    
    return inventory;
  }

  async create(createInventoryDto: {
    materialId: number;
    storageId: number;
    quantity: string;
  }) {
    // Verificar se já existe inventário para esse material nesse storage
    const existingInventory = await this.inventoryRepository.findByMaterialAndStorage(
      createInventoryDto.materialId,
      createInventoryDto.storageId
    );
    
    if (existingInventory) {
      throw new ConflictException('Inventory for this material and storage already exists');
    }

    return await this.inventoryRepository.create(createInventoryDto);
  }

  async update(uuid: string, updateInventoryDto: {
    materialId?: number;
    storageId?: number;
    quantity?: string;
  }) {
    // Verificar se inventory existe
    await this.findByUuid(uuid);

    // Se estiver atualizando materialId ou storageId, verificar duplicação
    if (updateInventoryDto.materialId || updateInventoryDto.storageId) {
      const currentInventory = await this.inventoryRepository.findByUuid(uuid);
      const materialId = updateInventoryDto.materialId || currentInventory.materialId;
      const storageId = updateInventoryDto.storageId || currentInventory.storageId;
      
      const existingInventory = await this.inventoryRepository.findByMaterialAndStorage(materialId, storageId);
      if (existingInventory && existingInventory.uuid !== uuid) {
        throw new ConflictException('Inventory for this material and storage already exists');
      }
    }

    return await this.inventoryRepository.update(uuid, updateInventoryDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.inventoryRepository.delete(uuid);
  }
}