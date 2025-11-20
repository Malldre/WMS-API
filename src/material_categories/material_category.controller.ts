import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MaterialCategoryService } from './material_category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('material-categories')
//@UseGuards(JwtAuthGuard)
export class MaterialCategoryController {
  constructor(private materialCategoryService: MaterialCategoryService) {}

  @Get()
  async findAll() {
    return await this.materialCategoryService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.materialCategoryService.findByUuid(uuid);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    return await this.materialCategoryService.findByName(name);
  }

  @Post()
  async create(@Body() body: {
    name: string;
    description: string;
    materialUnit: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
  }) {
    return await this.materialCategoryService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      name?: string;
      description?: string;
      materialUnit?: 'BX' | 'CM' | 'GR' | 'KG' | 'LT' | 'M2' | 'M3' | 'ML' | 'MT' | 'PK' | 'UN';
    }
  ) {
    return await this.materialCategoryService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.materialCategoryService.remove(uuid);
  }
}