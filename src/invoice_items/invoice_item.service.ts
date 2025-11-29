import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceItemRepository } from './invoice_item.repository';
import * as schema from '../db/schema';

@Injectable()
export class InvoiceItemService {
  constructor(private readonly invoiceItemRepository: InvoiceItemRepository) {}

  async findAll() {
    return await this.invoiceItemRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const invoiceItem = await this.invoiceItemRepository.findByUuid(uuid);

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with UUID ${uuid} not found`);
    }

    return invoiceItem;
  }

  async findByInvoiceId(invoiceId: number) {
    return await this.invoiceItemRepository.findByInvoiceId(invoiceId);
  }

  async findByInvoiceUuid(invoiceUuid: string) {
    const items = await this.invoiceItemRepository.findByInvoiceUuid(invoiceUuid);
    
    if (items === null) {
      throw new NotFoundException(`Invoice with UUID ${invoiceUuid} not found`);
    }
    
    return items;
  }

  async findByInvoiceAndMaterial(invoiceId: number, materialId: number) {
    const item = await this.invoiceItemRepository.findByInvoiceAndMaterial(
      invoiceId,
      materialId,
    );

    if (!item) {
      throw new NotFoundException(
        `Invoice item not found for invoice ${invoiceId} and material ${materialId}`,
      );
    }

    return item;
  }

  async create(invoiceItem: typeof schema.invoiceItems.$inferInsert) {
    return await this.invoiceItemRepository.create(invoiceItem);
  }

  async update(
    uuid: string,
    invoiceItem: Partial<typeof schema.invoiceItems.$inferInsert>,
  ) {
    const existingItem = await this.invoiceItemRepository.findByUuid(uuid);

    if (!existingItem) {
      throw new NotFoundException(`Invoice item with UUID ${uuid} not found`);
    }

    return await this.invoiceItemRepository.update(uuid, invoiceItem);
  }

  async updateStatus(uuid: string, status: string) {
    const existingItem = await this.invoiceItemRepository.findByUuid(uuid);

    if (!existingItem) {
      throw new NotFoundException(`Invoice item with UUID ${uuid} not found`);
    }

    return await this.invoiceItemRepository.update(uuid, { status: status as any });
  }

  async delete(uuid: string) {
    const existingItem = await this.invoiceItemRepository.findByUuid(uuid);

    if (!existingItem) {
      throw new NotFoundException(`Invoice item with UUID ${uuid} not found`);
    }

    return await this.invoiceItemRepository.delete(uuid);
  }
}