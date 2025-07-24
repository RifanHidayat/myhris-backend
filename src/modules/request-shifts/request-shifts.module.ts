import { Module } from '@nestjs/common';
import { RequestShiftsController } from './request-shifts.controller';
import { RequestShiftsStoreService, RequestShiftsUpdateService, RequestShiftsDeleteService } from './services';

@Module({
  controllers: [RequestShiftsController],
  providers: [RequestShiftsStoreService, RequestShiftsUpdateService, RequestShiftsDeleteService],
})
export class RequestShiftsModule {} 