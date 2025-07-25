import { Module } from '@nestjs/common';
import { RequestShiftsController } from './request-shifts.controller';
import {
  RequestShiftsStoreService,
  RequestShiftsUpdateService,
  RequestShiftsDeleteService,
} from './services';
import { RequestShiftListService } from './services/request-shift-list.service';

@Module({
  controllers: [RequestShiftsController],
  providers: [
    RequestShiftsStoreService,
    RequestShiftsUpdateService,
    RequestShiftsDeleteService,
    RequestShiftListService,
  ],
})
export class RequestShiftsModule {}
