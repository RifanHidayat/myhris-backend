import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceListService } from './services/attendance.list.services';
import { SubmitAttendanceService } from './services/submit-attendance.services';
import { SubmitAttendanceBreakService } from './services/submit-attendance-break.services';
import { PlaceCoordinateService } from './services/placecoordinate-service';
import { DbService } from '../../config/database.service';
import { SftpService } from '../../config/sftp.service';
import { FcmService } from '../../common/fcm.service';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceListService,
    SubmitAttendanceService,
    SubmitAttendanceBreakService,
    PlaceCoordinateService,
    DbService,
    SftpService,
    FcmService,
  ],
  exports: [
    AttendanceListService,
    SubmitAttendanceService,
    SubmitAttendanceBreakService,
    PlaceCoordinateService,
  ],
})
export class AttendanceModule {}
