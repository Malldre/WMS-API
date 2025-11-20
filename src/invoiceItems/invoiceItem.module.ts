import { Module } from '@nestjs/common';
import { InvoiceItemService } from './invoiceItem.service';
import { InvoiceItemController } from './invoiceItem.controller';
import { InvoiceItemRepository } from './invoiceItem.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService, InvoiceItemRepository],
  exports: [InvoiceItemService],
})
export class InvoiceItemModule {}