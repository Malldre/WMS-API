import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { MaterialRepository } from './material.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [MaterialController],
  providers: [MaterialService, MaterialRepository],
  exports: [MaterialService],
})
export class MaterialModule {}