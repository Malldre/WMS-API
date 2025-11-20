import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('suppliers')
//@UseGuards(JwtAuthGuard)
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  async findAll() {
    return await this.supplierService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.supplierService.findByUuid(uuid);
  }

  @Get('cnpj/:cnpj')
  async findByCnpj(@Param('cnpj') cnpj: string) {
    return await this.supplierService.findByCnpj(cnpj);
  }

  @Post()
  async create(@Body() body: {
    cnpj: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  }) {
    return await this.supplierService.create(body);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: {
      cnpj?: string;
      name?: string;
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    }
  ) {
    return await this.supplierService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.supplierService.remove(uuid);
  }
}