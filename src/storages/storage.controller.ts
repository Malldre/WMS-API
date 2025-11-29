import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('storages')
//@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Get()
  async findAll() {
    return await this.storageService.findAll();
  }

  @Get('names/list')
  async getAllNames() {
    return await this.storageService.getAllStorageNames();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.storageService.findByUuid(uuid);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.storageService.findByCode(code);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return await this.storageService.findByCompanyId(parseInt(companyId));
  }

  @Post()
  async create(@Body() body: {
    code: string;
    name: string;
    companyId: number;
  }) {
    return await this.storageService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      code?: string;
      name?: string;
      companyId?: number;
    }
  ) {
    return await this.storageService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.storageService.remove(uuid);
  }
}