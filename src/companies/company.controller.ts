import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('companies')
//@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  async findAll() {
    return await this.companyService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.companyService.findByUuid(uuid);
  }

  @Get('cnpj/:cnpj')
  async findByCnpj(@Param('cnpj') cnpj: string) {
    return await this.companyService.findByCnpj(cnpj);
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
    return await this.companyService.create(body);
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
    return await this.companyService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.companyService.remove(uuid);
  }
}