import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequestDayOffController } from './request-day-off.controller';
import { RequestDayOffListService } from './services/request-day-off-list.service';
import { RequestDayOffStoreService } from './services/request-day-off-store.service';
import { RequestDayOffUpdateService } from './services/request-day-off.update-service';
import { RequestDayOffDeleteService } from './services/request-day-off-delete.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [RequestDayOffController],
  providers: [
    RequestDayOffListService,
    RequestDayOffStoreService,
    RequestDayOffUpdateService,
    RequestDayOffDeleteService,
  ],
})
export class RequestDayOffModule {}
