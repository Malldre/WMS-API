import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InvoiceItemService } from './invoice_item.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as schema from '../db/schema';

@Controller('invoice-items')
@UseGuards(JwtAuthGuard)
export class InvoiceItemController {
  constructor(private readonly invoiceItemService: InvoiceItemService) {}

  @Get()
  async findAll() {
    return await this.invoiceItemService.findAll();
  }

  @Get('invoice/:invoiceUuid')
  async findByInvoiceUuid(@Param('invoiceUuid') invoiceUuid: string) {
    return await this.invoiceItemService.findByInvoiceUuid(invoiceUuid);
  }

  @Get(':uuid')
  async findByUuid(@Param('uuid') uuid: string) {
    return await this.invoiceItemService.findByUuid(uuid);
  }

  @Post()
  async create(@Body() invoiceItem: typeof schema.invoiceItems.$inferInsert) {
    return await this.invoiceItemService.create(invoiceItem);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() invoiceItem: Partial<typeof schema.invoiceItems.$inferInsert>,
  ) {
    return await this.invoiceItemService.update(uuid, invoiceItem);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    return await this.invoiceItemService.delete(uuid);
  }
}