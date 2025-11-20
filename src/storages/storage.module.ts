import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { StorageRepository } from './storage.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [StorageController],
  providers: [StorageService, StorageRepository],
  exports: [StorageService],
})
export class StorageModule {}