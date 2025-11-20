import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { MaterialCategoryController } from './material_category.controller';
import { MaterialCategoryService } from './material_category.service';

@Module({
  imports: [DbModule],
  controllers: [MaterialCategoryController],
  providers: [MaterialCategoryService],
  exports: [MaterialCategoryService],
})
export class MaterialCategoryModule {}
