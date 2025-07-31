import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivitiesController } from './activity.cotroller';
import { InfoService } from './services/info.service';
import { LogActivitySearchService } from './services/log-activity-search.service';
import { DbService } from '../../config/database.service';
import { CommonModule } from '../../common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, CommonModule, AuthModule],
  controllers: [ActivitiesController],
  providers: [
    InfoService,
    LogActivitySearchService,
    DbService,
  ],
})
export class ActivitiesModule {} 