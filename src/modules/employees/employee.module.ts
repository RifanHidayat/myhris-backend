import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeeController } from './employee.controller';
import { EmployeeDetailService } from './services/employee-detail-service';
import { EmployeeListService } from './services/employee-list-service';
import { EemployeeLastAttendanceService } from './services/eemployee-last-attendance';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule],
  controllers: [EmployeeController],
  providers: [EmployeeDetailService, EmployeeListService, EemployeeLastAttendanceService],
})
export class EmployeeModule {}
