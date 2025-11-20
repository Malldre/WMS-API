import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceItemRepository } from './invoice_item.repository';

@Injectable()
export class InvoiceItemService {
  constructor(private readonly invoiceItemRepository: InvoiceItemRepository) {}

  async findAll() {
    return await this.invoiceItemRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const item = await this.invoiceItemRepository.findByUuid(uuid);
    
    if (!item) {
      throw new NotFoundException(`Invoice item with UUID ${uuid} not found`);
    }
    
    return item;
  }

  async findByInvoiceId(invoiceId: number) {
    return await this.invoiceItemRepository.findByInvoiceId(invoiceId);
  }

  async create(createItemDto: {
    invoiceId: number;
    materialId: number;
    quantity: string;
    totalValue: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
    createdById: number;
  }) {
    return await this.invoiceItemRepository.create(createItemDto);
  }

  async update(uuid: string, updateItemDto: {
    quantity?: string;
    totalValue?: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
    changedById?: number;
  }) {
    await this.findByUuid(uuid);
    return await this.invoiceItemRepository.update(uuid, updateItemDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.invoiceItemRepository.delete(uuid);
  }

  async updateStatus(uuid: string, status: string, changedById: number) {
    return await this.update(uuid, { 
      status: status as any, 
      changedById 
    });
  }
}