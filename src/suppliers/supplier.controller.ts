import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InvoiceItemService } from './supplier.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoice-items')
@UseGuards(JwtAuthGuard)
export class InvoiceItemController {
  constructor(private invoiceItemService: InvoiceItemService) {}

  @Get()
  async findAll() {
    return await this.invoiceItemService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.invoiceItemService.findByUuid(uuid);
  }

  @Get('invoice/:invoiceId')
  async findByInvoice(@Param('invoiceId') invoiceId: string) {
    return await this.invoiceItemService.findByInvoiceId(parseInt(invoiceId));
  }

  @Post()
  async create(@Body() body: {
    invoiceId: number;
    materialId: number;
    quantity: string;
    totalValue: string;
    status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
    remark?: string;
    createdById: number;
  }) {
    return await this.invoiceItemService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      quantity?: string;
      totalValue?: string;
      status?: 'DIVERGENT' | 'CONFORMING' | 'COUNTING' | 'DAMAGED' | 'MISSING' | 'MISMATCHED' | 'WAITING';
      remark?: string;
      changedById?: number;
    }
  ) {
    return await this.invoiceItemService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.invoiceItemService.remove(uuid);
  }
}