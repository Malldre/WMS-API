import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Get()
  async findAll() {
    return await this.invoiceService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.invoiceService.findByUuid(uuid);
  }

  @Post()
  async create(@Body() body: {
    invoiceNumber: string;
    supplierId: number;
    receivedAt: Date;
    status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
    createdById: number;
  }) {
    return await this.invoiceService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      invoiceNumber?: string;
      supplierId?: number;
      receivedAt?: Date;
      status?: 'PENDING' | 'RECEIVED' | 'REJECTED' | 'CANCELLED' | 'WAITING_INSPECTION';
      changedById?: number;
    }
  ) {
    return await this.invoiceService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.invoiceService.remove(uuid);
  }
}