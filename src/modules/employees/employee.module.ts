import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { EmployeeController } from './employee.controller';
import { EmployeeDetailService } from './services/employee-detail-service';
import { EmployeeListService } from './services/employee-list-service';
import { EmployeeLastAttendanceService } from './services/employee-last-attendance';
import { EmployeeDelegationService } from './services/employee-delegation.service';
import { EmployeeDivisionService } from './services/employee-division.service';
import { EmployeeFieldAssignmentsService } from './services/employee-field-assignments.service';

import { DbService } from '../../config/database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, CommonModule, AuthModule],
  controllers: [EmployeeController],
  providers: [
    EmployeeDetailService,
    EmployeeListService,
    EmployeeLastAttendanceService,
    EmployeeDelegationService,
    EmployeeDivisionService,
    EmployeeFieldAssignmentsService,
    DbService,
  ],
  exports: [
    EmployeeDetailService,
    EmployeeListService,
    EmployeeLastAttendanceService,
    EmployeeDelegationService,
    EmployeeDivisionService,
    EmployeeFieldAssignmentsService,
  ],
})
export class EmployeeModule {}
