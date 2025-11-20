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

  async findByInvoiceItemId(invoiceItemId: number) {
    return await this.inventoryRepository.findByInvoiceItemId(invoiceItemId);
  }

  async findByStorageId(storageId: number) {
    return await this.inventoryRepository.findByStorageId(storageId);
  }

  async findByInvoiceItemAndStorage(invoiceItemId: number, storageId: number) {
    const inventory = await this.inventoryRepository.findByInvoiceItemAndStorage(invoiceItemId, storageId);
    
    if (!inventory) {
      throw new NotFoundException(`Inventory with invoiceItemId ${invoiceItemId} and storageId ${storageId} not found`);
    }
    
    return inventory;
  }

  async create(createInventoryDto: {
    invoiceItemId: number;
    storageId: number;
    quantity: string;
  }) {
    // Verificar se já existe inventário para esse invoice item nesse storage
    const existingInventory = await this.inventoryRepository.findByInvoiceItemAndStorage(
      createInventoryDto.invoiceItemId,
      createInventoryDto.storageId
    );
    
    if (existingInventory) {
      throw new ConflictException('Inventory for this invoice item and storage already exists');
    }

    return await this.inventoryRepository.create(createInventoryDto);
  }

  async update(uuid: string, updateInventoryDto: {
    invoiceItemId?: number;
    storageId?: number;
    quantity?: string;
  }) {
    // Verificar se inventory existe
    await this.findByUuid(uuid);

    // Se estiver atualizando invoiceItemId ou storageId, verificar duplicação
    if (updateInventoryDto.invoiceItemId || updateInventoryDto.storageId) {
      const currentInventory = await this.inventoryRepository.findByUuid(uuid);
      const invoiceItemId = updateInventoryDto.invoiceItemId || currentInventory.materialId;
      const storageId = updateInventoryDto.storageId || currentInventory.storageId;
      
      const existingInventory = await this.inventoryRepository.findByInvoiceItemAndStorage(invoiceItemId, storageId);
      if (existingInventory && existingInventory.uuid !== uuid) {
        throw new ConflictException('Inventory for this invoice item and storage already exists');
      }
    }

    return await this.inventoryRepository.update(uuid, updateInventoryDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.inventoryRepository.delete(uuid);
  }
}