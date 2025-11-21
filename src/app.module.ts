import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { InvoiceModule } from './invoices/invoice.module';
import { InvoiceItemModule } from './invoice_items/invoice_item.module';
import { SupplierModule } from './suppliers/supplier.module';
import { CompanyModule } from './companies/company.module';
import { MaterialModule } from './materials/material.module';
import { MaterialCategoryModule } from './material_categories/material_category.module';
import { TasksModule } from './tasks/tasks.module';
import { InventoryModule } from './inventories/inventory.module';
import { StorageModule } from './storages/storage.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DbModule,
    AuthModule,
    UsersModule,
    InvoiceModule,
    InvoiceItemModule,
    SupplierModule,
    CompanyModule,
    MaterialModule,
    MaterialCategoryModule,
    TasksModule,
    InventoryModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}