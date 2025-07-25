import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequestAttendanceController } from './request-attendance.controller';
import { RequestAttendanceStoreService } from './services/request-attendance-store.service';
import { RequestAttendanceUpdateService } from './services/request-attendance-update.service';
import { RequestAttendanceDeleteService } from './services/request-attendnce-delete.service';
import { RequestAttendanceListService } from './services/request-attendance-list.service';
import { DbService } from '../../config/database.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [RequestAttendanceController],
  providers: [
    RequestAttendanceStoreService,
    RequestAttendanceUpdateService,
    RequestAttendanceDeleteService,
    RequestAttendanceListService,
    DbService,
  ],
})
export class RequestAttendanceModule {}
