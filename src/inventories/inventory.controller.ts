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
  async findByMaterialAndStorage(
    @Query('materialId') materialId: string,
    @Query('storageId') storageId: string
  ) {
    return await this.inventoryService.findByMaterialAndStorage(
      parseInt(materialId),
      parseInt(storageId)
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.inventoryService.findByUuid(uuid);
  }

  @Get('material/:materialId')
  async findByMaterial(@Param('materialId') materialId: string) {
    return await this.inventoryService.findByMaterialId(parseInt(materialId));
  }

  @Get('storage/:storageId')
  async findByStorage(@Param('storageId') storageId: string) {
    return await this.inventoryService.findByStorageId(parseInt(storageId));
  }

  @Post()
  async create(@Body() body: {
    materialId: number;
    storageId: number;
    quantity: string;
  }) {
    return await this.inventoryService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      materialId?: number;
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