import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InvoiceRepository } from './invoice.repository';

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async findAll() {
    return await this.invoiceRepository.findAll();
  }

  async findByUuid(uuid: string) {
    const invoice = await this.invoiceRepository.findByUuid(uuid);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with UUID ${uuid} not found`);
    }
    
    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with number ${invoiceNumber} not found`);
    }
    
    return invoice;
  }

  async create(createInvoiceDto: {
    invoiceNumber: string;
    supplierId: number;
    receivedAt: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
    createdById: number;
  }) {
    // Verificar se número da nota já existe
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(createInvoiceDto.invoiceNumber);
    if (existingInvoice) {
      throw new ConflictException('Invoice number already exists');
    }

    return await this.invoiceRepository.create(createInvoiceDto);
  }

  async update(uuid: string, updateInvoiceDto: {
    invoiceNumber?: string;
    supplierId?: number;
    receivedAt?: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
    changedById?: number;
  }) {
    // Verificar se invoice existe
    await this.findByUuid(uuid);

    // Se estiver atualizando o número da nota, verificar duplicação
    if (updateInvoiceDto.invoiceNumber) {
      const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(updateInvoiceDto.invoiceNumber);
      if (existingInvoice && existingInvoice.uuid !== uuid) {
        throw new ConflictException('Invoice number already exists');
      }
    }

    return await this.invoiceRepository.update(uuid, updateInvoiceDto);
  }

  async remove(uuid: string) {
    await this.findByUuid(uuid);
    return await this.invoiceRepository.softDelete(uuid);
  }
}