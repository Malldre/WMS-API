import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MaterialService } from './material.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('materials')
//@UseGuards(JwtAuthGuard)
export class MaterialController {
  constructor(private materialService: MaterialService) {}

  @Get()
  async findAll() {
    return await this.materialService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.materialService.findByUuid(uuid);
  }

  @Get('external-code/:externalCode')
  async findByExternalCode(@Param('externalCode') externalCode: string) {
    return await this.materialService.findByExternalCode(externalCode);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.materialService.findByCategoryId(parseInt(categoryId));
  }

  @Post()
  async create(@Body() body: {
    externalCode: string;
    categoryId: number;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
  }) {
    return await this.materialService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      externalCode?: string;
      categoryId?: number;
      description?: string;
      materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
      status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DEVELOPMENT';
    }
  ) {
    return await this.materialService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.materialService.remove(uuid);
  }
}