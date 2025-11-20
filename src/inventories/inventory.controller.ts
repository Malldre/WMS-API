import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventories')
//@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async findAll() {
    return await this.inventoryService.findAll();
  }

  @Get('search')
  async findByInvoiceItemAndStorage(
    @Query('invoiceItemId') invoiceItemId: string,
    @Query('storageId') storageId: string
  ) {
    return await this.inventoryService.findByInvoiceItemAndStorage(
      parseInt(invoiceItemId),
      parseInt(storageId)
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.inventoryService.findByUuid(uuid);
  }

  @Get('invoice-item/:invoiceItemId')
  async findByInvoiceItem(@Param('invoiceItemId') invoiceItemId: string) {
    return await this.inventoryService.findByInvoiceItemId(parseInt(invoiceItemId));
  }

  @Get('storage/:storageId')
  async findByStorage(@Param('storageId') storageId: string) {
    return await this.inventoryService.findByStorageId(parseInt(storageId));
  }

  @Post()
  async create(@Body() body: {
    invoiceItemId: number;
    storageId: number;
    quantity: string;
  }) {
    return await this.inventoryService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      invoiceItemId?: number;
      storageId?: number;
      quantity?: string;
    }
  ) {
    return await this.inventoryService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.inventoryService.remove(uuid);
  }
}