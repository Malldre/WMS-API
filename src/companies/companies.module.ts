import { Module } from '@nestjs/common';
import { InvoiceItemService } from './companies.service';
import { InvoiceItemController } from './companies.controller';
import { InvoiceItemRepository } from './companies.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService, InvoiceItemRepository],
  exports: [InvoiceItemService],
})
export class InvoiceItemModule {}