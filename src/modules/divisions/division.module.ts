import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { DivisionController } from './division.controller';
import { DivisionListService } from './service/division.list.service';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [DivisionController],
  providers: [
    DivisionListService,
    DbService,
  ],
  exports: [
    DivisionListService,
  ],
})
export class DivisionModule {}
