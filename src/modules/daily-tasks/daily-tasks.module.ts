import { Module } from '@nestjs/common';
import { DailyTasksController } from './daily-tasks.controller';
import {
  DailyTasksStoreService,
  DailyTasksUpdateService,
  DailyTasksDeleteService,
} from './services';

@Module({
  controllers: [DailyTasksController],
  providers: [
    DailyTasksStoreService,
    DailyTasksUpdateService,
    DailyTasksDeleteService,
  ],
})
export class DailyTasksModule {}
