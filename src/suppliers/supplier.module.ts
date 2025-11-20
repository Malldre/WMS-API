import { Module } from '@nestjs/common';
import { InvoiceItemService } from './supplier.service';
import { InvoiceItemController } from './supplier.controller';
import { InvoiceItemRepository } from './supplier.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService, InvoiceItemRepository],
  exports: [InvoiceItemService],
})
export class InvoiceItemModule {}