import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { SupplierRepository } from './supplier.repository';
import { DbModule } from '../db/db.module';
import { CompanyModule } from '../companies/company.module';

@Module({
  imports: [DbModule, CompanyModule],
  controllers: [SupplierController],
  providers: [SupplierService, SupplierRepository],
  exports: [SupplierService],
})
export class SupplierModule {}