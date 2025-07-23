import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeeController } from './employee.controller';
import { EmployeeDetailService } from './services/employee-detail-service';
import { EmployeeListService } from './services/employee-list-service';

import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule], // jangan lupa import ConfigModule di sini
  controllers: [EmployeeController],
  providers: [EmployeeDetailService, EmployeeListService, DbService],
})
export class EmployeeModule {}
