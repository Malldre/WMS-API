import { Module } from '@nestjs/common';
import { InvoiceItemController } from './invoice_item.controller';
import { InvoiceItemService } from './invoice_item.service';
import { InvoiceItemRepository } from './invoice_item.repository';

@Module({
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService, InvoiceItemRepository],
  exports: [InvoiceItemService, InvoiceItemRepository],
})
export class InvoiceItemModule {}