import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './services/dashboard-service';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule], // jangan lupa import ConfigModule di sini
  controllers: [DashboardController],
  providers: [DashboardService, DbService],
})
export class DashboardModule {}
