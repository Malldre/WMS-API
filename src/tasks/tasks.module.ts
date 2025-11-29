import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { InvoiceItemModule } from '../invoice_items/invoice_item.module';
import { MaterialModule } from 'src/materials/material.module';
import { InventoryModule } from '../inventories/inventory.module';
import { StorageModule } from '../storages/storage.module';

@Module({
  imports: [InvoiceItemModule, MaterialModule, InventoryModule, StorageModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}