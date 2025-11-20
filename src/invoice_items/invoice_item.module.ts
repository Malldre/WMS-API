import { Module } from '@nestjs/common';
import { InvoiceItemService } from './invoice_item.service';
import { InvoiceItemController } from './invoice_item.controller';
import { InvoiceItemRepository } from './invoice_item.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService, InvoiceItemRepository],
  exports: [InvoiceItemService],
})
export class InvoiceItemModule {}