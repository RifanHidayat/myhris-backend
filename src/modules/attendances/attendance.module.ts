import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeeController } from './dashboard.controller';
import { DashboardService } from './services/placecoordinate-service';

import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule], // jangan lupa import ConfigModule di sini
  controllers: [EmployeeController],
  providers: [DashboardService, DbService],
})
export class EmployeeModule {}
