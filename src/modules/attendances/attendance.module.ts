import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeeController } from './attendance.controller';
import { AttendanceListService } from './services/attendance.list.services';
import { SubmitAttendanceService } from './services/submit-attendance.services';
import { SubmitAttendanceBreakService } from './services/submit-attendance-break.services';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule],
  controllers: [EmployeeController],
  providers: [
    AttendanceListService,
    SubmitAttendanceService,
    SubmitAttendanceBreakService,
  ],
})
export class AttendanceModule {}
