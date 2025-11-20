import { Module } from '@nestjs/common';
import { MaterialCategoryService } from './material_category.service';
import { MaterialCategoryController } from './material_category.controller';
import { MaterialCategoryRepository } from './material_category.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [MaterialCategoryController],
  providers: [MaterialCategoryService, MaterialCategoryRepository],
  exports: [MaterialCategoryService],
})
export class MaterialCategoryModule {}